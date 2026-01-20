import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../lib/problems";

export async function POST(request) {
  try {
    const { slug, code } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { verdict: "Error", message: "Empty code" },
        { status: 400 }
      );
    }

    const problem = getProblemBySlug(slug);

    if (!problem || !problem.testCases) {
      return NextResponse.json(
        { verdict: "Error", message: "Problem or test cases not found" },
        { status: 404 }
      );
    }

    let userFunction;

    try {
      // User must define solve(input)
      userFunction = new Function(
        `${code}; return solve;`
      )();
    } catch (err) {
      return NextResponse.json({
        verdict: "Runtime Error",
        error: err.toString(),
      });
    }

    for (const test of problem.testCases) {
      let userOutput;

      try {
        userOutput = userFunction(JSON.parse(test.input));
      } catch (err) {
        return NextResponse.json({
          verdict: "Runtime Error",
          error: err.toString(),
        });
      }

      const expected = JSON.stringify(
        JSON.parse(test.output)
      );

      const actual = JSON.stringify(userOutput);

      if (actual !== expected) {
        return NextResponse.json({
          verdict: "Wrong Answer",
          expected,
          actual,
        });
      }
    }

    return NextResponse.json({ verdict: "Accepted" });
  } catch {
    return NextResponse.json(
      { verdict: "Error", message: "Invalid request" },
      { status: 400 }
    );
  }
}
