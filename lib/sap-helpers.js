// Helper function to extract UUID from SAP URLs or raw identifiers
export function extractUuid(inputStr) {
  // Regex pattern matching the standard 8-4-4-4-12 UUID format
  const match = inputStr.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  // Return the matched string if found, otherwise return null
  return match ? match[0] : null;
// Close extractUuid function block
}

// Helper function to recursively extract text values from JSON structure
export function extractStringsFromJson(data) {
  // Check if current item is a string type
  if (typeof data === "string") {
    // Return array containing the string
    return [data];
  // Check if current item is an array type
  } else if (Array.isArray(data)) {
    // Initialize results container for arrays
    let result = [];
    // Loop through each element in array
    for (const item of data) {
      // Concatenate recursively extracted strings
      result = result.concat(extractStringsFromJson(item));
    // Close array elements loop
    }
    // Return the accumulated results array
    return result;
  // Check if current item is a non-null object type
  } else if (data !== null && typeof data === "object") {
    // Initialize results container for objects
    let result = [];
    // Loop through key-value pairs of object
    for (const [key, val] of Object.entries(data)) {
      // Exclude structural and styling keys from text extraction
      if (!["id", "uuid", "url", "type", "image", "icon", "style", "css", "className", "position", "width", "height"].includes(key)) {
        // Concatenate recursively extracted strings from value
        result = result.concat(extractStringsFromJson(val));
      // Close keys check block
      }
    // Close key-value loop
    }
    // Return the accumulated results array
    return result;
  // Close object type check block
  }
  // Return empty array for other types (numbers, booleans, null)
  return [];
// Close extractStringsFromJson function block
}

// Helper function to clean extracted text arrays and remove tags
export function cleanExtractedText(textList) {
  // Combine all strings using space delimiter
  const combined = textList.join(" ");
  // Strip HTML tags using regular expression replacement
  let cleaned = combined.replace(/<[^>]*>?/gm, "");
  // Replace multiple spaces and newlines with a single space
  cleaned = cleaned.replace(/\s+/g, " ");
  // Strip basic Markdown styling characters
  cleaned = cleaned.replace(/[\#\*\_]+/g, " ");
  // Return cleaned and trimmed string
  return cleaned.trim();
// Close cleanExtractedText function block
}

// Core scraper function to fetch and parse SAP lesson contents
export async function fetchSapLessonContent(item, sap_cookie) {
  // Attempt to extract UUID pattern from inputs
  const unit_id = extractUuid(item);
  // Set Next.js metadata page format flag to false
  let is_next_data = false;
  // Initialize endpoint URL string
  let sap_api_url = "";
  // Initialize resolved unit ID string
  let extracted_unit_id = "";
  // Check if UUID was not detected
  if (!unit_id) {
    // Trim Whitespaces from input item
    let url = item.trim();
    // Prepend SAP learning domain name if prefix is missing
    if (!url.startsWith("http")) {
      // Prepend domain prefix
      url = "https://learning.sap.com/" + url.replace(/^\//, "");
    // Close URL prefix check block
    }
    // Search for course/lesson slug pattern inside the URL
    const match_slug = url.match(/courses\/([^?#]+)/i);
    // Validate if slug pattern matches
    if (match_slug) {
      // Extract matched slug, removing trailing slash
      extracted_unit_id = match_slug[1].replace(/\/$/, "");
    // Fallback if slug pattern does not match
    } else {
      // Extract last segment of path or set default slug
      extracted_unit_id = url.split("/").pop() || "sap-lesson";
    // Close slug match check block
    }
    // Set target fetch URL to the direct page URL
    sap_api_url = url;
    // Set Next.js html data parsing flag to true
    is_next_data = true;
  // If UUID was detected
  } else {
    // Assign UUID as the unit identifier
    extracted_unit_id = unit_id;
    // Construct standard JSON API endpoint URL
    sap_api_url = `https://learning.sap.com/api/v1/units/${unit_id}`;
  // Close UUID check block
  }
  // Setup standard headers for request authentication
  const headers = {
    // Provide standard browser User-Agent
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    // Specify accepted media types
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,application/json,text/plain,*/*",
  // Close headers structure
  };
  // Check if the custom SAP cookie is provided
  if (sap_cookie) {
    // Set custom session cookie inside headers
    headers["Cookie"] = `SAP_SESSION_COOKIE=${sap_cookie}`;
  // Close cookie validation block
  }
  // Fetch lesson page resource contents via fetch API
  const response = await fetch(sap_api_url, {
    // Specify HTTP GET method
    method: "GET",
    // Pass headers
    headers: headers,
  // Close fetch options block
  });
  // Verify if fetch request was not successful
  if (!response.ok) {
    // Throw error containing status code and requested url
    throw new Error(`SAP API HTTP Error ${response.status} on '${sap_api_url}': Check cookie validity if this content requires login.`);
  // Close response check block
  }
  // Initialize variable for unit title
  let unit_title = "";
  // Initialize array to hold raw text nodes
  let raw_texts = [];
  // Verify if parsing NEXT_DATA html payload
  if (is_next_data) {
    // Parse response body as text HTML string
    const html = await response.text();
    // Search for NEXT_DATA script tag containing JSON
    const match_next = html.match(new RegExp('<script id="__NEXT_DATA__" type="application/json">(.*?)</script>'));
    // Check if tag is not found
    if (!match_next) {
      // Throw structure parsing exception
      throw new Error(`Could not find __NEXT_DATA__ payload in page HTML from '${sap_api_url}'.`);
    // Close tag validation check block
    }
    // Parse script tag inner content as JSON object
    const page_data = JSON.parse(match_next[1]);
    // Navigate into pageProps page object
    const page_props = page_data.props?.pageProps || {};
    // Extract lesson dictionary or default to pageProps
    const lesson_data = page_props.lesson || page_props;
    // Get lesson title or set fallback title using slug ID
    unit_title = lesson_data.title || `Lesson ${extracted_unit_id}`;
    // Extract strings recursively from lesson dictionary
    raw_texts = extractStringsFromJson(lesson_data);
  // Verify if parsing standard JSON response
  } else {
    // Parse response body as JSON object
    const unit_json = await response.json();
    // Get unit title or set fallback title
    unit_title = unit_json.title || `Unit ${extracted_unit_id}`;
    // Extract strings recursively from unit object
    raw_texts = extractStringsFromJson(unit_json);
  // Close data type parser checks
  }
  // Clean raw text nodes into single trimmed plaintext string
  const cleaned_text = cleanExtractedText(raw_texts);
  // Validate if extracted content size is insufficient
  if (!cleaned_text || cleaned_text.length < 100) {
    // Throw text size validation error
    throw new Error(`Failed to extract enough educational content from SAP for '${extracted_unit_id}'.`);
  // Close size check block
  }
  // Return resolved lesson data structure
  return {
    // Return unit ID slug
    unit_id: extracted_unit_id,
    // Return unit title
    title: unit_title,
    // Return cleaned text contents
    text: cleaned_text,
  // Close return dictionary
  };
// Close fetchSapLessonContent function block
}
