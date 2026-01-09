export const problems = [
  {
    id: "p-1000",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["arrays", "hash-map"],
    acceptanceRate: 49.2,
    submissions: 12500000,
    solved: true,
    bookmarked: false,
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 ≤ nums.length ≤ 10^5",
      "-10^9 ≤ nums[i] ≤ 10^9",
      "-10^9 ≤ target ≤ 10^9",
      "Exactly one valid answer exists",
    ],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
  },
  {
    id: "p-1001",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["stack"],
    acceptanceRate: 41.8,
    submissions: 8900000,
    solved: false,
    bookmarked: true,
    statement:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
    constraints: ["1 ≤ s.length ≤ 10^5", "s consists of brackets only"],
    examples: [
      { input: "s = \"()\"", output: "true" },
      { input: "s = \"([)]\"", output: "false" },
    ],
  },
  {
    id: "p-2000",
    slug: "max-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["dp", "arrays"],
    acceptanceRate: 52.6,
    submissions: 7200000,
    solved: false,
    bookmarked: false,
    statement:
      "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    constraints: ["1 ≤ nums.length ≤ 10^5", "-10^4 ≤ nums[i] ≤ 10^4"],
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
  },
];

export function getProblemBySlug(slug) {
  return problems.find((p) => p.slug === slug);
}
