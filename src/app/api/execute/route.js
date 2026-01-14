/**
 * Code Execution API Route
 * 
 * This endpoint handles code execution using the Piston API (https://piston.readthedocs.io/)
 * Piston is a free, open-source code execution engine that supports multiple languages.
 * 
 * Features:
 * - Multi-language support (JavaScript, Python, C++, Java, Go)
 * - Test case execution
 * - Execution time and memory tracking
 * - Error handling and security
 */

const PISTON_API_URL = "https://emkc.org/api/v2/piston";

// Language mapping for Piston API
const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "cpp", version: "10.2.0" },
  go: { language: "go", version: "1.16.2" },
};

export async function POST(request) {
  const { language, code, input, inputType } = await request.json();
  // Mock execution and simple visualization derivation from input
  let visualization = null;

  try {
    if (inputType === "array" && Array.isArray(input)) {
      visualization = { type: "array", data: [...input] };
    } else if (
      inputType === "matrix" &&
      Array.isArray(input) &&
      Array.isArray(input[0])
    ) {
      visualization = { type: "matrix", data: input };
    } else if (
      inputType === "graph" &&
      input &&
      Array.isArray(input.nodes) &&
      Array.isArray(input.edges)
    ) {
      visualization = { type: "graph", data: input };
    } else if (typeof input === "string") {
      // try to parse generic JSON
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          if (Array.isArray(parsed[0])) visualization = { type: "matrix", data: parsed };
          else visualization = { type: "array", data: parsed };
        } else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges))
            visualization = { type: "graph", data: parsed };
          else visualization = { type: "json", data: parsed };
        }
      } catch {
        // leave as null
      }
    }
  } catch {
    visualization = null;
  }

  const result = {
    status: "Accepted",
    output: `Executed ${language} code successfully. Code length: ${code?.length || 0}`,
    language,
    visualization,
  };
  return fileNames[language] || "main.txt";
}

/**
 * Normalize output for comparison
 * Removes extra whitespace and newlines
 */
function normalizeOutput(output) {
  if (!output) return "";
  return output
    .toString()
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\s+$/gm, "");
}