import { env } from '../lib/env';
import { BadRequestError } from '../utils/errors';

export type AIReviewRequest = {
  language: 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';
  code: string;
  prompt?: string; // optional additional instruction/context
};

async function getGenAI() {
  const mod: any = await import('@google/genai');
  const GoogleGenAI = mod.GoogleGenAI || mod.default?.GoogleGenAI || mod.default;
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

export async function getAIReview({
  language,
  code,
  prompt,
}: AIReviewRequest): Promise<{ advice: string }> {
  if (!env.GEMINI_API_KEY) throw new BadRequestError('AI review is not enabled');
  const genAI = await getGenAI();

  const system = `You are an expert competitive programming mentor and AI code judge.
You will evaluate the user's ${language} code submission for an online judge problem.

Your goals:
1. Understand and summarize what the code is doing.
2. Judge correctness:
   - Analyze logic and completeness.
   - Check for edge cases, input parsing issues, and constraint violations.
3. Test the code mentally using examples and typical edge cases.
   - Mention potential failing cases if any.
4. Analyze time and space complexity.
5. Evaluate efficiency, readability, and code style.
6. Assign a score (0–100) based on:
   - Correctness (50%)
   - Efficiency (30%)
   - Code quality (20%)
   Provide the breakdown (e.g., Correctness: 45/50, Efficiency: 25/30, Quality: 18/20 → Total: 88/100)
7. Suggest concrete improvements for logic, performance, or clarity.
8. If beneficial, show a corrected or optimized version of the code with concise comments.

Response format:
- **Summary**
- **Correctness Review**
- **Complexity**
- **Efficiency & Style**
- **Score Breakdown**
- **Suggested Improvements**
- **Improved Code (if applicable)**

Be concise, structured, and objective — like an automated online judge feedback report.`;

  const contents = [
    system,
    prompt ? `Additional context: ${prompt}` : undefined,
    `Code:\n\n${code}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
    },
  } as any);
  const text: string = (response as any).text ?? (response as any).output_text ?? '';
  return { advice: text };
}
