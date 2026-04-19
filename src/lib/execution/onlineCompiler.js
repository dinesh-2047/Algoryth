const ONLINE_COMPILER_BASE_URL = "https://api.onlinecompiler.io";

export const LANGUAGE_COMPILER_MAP = {
  javascript: "typescript-deno",
  python: "python-3.14",
  java: "openjdk-25",
  cpp: "g++-15",
  go: "go-1.26",
};

export class OnlineCompilerError extends Error {
  constructor(message, { statusCode = 500, details = null } = {}) {
    super(message);
    this.name = "OnlineCompilerError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function resolveCompiler(language) {
  const normalized = String(language || "javascript").toLowerCase();
  return LANGUAGE_COMPILER_MAP[normalized] || null;
}

export async function runCodeSync({ code, language, input = "" }) {
  const compiler = resolveCompiler(language);
  const apiKey = process.env.ONLINE_COMPILER_API_KEY;

  if (!compiler) {
    throw new OnlineCompilerError(
      `Unsupported language: ${language}. Supported languages are ${Object.keys(
        LANGUAGE_COMPILER_MAP
      ).join(", ")}.`,
      { statusCode: 400 }
    );
  }

  if (!apiKey) {
    throw new OnlineCompilerError(
      "Missing ONLINE_COMPILER_API_KEY environment variable.",
      { statusCode: 500 }
    );
  }

  const response = await fetch(`${ONLINE_COMPILER_BASE_URL}/api/run-code-sync/`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      compiler,
      code,
      input,
    }),
    cache: "no-store",
  });

  const bodyText = await response.text();
  let parsed = {};

  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = { error: bodyText || "Invalid response from OnlineCompiler API." };
  }

  if (!response.ok) {
    throw new OnlineCompilerError(
      parsed?.error || `OnlineCompiler request failed with status ${response.status}.`,
      {
        statusCode: response.status,
        details: parsed,
      }
    );
  }

  return {
    status: parsed.status || "error",
    output: parsed.output ?? "",
    error: parsed.error ?? "",
    exitCode:
      parsed.exit_code === null || parsed.exit_code === undefined
        ? null
        : Number(parsed.exit_code),
    signal:
      parsed.signal === null || parsed.signal === undefined
        ? null
        : Number(parsed.signal),
    timeMs: parsed.time ? Math.round(Number(parsed.time) * 1000) : 0,
    totalMs: parsed.total ? Math.round(Number(parsed.total) * 1000) : 0,
    memoryKb: parsed.memory ? Number(parsed.memory) : 0,
    raw: parsed,
  };
}
