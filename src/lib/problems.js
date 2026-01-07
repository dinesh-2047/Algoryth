export const problems = [
  {
    id: "p-1000",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["arrays", "hash-map"],
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
    editorial: {
      steps: [
        "Understand the problem: Find two numbers in the array that add up to the target.",
        "Use a hash map to store numbers and their indices.",
        "Iterate through the array, for each number, check if target - num exists in the map.",
        "If found, return the indices; else, add the current number to the map."
      ],
      solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      complexity: "Time: O(n), Space: O(n)"
    },
    hints: [
      { level: 1, text: "Think about using a data structure to store previously seen numbers." },
      { level: 2, text: "A hash map can help find the complement quickly." },
      { level: 3, text: "For each number, check if target - num is in the map." }
    ],
  },
  {
    id: "p-1001",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["stack"],
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
    statement:
      "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    constraints: ["1 ≤ nums.length ≤ 10^5", "-10^4 ≤ nums[i] ≤ 10^4"],
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
  },
];

export function getProblemBySlug(slug) {
  return problems.find((p) => p.slug === slug);
}
