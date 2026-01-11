export const LANGUAGE_TEMPLATES = {
    javascript: `// JavaScript Solution
/**
 * @param {any} input
 * @returns {any}
 */
function solve(input) {
  // Your code here
  return input;
}
`,
    python: `# Python Solution
def solve(input):
    # Your code here
    return input
`,
    java: `// Java Solution
public class Solution {
    public static void solve(Object input) {
        // Your code here
    }
}
`,
    cpp: `// C++ Solution
#include <iostream>
using namespace std;

void solve() {
    // Your code here
}
`,
    go: `// Go Solution
package main

import "fmt"

func solve() {
    // Your code here
}
`
};

export const LANGUAGE_SNIPPETS = {
    javascript: [
        {
            label: 'clg',
            insertText: 'console.log(${1:value});',
            detail: 'Console Log'
        },
        {
            label: 'fun',
            insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
            detail: 'Function Declaration'
        },
        {
            label: 'for',
            insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}',
            detail: 'For Loop'
        }
    ],
    // Add other languages as needed
};

export const getTemplate = (language) => {
    return LANGUAGE_TEMPLATES[language] || '';
};
