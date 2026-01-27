import { NextResponse } from "next/server";

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
  try {
    const { code, input } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "No code provided" },
        { status: 400 }
      );
    }

    let output = null;
    let error = null;

    try {
      // User must define solve(input)
      const solve = new Function(`${code}; return solve;`)();
      output = solve(input ? JSON.parse(input) : undefined);
    } catch (err) {
      error = err.toString();
    }

    return NextResponse.json({
      output,
      error,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
