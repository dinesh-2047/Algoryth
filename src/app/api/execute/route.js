import { NextResponse } from "next/server";
import { enqueueExecution, getExecutionQueueState } from "../../../lib/execution/executionQueue";
import { OnlineCompilerError, runCodeSync } from "../../../lib/execution/onlineCompiler";

export async function POST(request) {
  try {
    const { code, input = "", language = "javascript" } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "No code provided" },
        { status: 400 }
      );
    }

    const result = await enqueueExecution(() =>
      runCodeSync({
        code,
        input,
        language,
      })
    );

    return NextResponse.json(
      {
        output: result.output,
        error: result.error,
        status: result.status,
        exitCode: result.exitCode,
        signal: result.signal,
        executionTime: result.timeMs,
        totalTime: result.totalMs,
        memoryUsage: result.memoryKb,
        queueWaitMs: result.queueWaitMs,
        queue: getExecutionQueueState(),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof OnlineCompilerError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          queue: getExecutionQueueState(),
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to execute code",
        details: error.message,
        queue: getExecutionQueueState(),
      },
      { status: 500 }
    );
  }
}
