import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VM } from "vm2";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { code, language, problemId } = await request.json();

    if (!code || !language || !problemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (language !== "javascript") {
      return NextResponse.json({ error: "Only JavaScript is supported" }, { status: 400 });
    }

    // Fetch test cases for the problem
    const testCases = await prisma.testCase.findMany({
      where: { problemId },
      orderBy: { createdAt: "asc" },
    });

    if (testCases.length === 0) {
      return NextResponse.json({ error: "No test cases found" }, { status: 404 });
    }

    const results = [];

    for (const testCase of testCases) {
      try {
        // Create a safe VM to execute the code
        const vm = new VM({
          timeout: 5000, // 5 second timeout
          sandbox: {},
        });

        // Execute the code in the VM
        vm.run(code);

        // Parse input as JSON
        const input = JSON.parse(testCase.input);

        // Now call the solve function with the input
        const startTime = process.hrtime.bigint();
        const output = vm.run(`solve(${JSON.stringify(input)})`);
        const endTime = process.hrtime.bigint();
        const time = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Compare output (stringify both for comparison)
        const passed = JSON.stringify(output) === testCase.expectedOutput;

        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expectedOutput,
          output: JSON.stringify(output),
          time: Math.round(time),
          memory: 0, // Placeholder, hard to measure in Node.js
          error: passed ? null : "Output does not match expected",
        });
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          output: null,
          time: 0,
          memory: 0,
          error: error.message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json({ error: "Failed to execute code" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
