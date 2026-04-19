function repeatToken(token, count) {
  return Array.from({ length: count }, () => token).join(" ");
}

function gridToInput(rows) {
  const m = rows.length;
  const n = rows[0]?.length || 0;
  return `${m} ${n}\n${rows.join("\n")}`;
}

function checkerboardRows(m, n) {
  return Array.from({ length: m }, (_, r) =>
    Array.from({ length: n }, (_, c) => ((r + c) % 2 === 0 ? "1" : "0")).join("")
  );
}

function denseRows(m, n, value) {
  return Array.from({ length: m }, () => value.repeat(n));
}

function buildStarterCode(title) {
  return {
    javascript: `// ${title}\n// JavaScript runs on Deno in OnlineCompiler.\nconst raw = (await new Response(Deno.stdin.readable).text()).trim();\nif (!raw) Deno.exit(0);\nconst lines = raw.split(/\\n/);\n\n// TODO: parse input from lines and print the answer.\n// console.log(answer);\n`,
    python: `# ${title}\nimport sys\n\nlines = sys.stdin.read().strip().splitlines()\nif not lines:\n    raise SystemExit\n\n# TODO: parse input from lines and print the answer\n# print(answer)\n`,
    java: `// ${title}\nimport java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        List<String> lines = new ArrayList<>();\n        String line;\n        while ((line = br.readLine()) != null) {\n            if (!line.isBlank()) lines.add(line);\n        }\n        if (lines.isEmpty()) return;\n\n        // TODO: parse input from lines and print the answer\n    }\n}\n`,
    cpp: `// ${title}\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    // TODO: parse input and print the answer\n    return 0;\n}\n`,
    go: `// ${title}\npackage main\n\nimport (\n    \"bufio\"\n    \"fmt\"\n    \"os\"\n)\n\nfunc main() {\n    in := bufio.NewReader(os.Stdin)\n\n    // TODO: parse input with fmt.Fscan(in, ...) and print the answer\n    _ = in\n}\n`,
  };
}

function buildTwoSumStressCase(size, target, leftIndex, leftValue, rightIndex, rightValue, fillValue) {
  const arr = Array.from({ length: size }, () => fillValue);
  arr[leftIndex] = leftValue;
  arr[rightIndex] = rightValue;

  return {
    name: `stress-${size}`,
    input: `${size} ${target}\n${arr.join(" ")}`,
    expectedOutput: `${leftIndex} ${rightIndex}`,
    comparison: "tokens",
    isHidden: true,
    maxTimeMs: 2800,
    maxMemoryKb: 262144,
  };
}

const twoSumProblem = {
  id: "p-1000",
  slug: "two-sum",
  title: "Two Sum",
  rating: 900,
  difficulty: "Easy",
  tags: ["arrays", "hash-map"],
  statement:
    "Given an integer array nums and an integer target, return indices of two numbers such that they add up to target. If no such pair exists, output -1 -1.",
  inputFormat:
    "Line 1: n target\nLine 2: n space-separated integers",
  outputFormat:
    "Two space-separated indices i j (0-based). Output -1 -1 if no valid pair exists.",
  constraints: [
    "2 <= n <= 20000",
    "-10^9 <= nums[i], target <= 10^9",
    "At most one valid answer per test case",
  ],
  examples: [
    {
      input: "4 9\n2 7 11 15",
      output: "0 1",
      explanation: "2 + 7 = 9, so indices 0 and 1 are returned.",
    },
    {
      input: "5 100\n1 2 3 4 5",
      output: "-1 -1",
      explanation: "No two numbers add up to 100.",
    },
  ],
  hints: [
    "Track numbers seen so far and search for target - current.",
    "An O(n) hash-map solution passes stress tests reliably.",
  ],
  starterCode: buildStarterCode("Two Sum"),
  testCases: [
    {
      name: "basic-1",
      input: "4 9\n2 7 11 15",
      expectedOutput: "0 1",
      comparison: "tokens",
      isHidden: false,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "basic-2",
      input: "3 6\n3 2 4",
      expectedOutput: "1 2",
      comparison: "tokens",
      isHidden: false,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "negative-values",
      input: "6 0\n-3 4 3 90 -4 0",
      expectedOutput: "0 2",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "duplicate-values",
      input: "4 6\n3 3 4 5",
      expectedOutput: "0 1",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "no-solution",
      input: "5 100\n1 2 3 4 5",
      expectedOutput: "-1 -1",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "zero-target",
      input: "5 0\n0 4 3 0 5",
      expectedOutput: "0 3",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "unique-middle-pair",
      input: "8 17\n5 7 1 11 9 2 4 8",
      expectedOutput: "4 7",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    buildTwoSumStressCase(1000, 17, 10, 8, 999, 9, 5),
    buildTwoSumStressCase(18000, 17, 17998, 8, 17999, 9, 5),
    buildTwoSumStressCase(16000, 1, 7, -4, 15999, 5, 2),
  ],
};

const validParenthesesProblem = {
  id: "p-1001",
  slug: "valid-parentheses",
  title: "Valid Parentheses",
  rating: 950,
  difficulty: "Easy",
  tags: ["stack", "strings"],
  statement:
    "Given a string containing only ()[]{} brackets, determine whether the string is valid. A valid string must close every opening bracket in the correct order.",
  inputFormat: "Single line containing string s",
  outputFormat: "Print true or false (lowercase).",
  constraints: [
    "1 <= s.length <= 20000",
    "s consists only of characters: ()[]{}",
  ],
  examples: [
    {
      input: "()[]{}",
      output: "true",
      explanation: "All bracket types are closed in valid order.",
    },
    {
      input: "([)]",
      output: "false",
      explanation: "The nesting order is invalid.",
    },
  ],
  hints: [
    "Push opening brackets and validate every closing bracket immediately.",
    "If stack is empty at the end, the sequence is valid.",
  ],
  starterCode: buildStarterCode("Valid Parentheses"),
  testCases: [
    {
      name: "single-pair",
      input: "()",
      expectedOutput: "true",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "multi-pair",
      input: "()[]{}",
      expectedOutput: "true",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "mismatch",
      input: "(]",
      expectedOutput: "false",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "cross-nesting",
      input: "([)]",
      expectedOutput: "false",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "nested-valid",
      input: "{[]}",
      expectedOutput: "true",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "only-open",
      input: "(((((((",
      expectedOutput: "false",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "balanced-complex",
      input: "(()())",
      expectedOutput: "true",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "deep-balanced",
      input: "{[()()]}",
      expectedOutput: "true",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-long-balanced",
      input: "()".repeat(10000),
      expectedOutput: "true",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2600,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-long-unbalanced",
      input: `${"(".repeat(12000)}${")".repeat(11999)}`,
      expectedOutput: "false",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2600,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-nested-pattern",
      input: "[{()}]".repeat(3000),
      expectedOutput: "true",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2600,
      maxMemoryKb: 262144,
    },
  ],
};

function buildMaxSubarrayStressInput(size, generator) {
  const arr = Array.from({ length: size }, (_, index) => generator(index));
  return `${size}\n${arr.join(" ")}`;
}

const maxSubarrayProblem = {
  id: "p-2000",
  slug: "max-subarray",
  title: "Maximum Subarray",
  rating: 1350,
  difficulty: "Medium",
  tags: ["dp", "arrays", "kadane"],
  statement:
    "Given an integer array nums, find the contiguous subarray with the largest sum and print that sum.",
  inputFormat: "Line 1: n\nLine 2: n space-separated integers",
  outputFormat: "Print one integer: the maximum subarray sum.",
  constraints: [
    "1 <= n <= 20000",
    "-10^4 <= nums[i] <= 10^4",
  ],
  examples: [
    {
      input: "9\n-2 1 -3 4 -1 2 1 -5 4",
      output: "6",
      explanation: "The best subarray is [4, -1, 2, 1].",
    },
  ],
  hints: [
    "Track best subarray ending at current index.",
    "Reset running sum when extending hurts the score.",
  ],
  starterCode: buildStarterCode("Maximum Subarray"),
  testCases: [
    {
      name: "sample",
      input: "9\n-2 1 -3 4 -1 2 1 -5 4",
      expectedOutput: "6",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "single",
      input: "1\n1",
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2100,
      maxMemoryKb: 262144,
    },
    {
      name: "all-negative",
      input: "5\n-1 -2 -3 -4 -5",
      expectedOutput: "-1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "mostly-positive",
      input: "5\n5 4 -1 7 8",
      expectedOutput: "23",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "alternating-small",
      input: "6\n1 -1 1 -1 1 -1",
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "all-negative-large",
      input: "8\n-2 -1 -3 -4 -1 -2 -1 -5",
      expectedOutput: "-1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "mixed-wide",
      input: "10\n3 -2 5 -1 6 -3 2 7 -5 2",
      expectedOutput: "17",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-all-ones",
      input: buildMaxSubarrayStressInput(18000, () => 1),
      expectedOutput: "18000",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2800,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-half-split",
      input: buildMaxSubarrayStressInput(18000, (index) => (index < 9000 ? -1 : 2)),
      expectedOutput: "18000",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2800,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-alternating-large",
      input: buildMaxSubarrayStressInput(20000, (index) => (index % 2 === 0 ? 5 : -6)),
      expectedOutput: "5",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2800,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-big-middle-window",
      input: buildMaxSubarrayStressInput(15000, (index) => {
        if (index < 5000) return -2;
        if (index < 10000) return 3;
        return -1;
      }),
      expectedOutput: "15000",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2800,
      maxMemoryKb: 262144,
    },
  ],
};

function repeatOnesOutput(count) {
  return repeatToken("1", count);
}

const productExceptSelfProblem = {
  id: "p-2004",
  slug: "product-of-array-except-self",
  title: "Product of Array Except Self",
  rating: 1500,
  difficulty: "Medium",
  tags: ["arrays", "prefix-suffix"],
  statement:
    "Given an integer array nums, print an array where result[i] is the product of all elements except nums[i].",
  inputFormat: "Line 1: n\nLine 2: n space-separated integers",
  outputFormat: "Print n space-separated integers.",
  constraints: [
    "2 <= n <= 450",
    "-30 <= nums[i] <= 30",
    "Use an O(n) approach without division for full credit",
  ],
  examples: [
    {
      input: "4\n1 2 3 4",
      output: "24 12 8 6",
      explanation: "Each index gets product of all other numbers.",
    },
  ],
  hints: [
    "Build prefix and suffix products.",
    "Handle zeros carefully.",
  ],
  starterCode: buildStarterCode("Product of Array Except Self"),
  testCases: [
    {
      name: "sample",
      input: "4\n1 2 3 4",
      expectedOutput: "24 12 8 6",
      comparison: "tokens",
      isHidden: false,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "single-zero",
      input: "5\n-1 1 0 -3 3",
      expectedOutput: "0 0 9 0 0",
      comparison: "tokens",
      isHidden: false,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "two-elements",
      input: "2\n2 3",
      expectedOutput: "3 2",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "double-zero",
      input: "4\n0 0 2 4",
      expectedOutput: "0 0 0 0",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "descending",
      input: "5\n5 4 3 2 1",
      expectedOutput: "24 30 40 60 120",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "all-ones-small",
      input: "6\n1 1 1 1 1 1",
      expectedOutput: "1 1 1 1 1 1",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "all-negative",
      input: "6\n-1 -2 -3 -4 -5 -6",
      expectedOutput: "-720 -360 -240 -180 -144 -120",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "alternating-1-2",
      input: "10\n1 2 1 2 1 2 1 2 1 2",
      expectedOutput: "32 16 32 16 32 16 32 16 32 16",
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-120",
      input: `120\n${repeatToken("1", 120)}`,
      expectedOutput: repeatOnesOutput(120),
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2600,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-200",
      input: `200\n${repeatToken("1", 200)}`,
      expectedOutput: repeatOnesOutput(200),
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 2600,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-450",
      input: `450\n${repeatToken("1", 450)}`,
      expectedOutput: repeatOnesOutput(450),
      comparison: "tokens",
      isHidden: true,
      maxTimeMs: 3000,
      maxMemoryKb: 262144,
    },
  ],
};

const islandsProblem = {
  id: "p-4003",
  slug: "number-of-islands",
  title: "Number of Islands",
  rating: 1600,
  difficulty: "Medium",
  tags: ["graphs", "bfs", "dfs"],
  statement:
    "You are given an m x n binary grid where 1 means land and 0 means water. Count how many connected islands exist. Cells connect only up, down, left, and right.",
  inputFormat:
    "Line 1: m n\nNext m lines: each line is a binary string of length n",
  outputFormat: "Print one integer: the number of islands.",
  constraints: [
    "1 <= m, n <= 120",
    "grid[i][j] is 0 or 1",
  ],
  examples: [
    {
      input: "4 5\n11110\n11010\n11000\n00000",
      output: "1",
      explanation: "All land cells connect to form one island.",
    },
    {
      input: "4 5\n11000\n11000\n00100\n00011",
      output: "3",
      explanation: "There are three disconnected components of land.",
    },
  ],
  hints: [
    "Run BFS/DFS from every unvisited land cell.",
    "Mark visited cells to avoid double counting.",
  ],
  starterCode: buildStarterCode("Number of Islands"),
  testCases: [
    {
      name: "sample-1",
      input: "4 5\n11110\n11010\n11000\n00000",
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "sample-2",
      input: "4 5\n11000\n11000\n00100\n00011",
      expectedOutput: "3",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "single-land",
      input: "1 1\n1",
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "single-water-row",
      input: "1 5\n00000",
      expectedOutput: "0",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "small-checkerboard",
      input: "3 3\n101\n010\n101",
      expectedOutput: "5",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "all-land-5",
      input: gridToInput(denseRows(5, 5, "1")),
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "all-water-5",
      input: gridToInput(denseRows(5, 5, "0")),
      expectedOutput: "0",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "ring-structure",
      input: "8 8\n11111111\n10000001\n10111001\n10101001\n10111001\n10000001\n11111111\n00000000",
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2400,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-checkerboard-120",
      input: gridToInput(checkerboardRows(120, 120)),
      expectedOutput: "7200",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 3000,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-all-land-120",
      input: gridToInput(denseRows(120, 120, "1")),
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 3000,
      maxMemoryKb: 262144,
    },
    {
      name: "stress-all-water-100",
      input: gridToInput(denseRows(100, 100, "0")),
      expectedOutput: "0",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2800,
      maxMemoryKb: 262144,
    },
  ],
};

const fibonacciProblem = {
  id: "p-1009",
  slug: "fibonacci-number",
  title: "Fibonacci Number",
  rating: 1200,
  difficulty: "Easy",
  tags: ["dp", "math"],
  statement:
    "Given n, print the n-th Fibonacci number where F(0)=0 and F(1)=1.",
  inputFormat: "Single integer n",
  outputFormat: "Print one integer: F(n).",
  constraints: [
    "0 <= n <= 45",
    "An O(n) iterative solution is recommended",
  ],
  examples: [
    {
      input: "10",
      output: "55",
      explanation: "F(10) = 55.",
    },
  ],
  hints: [
    "Avoid plain recursion for larger n.",
    "Track only previous two Fibonacci values.",
  ],
  starterCode: buildStarterCode("Fibonacci Number"),
  testCases: [
    {
      name: "n0",
      input: "0",
      expectedOutput: "0",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "n1",
      input: "1",
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: false,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "n2",
      input: "2",
      expectedOutput: "1",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "n3",
      input: "3",
      expectedOutput: "2",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "n10",
      input: "10",
      expectedOutput: "55",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "n20",
      input: "20",
      expectedOutput: "6765",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2000,
      maxMemoryKb: 262144,
    },
    {
      name: "n30",
      input: "30",
      expectedOutput: "832040",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2200,
      maxMemoryKb: 262144,
    },
    {
      name: "n35",
      input: "35",
      expectedOutput: "9227465",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2300,
      maxMemoryKb: 262144,
    },
    {
      name: "n42",
      input: "42",
      expectedOutput: "267914296",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2600,
      maxMemoryKb: 262144,
    },
    {
      name: "n44",
      input: "44",
      expectedOutput: "701408733",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 2800,
      maxMemoryKb: 262144,
    },
    {
      name: "n45",
      input: "45",
      expectedOutput: "1134903170",
      comparison: "trimmed",
      isHidden: true,
      maxTimeMs: 3000,
      maxMemoryKb: 262144,
    },
  ],
};

export const problemSeedData = [
  twoSumProblem,
  validParenthesesProblem,
  maxSubarrayProblem,
  productExceptSelfProblem,
  islandsProblem,
  fibonacciProblem,
];
