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
  try {
    const { language, code, testCases, problemId } = await request.json();

    // Validation
    if (!code || !language) {
      return Response.json(
        { error: "Code and language are required" },
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

    // If no test cases provided, just run the code
    if (!testCases || testCases.length === 0) {
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

      results.push({
        testCase: i + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        passed: passed,
        error: result.error,
        executionTime: result.executionTime,
      });
    }

    return Response.json({
      status: allPassed ? "Accepted" : "Wrong Answer",
      testResults: results,
      totalTests: testCases.length,
      passedTests: results.filter((r) => r.passed).length,
      language: language,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return Response.json(
      {
        error: "Internal server error during code execution",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

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
        run_timeout: 3000, // 3 seconds
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    // Check for compilation errors
    if (data.compile && data.compile.code !== 0) {
      return {
        success: false,
        output: "",
        error: data.compile.stderr || data.compile.output || "Compilation failed",
        executionTime,
      };
    }

    // Check for runtime errors
    if (data.run && data.run.code !== 0) {
      return {
        success: false,
        output: data.run.stdout || "",
        error: data.run.stderr || data.run.output || "Runtime error",
        executionTime,
      };
    }

    return {
      success: true,
      output: data.run.stdout || data.run.output || "",
      error: data.run.stderr || null,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: `Execution failed: ${error.message}`,
      executionTime: Date.now() - startTime,
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