import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code, input } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { output: null, error: "No code provided" },
        { status: 400 }
      );
    }

    let output = "";
    let result = null;
    let error = null;

    const originalLog = console.log;

    try {
      console.log = (...args) => {
        output += args.join(" ") + "\n";
      };

      // Execute user code
      const fn = new Function(
        `${code};
         if (typeof solve === "function") {
           return solve(${input ?? "undefined"});
         }`
      );

      result = fn();
    } catch (err) {
      error = err.toString();
    } finally {
      console.log = originalLog;
    }

    return NextResponse.json({
      output: output.trim() || null,
      result: result !== undefined ? JSON.stringify(result) : null,
      error,
    });
  } catch {
    return NextResponse.json(
      { output: null, error: "Invalid request" },
      { status: 400 }
    );
  }
}
