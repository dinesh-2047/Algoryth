import { title } from "node:process";

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
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explaination: "We need to find two numbers in the array whose sum equals the target value 9.\nThe number at index 0 is 2. \nThe number at index 1 is 7. \n2 + 7 = 9, which matches the target. \nSo, we return their indices: [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explaination: "We need to find two numbers in the array whose sum equals the target value 6.\nThe number at index 1 is 2. \nThe number at index 2 is 4. \n2 + 4 = 6, which matches the target. \nSo, we return their indices: [1, 2]." },
    ],

    hints: ["Think about what number would complete the current one."],
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
      { input: "s = \"()\"", output: "true", explaination: "The string contains one opening bracket ( followed by one closing bracket ).\nSince every opening bracket is properly closed in the correct order, the parentheses are balanced.\nSo, the string is valid, and the output is true." },
      { input: "s = \"([)]\"", output: "false", explaination: "The string has the brackets (, [, ), and ].\nAlthough each type of bracket appears, they are not in the correct order.\nThe opening ( should be closed by ) before closing [.\nBut here, [ is opened and ) comes next, which breaks the proper nesting rule.\nBecause the brackets are not properly nested, the string is invalid, so the output is false." },
    ],

    hints: ["Can stack be used to keep track of opening brackets?", "A closing bracket should match a open bracket"],
  },
  {
  id: "p-1002",
  slug: "max-consecutive-ones",
  title: "Max Consecutive Ones",
  difficulty: "Easy",
  tags: ["Arrays"],
  statement:
    "Given a binary array nums, return the maximum number of consecutive 1s in the array.",
  constraints: [
    "1 ≤ nums.length ≤ 10^5",
    "nums[i] is either 0 or 1"
  ],
  examples: [
    {
      input: "nums = [1,1,0,1,1,1]",
      output: "3",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-1003",
  slug: "valid-anagram",
  title: "Valid Anagram",
  difficulty: "Easy",
  tags: ["Hashing", "Strings"],
  statement:
    "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
  constraints: [
    "1 ≤ s.length, t.length ≤ 5 * 10^4"
  ],
  examples: [
    {
      input: 's = "anagram", t = "nagaram"',
      output: "true",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-1004",
  slug: "remove-duplicates-sorted-array",
  title: "Remove Duplicates from Sorted Array",
  difficulty: "Easy",
  tags: ["Two Pointers", "Arrays"],
  statement:
    "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each element appears only once.",
  constraints: [
    "1 ≤ nums.length ≤ 3 * 10^4"
  ],
  examples: [
    {
      input: "nums = [1,1,2]",
      output: "2",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-1005",
  slug: "first-unique-character",
  title: "First Unique Character in a String",
  difficulty: "Easy",
  tags: ["Hashing", "Strings"],
  statement:
    "Given a string s, find the first non-repeating character and return its index.",
  constraints: [
    "1 ≤ s.length ≤ 10^5"
  ],
  examples: [
    {
      input: 's = "leetcode"',
      output: "0",
      explaination: ""
    }
  ],

  hints: [],

},
{
  id: "p-1006",
  slug: "valid-palindrome",
  title: "Valid Palindrome",
  difficulty: "Easy",
  tags: ["Two Pointers", "Strings"],
  statement:
    "Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.",
  constraints: [
    "1 ≤ s.length ≤ 2 * 10^5"
  ],
  examples: [
    {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-1007",
  slug: "move-zeroes",
  title: "Move Zeroes",
  difficulty: "Easy",
  tags: ["Arrays", "Two Pointers"],
  statement:
    "Given an integer array nums, move all 0's to the end while maintaining the relative order of the non-zero elements.",
  constraints: [
    "1 ≤ nums.length ≤ 10^4"
  ],
  examples: [
    {
      input: "nums = [0,1,0,3,12]",
      output: "[1,3,12,0,0]",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-1008",
  slug: "implement-stack-using-array",
  title: "Implement Stack using Array",
  difficulty: "Easy",
  tags: ["Stack"],
  statement:
    "Implement a stack using an array. Support push, pop, top, and isEmpty operations.",
  constraints: [
    "1 ≤ operations ≤ 10^4"
  ],
  examples: [
    {
      input: "push(1), push(2), pop()",
      output: "2",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-1009",
  slug: "fibonacci-number",
  title: "Fibonacci Number",
  difficulty: "Easy",
  tags: ["Recursion", "DP"],
  statement:
    "Given n, calculate the nth Fibonacci number.",
  constraints: [
    "0 ≤ n ≤ 30"
  ],
  examples: [
    {
      input: "n = 5",
      output: "5",
      explaination: ""
    }
  ],

  hints: [],
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
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explaination: "We need to find a contiguous subarray with the maximum possible sum.\nIf we look at the array, the subarray:\n[4, -1, 2, 1] has the largest sum.\n4 + (-1) + 2 + 1 = 6\nSo, the maximum subarray sum is 6." }],

    hints: ["You don’t need to look at every possible subarray to find the best one.","Can current negative sum maximize the total?"],
  },
  
  {
  id: "p-2001",
  slug: "subarray-sum-equals-k",
  title: "Subarray Sum Equals K",
  difficulty: "Medium",
  tags: ["Hashing", "Prefix Sum"],
  statement:
    "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals k.",
  constraints: [
    "1 ≤ nums.length ≤ 2 * 10^4"
  ],
  examples: [
    {
      input: "nums = [1,1,1], k = 2",
      output: "2",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-2002",
  slug: "longest-palindromic-substring",
  title: "Longest Palindromic Substring",
  difficulty: "Medium",
  tags: ["Strings", "Two Pointers"],
  statement:
    "Given a string s, return the longest palindromic substring in s.",
  constraints: [
    "1 ≤ s.length ≤ 1000"
  ],
  examples: [
    {
      input: 's = "babad"',
      output: '"bab"',
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-2003",
  slug: "daily-temperatures",
  title: "Daily Temperatures",
  difficulty: "Medium",
  tags: ["Stack"],
  statement:
    "Given an array of integers temperatures, return an array such that for each day tells how many days you would have to wait until a warmer temperature.",
  constraints: [
    "1 ≤ temperatures.length ≤ 10^5"
  ],
  examples: [
    {
      input: "temperatures = [73,74,75,71,69,72,76,73]",
      output: "[1,1,4,2,1,1,0,0]",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-2004",
  slug: "product-of-array-except-self",
  title: "Product of Array Except Self",
  difficulty: "Medium",
  tags: ["Arrays"],
  statement:
    "Given an integer array nums, return an array answer such that answer[i] is the product of all elements except nums[i].",
  constraints: [
    "2 ≤ nums.length ≤ 10^5"
  ],
  examples: [
    {
      input: "nums = [1,2,3,4]",
      output: "[24,12,8,6]",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-2005",
  slug: "generate-parentheses",
  title: "Generate Parentheses",
  difficulty: "Medium",
  tags: ["Recursion", "Backtracking"],
  statement:
    "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
  constraints: [
    "1 ≤ n ≤ 8"
  ],
  examples: [
    {
      input: "n = 3",
      output: '["((()))","(()())","(())()","()(())","()()()"]',
      explaination: ""
    }
  ],

  hints: [],
},{
  id: "p-2006",
  slug: "container-with-most-water",
  title: "Container With Most Water",
  difficulty: "Medium",
  tags: ["Two Pointers"],
  statement:
    "Given n non-negative integers representing height, find two lines that together with the x-axis form a container that holds the most water.",
  constraints: [
    "2 ≤ height.length ≤ 10^5"
  ],
  examples: [
    {
      input: "height = [1,8,6,2,5,4,8,3,7]",
      output: "49",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-2007",
  slug: "decode-string",
  title: "Decode String",
  difficulty: "Medium",
  tags: ["Stack", "Strings"],
  statement:
    "Given an encoded string, return its decoded string.",
  constraints: [
    "1 ≤ s.length ≤ 10^5"
  ],
  examples: [
    {
      input: 's = "3[a]2[bc]"',
      output: '"aaabcbc"',
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-2008",
  slug: "search-in-rotated-sorted-array",
  title: "Search in Rotated Sorted Array",
  difficulty: "Medium",
  tags: ["Binary Search"],
  statement:
    "Given a rotated sorted array nums and a target value, return its index or -1 if not found.",
  constraints: [
    "1 ≤ nums.length ≤ 10^5"
  ],
  examples: [
    {
      input: "nums = [4,5,6,7,0,1,2], target = 0",
      output: "4",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3000",
  slug: "sliding-window-maximum",
  title: "Sliding Window Maximum",
  difficulty: "Hard",
  tags: ["Sliding Window", "Deque"],
  statement:
    "Given an array nums and an integer k, return the maximum value in each sliding window.",
  constraints: [
    "1 ≤ nums.length ≤ 10^5"
  ],
  examples: [
    {
      input: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
      output: "[3,3,5,5,6,7]",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3001",
  slug: "minimum-window-substring",
  title: "Minimum Window Substring",
  difficulty: "Hard",
  tags: ["Sliding Window", "Hashing"],
  statement:
    "Given two strings s and t, return the minimum window substring of s such that every character in t is included.",
  constraints: [
    "1 ≤ s.length, t.length ≤ 10^5"
  ],
  examples: [
    {
      input: 's = "ADOBECODEBANC", t = "ABC"',
      output: '"BANC"',
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3002",
  slug: "largest-rectangle-histogram",
  title: "Largest Rectangle in Histogram",
  difficulty: "Hard",
  tags: ["Stack"],
  statement:
    "Given an array of integers heights representing the histogram's bar height, return the area of the largest rectangle.",
  constraints: [
    "1 ≤ heights.length ≤ 10^5"
  ],
  examples: [
    {
      input: "heights = [2,1,5,6,2,3]",
      output: "10",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3003",
  slug: "word-search",
  title: "Word Search",
  difficulty: "Hard",
  tags: ["Backtracking"],
  statement:
    "Given an m x n grid of characters and a word, return true if the word exists in the grid.",
  constraints: [
    "1 ≤ m, n ≤ 6"
  ],
  examples: [
    {
      input: 'board = [["A","B","C"],["D","E","F"]], word = "ABE"',
      output: "true",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3004",
  slug: "merge-k-sorted-lists",
  title: "Merge K Sorted Lists",
  difficulty: "Hard",
  tags: ["Divide and Conquer", "Heap"],
  statement:
    "You are given an array of k linked-lists, each sorted in ascending order. Merge all lists into one sorted list.",
  constraints: [
    "0 ≤ k ≤ 10^4"
  ],
  examples: [
    {
      input: "lists = [[1,4,5],[1,3,4],[2,6]]",
      output: "[1,1,2,3,4,4,5,6]",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3005",
  slug: "regular-expression-matching",
  title: "Regular Expression Matching",
  difficulty: "Hard",
  tags: ["DP", "Strings", "Recursion"],
  statement:
    "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.\n\n" +
    "'.' Matches any single character.\n" +
    "'*' Matches zero or more of the preceding element.\n\n" +
    "The matching should cover the entire input string (not partial).",
  constraints: [
    "1 ≤ s.length ≤ 20",
    "1 ≤ p.length ≤ 20"
  ],
  examples: [
    {
      input: 's = "aa", p = "a"',
      output: "false",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3006",
  slug: "trapping-rain-water",
  title: "Trapping Rain Water",
  difficulty: "Hard",
  tags: ["Two Pointers", "Stack"],
  statement:
    "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.",
  constraints: [
    "1 ≤ height.length ≤ 10^5"
  ],
  examples: [
    {
      input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
      output: "6",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3007",
  slug: "longest-valid-parentheses",
  title: "Longest Valid Parentheses",
  difficulty: "Hard",
  tags: ["Stack", "DP"],
  statement:
    "Given a string containing '(' and ')', find the length of the longest valid parentheses substring.",
  constraints: [
    "0 ≤ s.length ≤ 10^5"
  ],
  examples: [
    {
      input: 's = ")()())"',
      output: "4",
      explaination: ""
    }
  ],

  hints: [],
},
{
  id: "p-3008",
  slug: "edit-distance",
  title: "Edit Distance",
  difficulty: "Hard",
  tags: ["DP", "Strings"],
  statement:
    "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
  constraints: [
    "0 ≤ word1.length, word2.length ≤ 500"
  ],
  examples: [
    {
      input: 'word1 = "horse", word2 = "ros"',
      output: "3",
      explaination: ""
    }
  ],

  hints: [],
}


];

export function getProblemBySlug(slug) {
  return problems.find((p) => p.slug === slug);
}
