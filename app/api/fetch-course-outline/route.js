// Import the Next.js response helper class
import { NextResponse } from "next/server";

// Export the asynchronous POST handler function
export async function POST(request) {
  // Begin the main try block for error handling
  try {
    // Parse the request body parameters as JSON
    const params = await request.json();
    // Retrieve and trim the course URL from params
    let course_url = (params.course_url || "").trim();
    // Resolve SAP session cookie from parameters or server env
    const sap_cookie = (process.env.SAP_SESSION_COOKIE || "").trim();
    // Validate if the course URL is provided
    if (!course_url) {
      // Throw an error if URL parameter is missing
      throw new Error("Missing course URL.");
    // Close the validation block
    }
    // Check if the URL starts with HTTP protocol prefix
    if (!course_url.startsWith("http")) {
      // Prepend the learning.sap.com domain and format URL
      course_url = "https://learning.sap.com/courses/" + course_url.replace(/^\//, "");
    // Close protocol check block
    }
    // Setup request headers to mock a desktop browser request
    const headers = {
      // Set desktop User-Agent string
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      // Set Accept headers accepting standard media types
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,application/json,text/plain,*/*",
    // Close headers dictionary definition
    };
    // Check if the SAP session cookie is available
    if (sap_cookie) {
      // Inject the SAP cookie in the request headers
      headers["Cookie"] = `SAP_SESSION_COOKIE=${sap_cookie}`;
    // Close cookie injection check block
    }
    // Send HTTP GET request to fetch the course page HTML
    const response = await fetch(course_url, {
      // Specify the GET HTTP method
      method: "GET",
      // Supply mock browser headers
      headers: headers,
    // Close fetch parameters definition
    });
    // Check if request response is not successful
    if (!response.ok) {
      // Throw authorization/network exception with status code
      throw new Error(`SAP API HTTP Error ${response.status} on '${course_url}': Check cookie validity if this course requires login.`);
    // Close response check block
    }
    // Retrieve the page HTML content as text string
    const html = await response.text();
    // Search for next.js metadata script tag containing JSON data
    const match = html.match(new RegExp('<script id="__NEXT_DATA__" type="application/json">(.*?)</script>'));
    // Validate if the NEXT_DATA tag could not be found
    if (!match) {
      // Throw structure extraction exception
      throw new Error(`Could not find course structure payload in page HTML from '${course_url}'.`);
    // Close regex validation block
    }
    // Parse the matched JSON string content into a JS object
    const page_data = JSON.parse(match[1]);
    // Navigate into pageProps properties or default to empty object
    const page_props = page_data.props?.pageProps || {};
    // Extract the standaloneCourse details object
    const course = page_props.standaloneCourse || {};
    // Get the course title or set standard fallback label
    const course_title = course.title || "Course";
    // Extract the course URL slug identifier
    const course_slug = course.slug || "";
    // Get the child courses list array
    const courses_list = course.courses || [];
    // Initialize array to hold syllabus structure
    const outline = [];
    // Verify if course list has elements
    if (courses_list.length > 0) {
      // Extract unit children elements from course object
      const units = courses_list[0].children || [];
      // Loop through each unit object
      for (const unit of units) {
        // Validate if the object type is unit
        if (unit.objType === "unit") {
          // Get the unit title or default
          const unit_title = unit.title || "Unit";
          // Initialize list for lesson elements
          const lessons = [];
          // Get child lesson elements from unit
          const children = unit.children || [];
          // Loop through children elements
          for (const child of children) {
            // Verify if child element type matches lesson
            if (child.objType === "lesson") {
              // Get lesson title
              const lesson_title = child.title || "Lesson";
              // Get lesson slug
              const lesson_slug = child.slug || "";
              // Construct the full learning sap lesson URL
              const lesson_url = `https://learning.sap.com/courses/${course_slug}/${lesson_slug}`;
              // Add structured lesson object to lessons array
              lessons.push({
                // Set lesson title
                title: lesson_title,
                // Set lesson slug
                slug: lesson_slug,
                // Set lesson URL
                url: lesson_url,
              // Close lesson object dictionary
              });
            // Close lesson verification block
            }
          // Close child loop
          }
          // Add unit block structure to outline array
          outline.push({
            // Set unit title
            title: unit_title,
            // Set lessons array
            lessons: lessons,
          // Close unit object dictionary
          });
        // Close unit validation block
        }
      // Close unit loop
      }
    // Close course list validation block
    }
    // Return successful course syllabus outlines JSON response
    return NextResponse.json({ success: true, title: course_title, outline });
  // Catch any errors raised during processing
  } catch (error) {
    // Return an error JSON response with 500 status code
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  // Close catch block
  }
// Close POST handler block
}
