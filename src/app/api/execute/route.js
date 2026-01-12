import { NextResponse } from "next/server";

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
