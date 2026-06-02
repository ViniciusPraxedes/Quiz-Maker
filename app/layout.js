// Import font loading utility from Next.js google fonts library
import { Outfit } from "next/font/google";
// Import the global CSS stylesheet rules
import "./globals.css";

// Configure Outfit font with latin subsets
const outfit = Outfit({
  // Specify subset options for character support
  subsets: ["latin"],
// Close Outfit font configuration function call
});

// Define page metadata details
export const metadata = {
  // Set the default browser window title
  title: "SAP Learning Journey Quiz Generator",
  // Set the description search engine snippet
  description: "Generate quizzes from SAP learning journeys",
// Close page metadata configuration dictionary
};

// Export the default RootLayout layout component
export default function RootLayout({ children }) {
  // Return the main HTML structure with Outfit font class applied
  return (
    // Declare the html document wrapper with english language setting
    <html lang="en" className={outfit.className}>
      {/* Render the body tag housing child page routes */}
      <body>
        {/* Inject children components inside body */}
        {children}
      {/* Close the body tag */}
      </body>
    {/* Terminate HTML wrapper tag */}
    </html>
  // Close return statement
  );
// Close RootLayout function block
}
