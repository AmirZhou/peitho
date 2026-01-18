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
      response_format: { type: "json_object" },
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

  // Parse the JSON response (strip markdown if present)
  const parsed = JSON.parse(stripMarkdownCodeBlock(content));

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

export interface ScriptSection {
  label: string;
  content: string;
  keywords: string[];
}

export interface StructuredScript {
  sections: ScriptSection[];
}

const SCRIPT_SYSTEM_PROMPT = `You are a speaking coach helping someone practice short-form content delivery.

Your job is to generate a STRUCTURED SCRIPT they can read/practice with. The script MUST:
1. Follow the exact structure of the provided framework patterns
2. Be specific to their topic
3. Be natural and conversational - something they'd actually say
4. Be 60-90 seconds when spoken (roughly 150-200 words total)

For each section, extract 3-5 KEYWORDS that are essential to the message. These will be used for hint levels during practice.

Respond in JSON format:
{
  "sections": [
    {
      "label": "Hook (Contrarian Opening)",
      "content": "The full text for this section...",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Make it punchy, opinionated, and engaging - not generic or corporate.`;

export async function generateScript(options: GenerateScriptOptions): Promise<StructuredScript> {
  const { apiKey, topic, frameworks } = options;

  const frameworkPatterns = frameworks
    .map((f) => `### ${f.name}\n${f.pattern}`)
    .join("\n\n");

  const userPrompt = `Topic: ${topic}

Frameworks to use (MUST follow these patterns exactly):
${frameworkPatterns}

Generate a structured practice script that follows these framework patterns for the given topic.
Each section should map to a step in the framework.`;

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
      max_tokens: 800,
      response_format: { type: "json_object" },
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

  const parsed = JSON.parse(content);

  return {
    sections: parsed.sections || [],
  };
}

// ==================== Transcription & Evaluation ====================

export interface TranscriptionResult {
  text: string;
  segments?: { start: number; end: number; text: string }[];
}

// Transcribe audio using Whisper
export async function transcribeAudio(
  apiKey: string,
  audioBlob: Blob
): Promise<TranscriptionResult> {
  const formData = new FormData();

  // Whisper expects a file, so we need to create one from the blob
  const audioFile = new File([audioBlob], "recording.webm", {
    type: audioBlob.type || "audio/webm",
  });

  formData.append("file", audioFile);
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to transcribe audio");
  }

  const data = await response.json();

  return {
    text: data.text,
    segments: data.segments?.map((seg: { start: number; end: number; text: string }) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })),
  };
}

// Evaluation result interface
export interface EvaluationResult {
  overallScore: number; // 1-10
  summary: string;
  frameworkAdherence: {
    framework: string;
    score: number; // 1-10
    feedback: string;
  }[];
  sentenceFeedback: {
    sentence: string;
    feedback: string;
    suggestion?: string;
  }[];
  strengths: string[];
  improvements: string[];
}

const EVALUATION_SYSTEM_PROMPT = `You are an expert speaking coach evaluating short-form content delivery.

You evaluate based on:
1. Framework adherence - Did they follow the framework structure?
2. Clarity - Is the message clear and easy to follow?
3. Punchiness - Is it engaging and concise?
4. Flow - Does it sound natural when spoken?
5. Specificity - Are examples concrete, not vague?

Be constructive but direct. Focus on actionable improvements.

Respond in JSON format:
{
  "overallScore": 7,
  "summary": "Brief 1-2 sentence overall assessment",
  "frameworkAdherence": [
    {
      "framework": "Framework Name",
      "score": 8,
      "feedback": "How well they followed this framework"
    }
  ],
  "sentenceFeedback": [
    {
      "sentence": "The sentence from their transcript",
      "feedback": "What could be improved",
      "suggestion": "Alternative phrasing (optional)"
    }
  ],
  "strengths": ["What they did well"],
  "improvements": ["Specific things to work on"]
}

Only include sentenceFeedback for sentences that need improvement. Limit to 3-5 key sentences.`;

export async function evaluateTranscript(
  apiKey: string,
  transcript: string,
  topic: string,
  frameworks: { name: string; pattern: string }[]
): Promise<EvaluationResult> {
  const frameworkContext = frameworks
    .map((f) => `### ${f.name}\nPattern:\n${f.pattern}`)
    .join("\n\n");

  const userPrompt = `Topic they were speaking about: ${topic}

Frameworks they should have followed:
${frameworkContext}

Their transcript:
"${transcript}"

Evaluate their delivery against the frameworks.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: EVALUATION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent evaluations
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to evaluate transcript");
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in response");
  }

  // Parse the JSON response
  const parsed = JSON.parse(content);

  return {
    overallScore: parsed.overallScore,
    summary: parsed.summary,
    frameworkAdherence: parsed.frameworkAdherence || [],
    sentenceFeedback: parsed.sentenceFeedback || [],
    strengths: parsed.strengths || [],
    improvements: parsed.improvements || [],
  };
}

