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

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  try {
    const { language, code, problemId } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "No code provided" },
        { status: 400 }
      );
    }

    if (!LANGUAGE_MAP[language]) {
      return Response.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    // Code length validation (prevent abuse)
    if (code.length > 50000) {
      return Response.json(
        { error: "Code is too long (max 50,000 characters)" },
        { status: 400 }
      );
    }

    const langConfig = LANGUAGE_MAP[language];

    let testCases = [];

    // Fetch test cases from DB if problemId is provided
    if (problemId) {
      try {
        testCases = await prisma.testCase.findMany({
          where: { problemId, isHidden: false }, // Only non-hidden test cases for running
          select: { input: true, expectedOutput: true },
        });
      } catch (dbError) {
        console.error("Database error fetching test cases:", dbError);
        return Response.json(
          { error: "Failed to fetch test cases" },
          { status: 500 }
        );
      }
    }

    // If no test cases, just run the code without input
    if (testCases.length === 0) {
      const result = await executePistonCode(langConfig, code, "");
      return Response.json({
        status: result.success ? "Success" : "Error",
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        language: language,
      });
    }

    // Execute against test cases
    const results = [];
    let allPassed = true;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await executePistonCode(
        langConfig,
        code,
        testCase.input
      );

      const passed =
        result.success &&
        normalizeOutput(result.output) === normalizeOutput(testCase.expectedOutput);

      if (!passed) allPassed = false;

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
  } finally {
    await prisma.$disconnect();
  }
}
