interface Framework {
  _id: string;
  name: string;
  description: string;
  pattern: string;
  domain: string;
}

interface GeneratePromptOptions {
  apiKey: string;
  domain: "coding" | "running";
  frameworks: Framework[];
  recentPrompts: string[];
  mode: "domain_lock" | "guided" | "framework_lock" | "freestyle";
  selectedFrameworkIds?: string[];
}

interface GeneratedPrompt {
  topic: string;
  domain: string;
  frameworks: string[];
  frameworkIds: string[];
  hookSuggestion: string;
}

const SYSTEM_PROMPT = `You are a speaking coach helping someone practice creating short-form content for LinkedIn.

Your job is to generate practice prompts that:
1. Are specific and opinionated (not generic)
2. Match the user's domain expertise
3. Suggest 1-2 frameworks to use from the provided list
4. Include a hook suggestion to get them started

IMPORTANT: Do NOT repeat topics from the recent prompts list.

Respond in JSON format:
{
  "topic": "The specific topic/angle to speak about",
  "frameworks": ["Framework Name 1", "Framework Name 2"],
  "hookSuggestion": "A punchy opening line they could use"
}`;

export async function generatePrompt(options: GeneratePromptOptions): Promise<GeneratedPrompt> {
  const { apiKey, domain, frameworks, recentPrompts, mode, selectedFrameworkIds } = options;

  // Filter frameworks based on mode
  let availableFrameworks = frameworks;
  if (mode === "framework_lock" && selectedFrameworkIds?.length) {
    availableFrameworks = frameworks.filter((f) =>
      selectedFrameworkIds.includes(f._id)
    );
  }

  const frameworkContext = availableFrameworks
    .map((f) => `- ${f.name}: ${f.description}`)
    .join("\n");

  const recentContext =
    recentPrompts.length > 0
      ? `\nRecent prompts to AVOID repeating:\n${recentPrompts.map((p) => `- ${p}`).join("\n")}`
      : "";

  const domainContext =
    domain === "coding"
      ? "Focus on: developer mindset, tooling opinions, coding insights, React Native, on-device ML, debugging stories, tech hot takes"
      : "Focus on: running technique, cadence, form correction, training insights, injury prevention, mental aspects of running";

  const userPrompt = `Domain: ${domain}
${domainContext}

Available frameworks:
${frameworkContext}
${recentContext}

Generate a practice prompt for a ${domain} topic.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate prompt");
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in response");
  }

  // Parse the JSON response
  const parsed = JSON.parse(content);

  // Map framework names back to IDs
  const frameworkIds = parsed.frameworks
    .map((name: string) => {
      const found = frameworks.find(
        (f) => f.name.toLowerCase() === name.toLowerCase()
      );
      return found?._id;
    })
    .filter(Boolean);

  return {
    topic: parsed.topic,
    domain,
    frameworks: parsed.frameworks,
    frameworkIds,
    hookSuggestion: parsed.hookSuggestion,
  };
}

// Script generation for guided practice
interface GenerateScriptOptions {
  apiKey: string;
  topic: string;
  frameworks: { name: string; pattern: string }[];
}

const SCRIPT_SYSTEM_PROMPT = `You are a speaking coach helping someone practice short-form content delivery.

Your job is to generate a SCRIPT they can read/practice with. The script MUST:
1. Follow the exact structure of the provided framework patterns
2. Be specific to their topic
3. Include clear markers for each framework step (e.g., [PUNCH], [EXPAND], etc.)
4. Be natural and conversational - something they'd actually say
5. Be 60-90 seconds when spoken (roughly 150-200 words)

Format the script with clear section headers matching the framework steps.
Make it punchy, opinionated, and engaging - not generic or corporate.`;

export async function generateScript(options: GenerateScriptOptions): Promise<string> {
  const { apiKey, topic, frameworks } = options;

  const frameworkPatterns = frameworks
    .map((f) => `### ${f.name}\n${f.pattern}`)
    .join("\n\n");

  const userPrompt = `Topic: ${topic}

Frameworks to use (MUST follow these patterns exactly):
${frameworkPatterns}

Generate a practice script that follows these framework patterns for the given topic.
Include [SECTION MARKERS] so they know which part of the framework they're delivering.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SCRIPT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate script");
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in response");
  }

  return content;
}

