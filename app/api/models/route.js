// Import the Next.js response helper class
import { NextResponse } from "next/server";

// Export the asynchronous POST handler function
export async function POST(request) {
  // Begin the main try block for error handling
  try {
    // Parse the request body parameters as JSON
    const params = await request.json();
    // Resolve the Gemini API key from parameters or server env
    const gemini_key = (params.gemini_api_key || "").trim() || (process.env.GEMINI_API_KEY || "").trim();
    // Validate if the Gemini API key is missing
    if (!gemini_key) {
      // Throw an error if the key is not provided
      throw new Error("Missing Gemini API Key. Provide it in .env or via UI.");
    // Close the key validation block
    }
    // Construct the endpoint URL for querying available models
    const api_url = `https://generativelanguage.googleapis.com/v1beta/models?key=${gemini_key}`;
    // Fetch the list of models from Google generative API
    const response = await fetch(api_url, {
      // Specify the HTTP GET request method
      method: "GET",
      // Set the JSON content type headers
      headers: {
        // Declare JSON format expectation
        "Content-Type": "application/json",
      // Close headers configuration
      },
    // Close fetch request configuration options
    });
    // Check if the response status is not successful
    if (!response.ok) {
      // Retrieve the raw response error text
      const errorText = await response.text();
      // Throw an error wrapping the API response message
      throw new Error(`Gemini API Error: ${errorText}`);
    // Close response status validation block
    }
    // Parse the API response body as JSON data
    const resp_data = await response.json();
    // Retrieve the raw models array or default to empty list
    const raw_models = resp_data.models || [];
    // Initialize an array to accumulate qualified text models
    const models = [];
    // Loop through each raw model entry in the array
    for (const model of raw_models) {
      // Extract the last path segment of the model name as the ID
      const model_id = model.name.split("/").pop();
      // Resolve the model display name or fallback to the ID
      const display_name = model.displayName || model_id;
      // Get the supported generation capabilities array
      const supported_methods = model.supportedGenerationMethods || [];
      // Verify if the model supports content generation
      if (supported_methods.includes("generateContent")) {
        // Add the processed model parameters to the accumulator
        models.push({ id: model_id, name: display_name });
      // Close capabilities validation block
      }
    // Close model loop block
    }
    // Return a successful JSON response with models list
    return NextResponse.json({ success: true, models });
  // Catch any errors raised during processing
  } catch (error) {
    // Return an error JSON response with 500 status code
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  // Close catch block
  }
// Close POST handler block
}
