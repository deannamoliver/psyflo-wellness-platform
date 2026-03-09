/**
 * Utility prompts for parsing and processing responses
 */

/**
 * Generic yes/no/past_resolved answer parser for CSSR screening questions
 * Used by: indirect-risk.ts
 */
export function getYesNoParserPrompt(params: {
  questionAsked: string;
  userResponse: string;
}) {
  return `You are analyzing a response to a suicide risk screening question. 
The question asked was: "${params.questionAsked}"

The user's response was: "${params.userResponse}"

Analyze whether this response indicates a "yes", "no", or "past_resolved" answer.

**Guidelines:**
- "yes" includes: explicit yes, yeah, yep, I have, I do, sometimes, a lot, currently, recently, maybe, yeah maybe, kind of, sort of
- "no" includes: explicit no, nope, never, not really, not at all, I don't, I haven't
- "past_resolved" includes: used to but not anymore, in the past but not now, I did before but things are better, not anymore, I used to, it happened before but I'm okay now, things have gotten better, I don't feel that way anymore

**Critical Distinction:**
When the student indicates they HAD these thoughts/feelings in the past but EXPLICITLY states they no longer do, classify as "past_resolved". This is different from "yes" because the student is indicating positive change.

Examples of "past_resolved":
- "It did in the past sometimes but not anymore"
- "I used to feel that way but I'm better now"  
- "Not anymore, things have changed"
- "I did before but not recently"

**Handling Ambiguity:**
Any response that lies on the spectrum between "yes" and "no" (including "maybe", "yeah maybe", "not sure", "kind of") should be classified as "yes".
Only use "unclear" if the response is completely irrelevant and does not answer the question at all.

Respond with ONLY one word: "yes", "no", "past_resolved", or "unclear" (lowercase).`;
}
