// Import the Next.js response helper class
import { NextResponse } from "next/server";
// Import the SAP scraper helper function
import { fetchSapLessonContent } from "../../../lib/sap-helpers";

// Export the asynchronous POST handler function
export async function POST(request) {
  // Begin the main try block for error handling
  try {
    // Parse the request body parameters as JSON
    const params = await request.json();
    // Get the list of selected unit IDs or URLs from parameters
    const unit_inputs = params.unit_ids || [];
    // Resolve SAP session cookie from parameters or server env
    const sap_cookie = (params.sap_session_cookie || "").trim() || (process.env.SAP_SESSION_COOKIE || "").trim();
    // Validate if any lesson inputs are selected
    if (unit_inputs.length === 0) {
      // Throw an error if the lesson list is empty
      throw new Error("Please select at least one lesson to export.");
    // Close the validation check block
    }
    // Initialize array to hold fetched course content objects
    const course_content = [];
    // Loop through each selected lesson input
    for (const item of unit_inputs) {
      // Fetch and parse the lesson content
      const lesson_content = await fetchSapLessonContent(item, sap_cookie);
      // Append the structured lesson content to the array
      course_content.push(lesson_content);
    // Close lesson inputs loop
    }
    // Return a successful JSON response with course content details
    return NextResponse.json({ success: true, content: course_content });
  // Catch any errors raised during processing
  } catch (error) {
    // Return an error JSON response with 500 status code
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  // Close catch block
  }
// Close POST handler block
}
