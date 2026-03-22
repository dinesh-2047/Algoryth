export const problems = [
  {
    id: "p-1000",
    slug: "two-sum",
    title: "Two Sum",
    rating: 800,
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
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "We need to find two numbers in the array whose sum equals the target value 9.\nThe number at index 0 is 2. \nThe number at index 1 is 7. \n2 + 7 = 9, which matches the target. \nSo, we return their indices: [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "We need to find two numbers in the array whose sum equals the target value 6.\nThe number at index 1 is 2. \nThe number at index 2 is 4. \n2 + 4 = 6, which matches the target. \nSo, we return their indices: [1, 2]." },
    ],

    hints: ["Think about what number would complete the current one."],
  },
  {
    id: "p-1001",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    rating: 900,
    tags: ["stack"],
    statement:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
    constraints: ["1 ≤ s.length ≤ 10^5", "s consists of brackets only"],
    examples: [
      { input: "s = \"()\"", output: "true", explanation: "The string contains one opening bracket ( followed by one closing bracket ).\nSince every opening bracket is properly closed in the correct order, the parentheses are balanced.\nSo, the string is valid, and the output is true." },
      { input: "s = \"([)]\"", output: "false", explanation: "The string has the brackets (, [, ), and ].\nAlthough each type of bracket appears, they are not in the correct order.\nThe opening ( should be closed by ) before closing [.\nBut here, [ is opened and ) comes next, which breaks the proper nesting rule.\nBecause the brackets are not properly nested, the string is invalid, so the output is false." },
    ],

    hints: ["Can stack be used to keep track of opening brackets?", "A closing bracket should match a open bracket"],
  },
  {
    id: "p-1002",
    slug: "max-consecutive-ones",
    title: "Max Consecutive Ones",
    rating: 1000,
    tags: ["arrays"],
    statement:
      "Given a binary array nums, return the maximum number of consecutive 1s in the array.",
    constraints: [
      "1 ≤ nums.length ≤ 10^5",
      "nums[i] is either 0 or 1"
    ],
    examples: [
      { input: "nums = [1,1,0,1,1,1]", output: "3", explanation: "" }
    ],
    hints: [],
  },
  {
    id: "p-1003",
    slug: "valid-anagram",
    title: "Valid Anagram",
    rating: 900,
    tags: ["hashing", "strings"],
    statement:
      "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    constraints: ["1 ≤ s.length, t.length ≤ 5 * 10^4"],
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true", explanation: "" }
    ],
    hints: [],
  },
  {
    id: "p-1004",
    slug: "remove-duplicates-sorted-array",
    title: "Remove Duplicates from Sorted Array",
    rating: 1100,
    tags: ["two-pointers", "arrays"],
    statement:
      "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each element appears only once.",
    constraints: ["1 ≤ nums.length ≤ 3 * 10^4"],
    examples: [
      { input: "nums = [1,1,2]", output: "2", explanation: "" }
    ],
    hints: [],
  },
  {
    id: "p-1005",
    slug: "first-unique-character",
    title: "First Unique Character in a String",
    rating: 1000,
    tags: ["hashing", "strings"],
    statement:
      "Given a string s, find the first non-repeating character and return its index.",
    constraints: ["1 ≤ s.length ≤ 10^5"],
    examples: [
      { input: 's = "leetcode"', output: "0", explanation: "" }
    ],
  },
  {
    id: "p-1006",
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    rating: 800,
    tags: ["two-pointers", "strings"],
    statement:
      "Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.",
    constraints: [
      "1 ≤ s.length ≤ 2 * 10^5"
    ],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-1007",
    slug: "move-zeroes",
    title: "Move Zeroes",
    rating: 1100,
    tags: ["arrays", "two-pointers"],
    statement:
      "Given an integer array nums, move all 0's to the end while maintaining the relative order of the non-zero elements.",
    constraints: [
      "1 ≤ nums.length ≤ 10^4"
    ],
    examples: [
      {
        input: "nums = [0,1,0,3,12]",
        output: "[1,3,12,0,0]",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-1008",
    slug: "implement-stack-using-array",
    title: "Implement Stack using Array",
    rating: 1200,
    tags: ["stack"],
    statement:
      "Implement a stack using an array. Support push, pop, top, and isEmpty operations.",
    constraints: [
      "1 ≤ operations ≤ 10^4"
    ],
    examples: [
      {
        input: "push(1), push(2), pop()",
        output: "2",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-1009",
    slug: "fibonacci-number",
    title: "Fibonacci Number",
    rating: 1200,
    tags: ["recursion", "dp"],
    statement:
      "Given n, calculate the nth Fibonacci number.",
    constraints: [
      "0 ≤ n ≤ 30"
    ],
    examples: [
      {
        input: "n = 5",
        output: "5",
        explanation: ""
      }
    ],
    hints: [],
  },
  {
    id: "p-2000",
    slug: "max-subarray",
    title: "Maximum Subarray",
    rating: 1300,
    tags: ["dp", "arrays"],
    statement:
      "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    constraints: ["1 ≤ nums.length ≤ 10^5", "-10^4 ≤ nums[i] ≤ 10^4"],
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "We need to find a contiguous subarray with the maximum possible sum.\nIf we look at the array, the subarray:\n[4, -1, 2, 1] has the largest sum.\n4 + (-1) + 2 + 1 = 6\nSo, the maximum subarray sum is 6." }],

    hints: ["You don’t need to look at every possible subarray to find the best one.", "Can current negative sum maximize the total?"],
  },
  {
    id: "p-2001",
    slug: "subarray-sum-equals-k",
    title: "Subarray Sum Equals K",
    rating: 1400,
    tags: ["hashing", "prefix-sum"],
    statement:
      "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals k.",
    constraints: [
      "1 ≤ nums.length ≤ 2 * 10^4"
    ],
    examples: [
      {
        input: "nums = [1,1,1], k = 2",
        output: "2",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-2002",
    slug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    rating: 1500,
    tags: ["strings", "two-pointers"],
    statement:
      "Given a string s, return the longest palindromic substring in s.",
    constraints: [
      "1 ≤ s.length ≤ 1000"
    ],
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-2003",
    slug: "daily-temperatures",
    title: "Daily Temperatures",
    rating: 1500,
    tags: ["stack"],
    statement:
      "Given an array of integers temperatures, return an array such that for each day tells how many days you would have to wait until a warmer temperature.",
    constraints: [
      "1 ≤ temperatures.length ≤ 10^5"
    ],
    examples: [
      {
        input: "temperatures = [73,74,75,71,69,72,76,73]",
        output: "[1,1,4,2,1,1,0,0]",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-2004",
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    rating: 1500,
    tags: ["arrays"],
    statement:
      "Given an integer array nums, return an array answer such that answer[i] is the product of all elements except nums[i].",
    constraints: [
      "2 ≤ nums.length ≤ 10^5"
    ],
    examples: [
      {
        input: "nums = [1,2,3,4]",
        output: "[24,12,8,6]",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-2005",
    slug: "generate-parentheses",
    title: "Generate Parentheses",
    rating: 1500,
    tags: ["recursion", "backtracking"],
    statement:
      "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
    constraints: [
      "1 ≤ n ≤ 8"
    ],
    examples: [
      {
        input: "n = 3",
        output: '["((()))","(()())","(())()","()(())","()()()"]',
        explanation: ""
      }
    ],

    hints: [],
  }, {
    id: "p-2006",
    slug: "container-with-most-water",
    title: "Container With Most Water",
    rating: 1500,
    tags: ["two-pointers"],
    statement:
      "Given n non-negative integers representing height, find two lines that together with the x-axis form a container that holds the most water.",
    constraints: [
      "2 ≤ height.length ≤ 10^5"
    ],
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-2007",
    slug: "decode-string",
    title: "Decode String",
    rating: 1500,
    tags: ["stack", "strings"],
    statement:
      "Given an encoded string, return its decoded string.",
    constraints: [
      "1 ≤ s.length ≤ 10^5"
    ],
    examples: [
      {
        input: 's = "3[a]2[bc]"',
        output: '"aaabcbc"',
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-2008",
    slug: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    rating: 1500,
    tags: ["binary-search"],
    statement:
      "Given a rotated sorted array nums and a target value, return its index or -1 if not found.",
    constraints: [
      "1 ≤ nums.length ≤ 10^5"
    ],
    examples: [
      {
        input: "nums = [4,5,6,7,0,1,2], target = 0",
        output: "4",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3000",
    slug: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    rating: 2000,
    tags: ["sliding-window", "deque"],
    statement:
      "Given an array nums and an integer k, return the maximum value in each sliding window.",
    constraints: [
      "1 ≤ nums.length ≤ 10^5"
    ],
    examples: [
      {
        input: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        output: "[3,3,5,5,6,7]",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3001",
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    rating: 2000,
    tags: ["sliding-window", "hashing"],
    statement:
      "Given two strings s and t, return the minimum window substring of s such that every character in t is included.",
    constraints: [
      "1 ≤ s.length, t.length ≤ 10^5"
    ],
    examples: [
      {
        input: 's = "ADOBECODEBANC", t = "ABC"',
        output: '"BANC"',
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3002",
    slug: "largest-rectangle-histogram",
    title: "Largest Rectangle in Histogram",
    rating: 2000,
    tags: ["stack"],
    statement:
      "Given an array of integers heights representing the histogram's bar height, return the area of the largest rectangle.",
    constraints: [
      "1 ≤ heights.length ≤ 10^5"
    ],
    examples: [
      {
        input: "heights = [2,1,5,6,2,3]",
        output: "10",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3003",
    slug: "word-search",
    title: "Word Search",
    rating: 2000,
    tags: ["backtracking"],
    statement:
      "Given an m x n grid of characters and a word, return true if the word exists in the grid.",
    constraints: [
      "1 ≤ m, n ≤ 6"
    ],
    examples: [
      {
        input: 'board = [["A","B","C"],["D","E","F"]], word = "ABE"',
        output: "true",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3004",
    slug: "merge-k-sorted-lists",
    title: "Merge K Sorted Lists",
    rating: 2000,
    tags: ["divide-and-conquer", "heap"],
    statement:
      "You are given an array of k linked-lists, each sorted in ascending order. Merge all lists into one sorted list.",
    constraints: [
      "0 ≤ k ≤ 10^4"
    ],
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3005",
    slug: "regular-expression-matching",
    title: "Regular Expression Matching",
    rating: 2000,
    tags: ["dp", "strings", "recursion"],
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
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3006",
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    rating: 2000,
    tags: ["two-pointers", "stack"],
    statement:
      "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.",
    constraints: [
      "1 ≤ height.length ≤ 10^5"
    ],
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: ""
      }
    ],

    hints: [],
  },
  {
    id: "p-3007",
    slug: "longest-valid-parentheses",
    title: "Longest Valid Parentheses",
    rating: 2000,
    tags: ["stack", "dp"],
    statement:
      "Given a string containing '(' and ')', find the length of the longest valid parentheses substring.",
    constraints: [
      "0 ≤ s.length ≤ 10^5"
    ],
    examples: [
      {
        input: 's = ")()())"',
        output: "4",
        explanation: ""
      }
    ],
    hints: [],
  },
  {
    id: "p-3008",
    slug: "edit-distance",
    title: "Edit Distance",
    rating: 2000,
    tags: ["dp", "strings"],
    statement:
      "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
    constraints: [
      "0 ≤ word1.length, word2.length ≤ 500"
    ],
    examples: [
      {
        input: 'word1 = "horse", word2 = "ros"',
        output: "3",
        explanation: ""
      }
    ],

    hints: [],
  },
  // Problems for topics: graphs, trees, linked-list, bit-manipulation, sorting-algorithms
  {
    id: "p-4001",
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    rating: 1200,
    tags: ["linked-list"],
    statement: "Given the head of a singly linked list, reverse the list and return the reversed list.",
    constraints: ["0 ≤ number of nodes ≤ 5000", "-5000 ≤ node.val ≤ 5000"],
    examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "" }],
    hints: [],
  },
  {
    id: "p-4002",
    slug: "binary-tree-inorder-traversal",
    title: "Binary Tree Inorder Traversal",
    rating: 1100,
    tags: ["trees"],
    statement: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    constraints: ["0 ≤ number of nodes ≤ 100", "-100 ≤ node.val ≤ 100"],
    examples: [{ input: "root = [1,null,2,3]", output: "[1,3,2]", explanation: "" }],
    hints: [],
  },
  {
    id: "p-4003",
    slug: "number-of-islands",
    title: "Number of Islands",
    rating: 1500,
    tags: ["graphs"],
    statement: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    constraints: ["1 ≤ m, n ≤ 300", "grid[i][j] is '0' or '1'"],
    examples: [{ input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: "1", explanation: "" }],
    hints: [],
  },
  {
    id: "p-4004",
    slug: "counting-bits",
    title: "Counting Bits",
    rating: 1100,
    tags: ["bit-manipulation"],
    statement: "Given an integer n, return an array ans of length n + 1 such that for each i, ans[i] is the number of 1's in the binary representation of i.",
    constraints: ["0 ≤ n ≤ 10^5"],
    examples: [{ input: "n = 2", output: "[0,1,1]", explanation: "" }],
    hints: [],
  },
  {
    id: "p-4005",
    slug: "merge-sorted-array",
    title: "Merge Sorted Array",
    rating: 1100,
    tags: ["sorting-algorithms", "arrays"],
    statement: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums2 into nums1 in place.",
    constraints: ["1 ≤ m + n ≤ 200", "-10^9 ≤ nums1[i], nums2[j] ≤ 10^9"],
    examples: [{ input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]", explanation: "" }],
    hints: [],
  },
];

export function getProblemBySlug(slug) {
  return problems.find((p) => p.slug === slug);
}
