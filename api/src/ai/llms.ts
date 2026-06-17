import { GoogleGenAI } from "@google/genai";
import { input, planInput } from "../types";


export const getExplorerLLM = async (
  env: any,
  input: input,
) => {
  const llm = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY1 as string,
  });

  const answer = await llm.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `
    ISSUE TO FIX:
    "${input.issue}"

    PROJECT FILE TREE:
    ${input.context}
    `,
    config: {
      systemInstruction: `
      You are a Principal Software Engineer. Your task is to filter out the the files to provide which files should change to solve this issue.
      CRITICAL: 
      - You must select a MAXIMUM of 5 files. Choose only the absolute most critical files to resolve the issue.
      - Output Only The required files, NO Talk, No Theory, JUST OUTPUT THESE FILES, AND THANKS.
    {

    }

       `,
      temperature: 0.0,
      maxOutputTokens: 500, 
    },
});

  return answer.text;
};

export const getPlannerLLM = async (
  env: any,
  input: planInput,
) => {
  const llm = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY2 as string,
  });

  const answer = await llm.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `
    ISSUE TO FIX:
    "${input.issue}"

    FILES CONTENT HERE:
    ${input.filesContent}
    `,
    config: {
      systemInstruction: `
      You are an elite Principal Software Engineer. Your task is to output a hyper-focused, clean, and highly readable Markdown implementation plan to solve the provided issue considering files content.

      CRITICAL FORMATTING RULES:
      1. Use bolding, clean markdown subheadings, and short bullet points. Avoid dense paragraphs.
      2. Be concise and direct. Code blocks should show exact architectural changes or code snippets needed.

      Use this EXACT Markdown layout for your response:
      
      ## 🎯 Problem Summary
      [Brief, 1-2 sentence explanation of the root cause]

      ## 🛠️ Proposed Solution
      [High-level logical approach to solve it without over-engineering]

      ## 📋 Step-by-Step Execution Plan
      - [ ] **Step 1: [File Path]** - Clear action item.
      - [ ] **Step 2: [File Path]** - Clear action item.
      
      ## 💻 Code Snippet Example
      \`\`\`typescript
      // Show a clean, minimal example of the new implementation
      \`\`\`
       `,
      temperature: 0.1,
      maxOutputTokens: 1300, 
    },
});

  return answer.text;
};