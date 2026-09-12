import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const generateSchema = z.object({
  type: z.enum(['TITLE', 'DESCRIPTION', 'TAGS', 'THUMBNAIL_IDEAS', 'SCRIPT', 'FULL']),
  context: z.string().min(10).max(5000),
  tone: z.enum(['PROFESSIONAL', 'CASUAL', 'FUNNY', 'DRAMATIC', 'EDUCATIONAL']).default('PROFESSIONAL'),
  targetAudience: z.string().max(200).optional(),
  language: z.string().length(2).default('en'),
  maxLength: z.number().int().positive().max(10000).default(1000),
});

const MOCK_AI_DELAY = 1000;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { type, context, tone, targetAudience, language, maxLength } = validation.data;

    await simulateProcessing(MOCK_AI_DELAY);

    const result = generateMockContent(type, context, tone, targetAudience, language, maxLength);

    return NextResponse.json({
      result,
      type,
      tone,
      language,
      model: 'ai-platform-v1',
      tokensUsed: estimateTokens(context + result),
      suggestions: generateSuggestions(type, context),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    console.error('[AI_GENERATE]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function generateMockContent(
  type: string,
  context: string,
  tone: string,
  targetAudience?: string,
  language: string = 'en',
  maxLength: number = 1000
): string {
  const audienceNote = targetAudience ? ` for ${targetAudience}` : '';

  switch (type) {
    case 'TITLE':
      return generateTitle(context, tone);
    case 'DESCRIPTION':
      return generateDescription(context, tone, audienceNote, maxLength);
    case 'TAGS':
      return generateTags(context);
    case 'THUMBNAIL_IDEAS':
      return generateThumbnailIdeas(context);
    case 'SCRIPT':
      return generateScript(context, tone, maxLength);
    case 'FULL':
      return JSON.stringify({
        title: generateTitle(context, tone),
        description: generateDescription(context, tone, audienceNote, maxLength),
        tags: generateTags(context).split(',').map((t) => t.trim()),
        thumbnailIdeas: generateThumbnailIdeas(context).split('\n'),
      });
    default:
      return `Generated content for: ${context.slice(0, 100)}`;
  }
}

function generateTitle(context: string, tone: string): string {
  const keywords = extractKeywords(context);
  const templates: Record<string, string[]> = {
    PROFESSIONAL: [
      `Complete Guide to ${keywords[0] || 'Success'}`,
      `${keywords[0] || 'Expert'} Tips You Need to Know`,
      `How to Master ${keywords[0] || 'Your Craft'}`,
    ],
    CASUAL: [
      `Everything About ${keywords[0] || 'This'} (You Won't Believe!)`,
      `My ${keywords[0] || 'Best'} Tips & Tricks`,
      `Let's Talk About ${keywords[0] || 'This Topic'}`,
    ],
    FUNNY: [
      `${keywords[0] || 'This'} but Make It Dramatic`,
      `POV: You Finally Learn About ${keywords[0] || 'This'}`,
      `${keywords[0] || 'Things'} Nobody Asked For (But Here It Is)`,
    ],
  };
  const toneTemplates = templates[tone] || templates.PROFESSIONAL;
  return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
}

function generateDescription(context: string, tone: string, audienceNote: string, maxLength: number): string {
  const keywords = extractKeywords(context);
  const desc = `Discover everything you need to know about ${keywords.slice(0, 3).join(', ') || 'this topic'}${audienceNote}. ` +
    `In this comprehensive guide, we dive deep into the strategies and insights that will help you succeed. ` +
    `Whether you're a beginner or an expert, this content is packed with valuable information.\n\n` +
    `Key Topics Covered:\n` +
    `- ${keywords[0] || 'Introduction'} - Understanding the fundamentals\n` +
    `- ${keywords[1] || 'Advanced Strategies'} - Taking your skills to the next level\n` +
    `- ${keywords[2] || 'Expert Tips'} - Proven methods that work\n\n` +
    `Timestamps:\n` +
    `00:00 - Introduction\n` +
    `01:30 - ${keywords[0] || 'Main Content'}\n` +
    `05:00 - Deep Dive\n` +
    `10:00 - Key Takeaways\n\n` +
    `#${keywords.join(' #')}\n\n` +
    `Subscribe for more content like this!`;
  return desc.slice(0, maxLength);
}

function generateTags(context: string): string {
  const keywords = extractKeywords(context);
  const relatedTags = [
    'tutorial', 'guide', 'tips', 'howto', 'education',
    'learning', 'explained', 'beginner', 'advanced',
  ];
  return [...keywords, ...relatedTags.slice(0, 3)].join(', ');
}

function generateThumbnailIdeas(context: string): string {
  const keywords = extractKeywords(context);
  return [
    `1. Bold text overlay: "${keywords[0] || 'SHOCKING'} - Watch This!" with a dramatic background`,
    `2. Split comparison image with before/after concept related to ${keywords[0] || 'the topic'}`,
    `3. Expressive face with pointing gesture and text: "You NEED to Know This"`,
    `4. Clean minimal design with the main keyword in large typography`,
    `5. Infographic-style with 3-5 key points visible`,
  ].join('\n');
}

function generateScript(context: string, tone: string, maxLength: number): string {
  const keywords = extractKeywords(context);
  const toneStyle = tone === 'CASUAL' ? "Hey everyone!" : tone === 'FUNNY' ? "Alright, buckle up!" : "Hello, and welcome.";

  return [
    `[INTRO]`,
    `${toneStyle} Today we're diving deep into ${keywords[0] || 'this fascinating topic'}.`,
    `By the end of this, you'll have a completely new understanding of ${keywords.slice(0, 2).join(' and ') || 'the subject'}.`,
    ``,
    `[MAIN CONTENT]`,
    `Let's start with the basics. ${keywords[0] || 'This concept'} is something that`,
    `affects everyone, whether you realize it or not.`,
    ``,
    `Point 1: ${keywords[0] || 'Foundation'}`,
    `The most important thing to understand is...`,
    `This is where most people get it wrong.`,
    ``,
    `Point 2: ${keywords[1] || 'Advanced Concepts'}`,
    `Now that we've covered the basics, let's level up.`,
    `Here's where things get really interesting...`,
    ``,
    `Point 3: ${keywords[2] || 'Pro Tips'}`,
    `These are the strategies that separate the experts from everyone else.`,
    ``,
    `[CONCLUSION]`,
    `So there you have it - ${keywords[0] || 'the complete breakdown'}.`,
    `If you found this helpful, make sure to like and subscribe!`,
    `Drop a comment below with your thoughts.`,
  ].join('\n').slice(0, maxLength);
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

function generateSuggestions(type: string, context: string): string[] {
  const suggestions: Record<string, string[]> = {
    TITLE: [
      'Try adding a number to make the title more specific',
      'Include emotional triggers for higher CTR',
      'Keep it under 60 characters for optimal display',
    ],
    DESCRIPTION: [
      'Add timestamps for better viewer navigation',
      'Include relevant links and CTAs',
      'Use emojis sparingly for visual appeal',
    ],
    TAGS: [
      'Mix broad and specific tags for better reach',
      'Include trending hashtags when relevant',
      'Limit to 15-20 most relevant tags',
    ],
  };
  return suggestions[type] || ['Consider adding more context for better results'];
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function simulateProcessing(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
