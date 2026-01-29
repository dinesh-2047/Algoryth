<<<<<<< HEAD
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
  rust: { language: "rust", version: "1.68.2" },
  ruby: { language: "ruby", version: "3.2.2" },
  php: { language: "php", version: "8.2.3" },
};
=======
import { NextResponse } from "next/server";
>>>>>>> e646bff45bd2211ced9178ab56f556257f21ae4b

export async function POST(request) {
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

<<<<<<< HEAD
    // Code length validation (prevent abuse)
    if (code.length > 50000) {
      return Response.json(
        { error: "Code is too long (max 50,000 characters)" },
        { status: 400 }
      );
    }

    const langConfig = LANGUAGE_MAP[language];

    // If no test cases provided, just run the code
    if (!testCases || testCases.length === 0) {
      const result = await executePistonCode(langConfig, code, "");
      return Response.json({
        status: result.success ? "Success" : "Error",
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        language: language,
        input: "",
        outputVisualization: visualizeIO("", result.output),
        errorDetails: result.errorDetails || null,
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

      results.push({
        testCase: i + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        passed: passed,
        error: result.error,
        errorDetails: result.errorDetails || null,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        outputVisualization: visualizeIO(testCase.input, result.output),
      });
    }

    return Response.json({
      status: allPassed ? "Accepted" : "Wrong Answer",
      testResults: results,
      totalTests: testCases.length,
      passedTests: results.filter((r) => r.passed).length,
      language: language,
      inputOutputVisualization: results.map(r => r.outputVisualization),
=======
    return NextResponse.json({
      output,
      error,
>>>>>>> e646bff45bd2211ced9178ab56f556257f21ae4b
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
<<<<<<< HEAD

/**
 * Execute code using Piston API
 */
async function executePistonCode(langConfig, code, stdin) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: getFileName(langConfig.language),
            content: code,
          },
        ],
        stdin: stdin || "",
        args: [],
        compile_timeout: 10000, // 10 seconds
        run_timeout: 5000, // 5 seconds for more languages
        compile_memory_limit: -1,
        run_memory_limit: 256 * 1024 * 1024, // 256MB
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;
    // Try to get memory usage if available
    const memoryUsed = data.run?.memory || null;

    // Helper to extract line number from error
    function extractLineNumber(errorMsg) {
      if (!errorMsg) return null;
      // Try to match "at line X" or similar patterns
      const match = errorMsg.match(/line (\d+)/i) || errorMsg.match(/:(\d+):/);
      return match ? parseInt(match[1], 10) : null;
    }

    // Check for compilation errors
    if (data.compile && data.compile.code !== 0) {
      return {
        success: false,
        output: "",
        error: data.compile.stderr || data.compile.output || "Compilation failed",
        errorDetails: {
          type: "compilation",
          message: data.compile.stderr || data.compile.output,
          line: extractLineNumber(data.compile.stderr || data.compile.output),
        },
        executionTime,
        memoryUsed,
      };
    }

    // Check for runtime errors
    if (data.run && data.run.code !== 0) {
      return {
        success: false,
        output: data.run.stdout || "",
        error: data.run.stderr || data.run.output || "Runtime error",
        errorDetails: {
          type: "runtime",
          message: data.run.stderr || data.run.output,
          line: extractLineNumber(data.run.stderr || data.run.output),
        },
        executionTime,
        memoryUsed,
      };
    }

    return {
      success: true,
      output: data.run.stdout || data.run.output || "",
      error: data.run.stderr || null,
      executionTime,
      memoryUsed,
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: `Execution failed: ${error.message}`,
      errorDetails: {
        type: "internal",
        message: error.message,
        line: null,
      },
      executionTime: Date.now() - startTime,
      memoryUsed: null,
    };
  }
}

/**
 * Get appropriate filename for the language
 */
function getFileName(language) {
  const fileNames = {
    javascript: "main.js",
    python: "main.py",
    java: "Main.java",
    cpp: "main.cpp",
    go: "main.go",
    rust: "main.rs",
    ruby: "main.rb",
    php: "main.php",
  };
  return fileNames[language] || "main.txt";
}
/**
 * Visualize input/output for UI
 */
function visualizeIO(input, output) {
  return {
    input: input,
    output: output,
    preview: `Input:\n${input}\n\nOutput:\n${output}`,
  };
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
=======
>>>>>>> e646bff45bd2211ced9178ab56f556257f21ae4b
