import { z } from 'zod';
import { getAIProviderClient, createStructuredPrompt, type AIProvider, type AICompletionResponse } from './provider';

export type ContentTone = 'professional' | 'casual' | 'humorous' | 'educational' | 'dramatic' | 'inspirational';
export type VideoStyle = 'tutorial' | 'vlog' | 'review' | 'documentary' | 'short_form' | 'podcast' | 'news' | 'entertainment';
export type ThumbnailStyle = 'bold_text' | 'face_reaction' | 'comparison' | 'minimalist' | 'cinematic' | 'branded';

export interface ScriptRequest {
  topic: string;
  style: VideoStyle;
  tone: ContentTone;
  targetDuration: number;
  targetAudience: string;
  keywords?: string[];
  brandVoice?: string;
  includeChapters?: boolean;
  language?: string;
}

export interface ScriptSection {
  title: string;
  content: string;
  startTime: number;
  endTime: number;
  notes: string[];
  bRollSuggestions: string[];
  onScreenText?: string;
}

export interface GeneratedScript {
  id: string;
  title: string;
  hook: string;
  sections: ScriptSection[];
  totalDuration: number;
  wordCount: number;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  chapters: Array<{ title: string; timestamp: number }>;
  cta: string;
  metadata: {
    provider: AIProvider;
    model: string;
    tokensUsed: number;
    generatedAt: string;
  };
}

export interface ThumbnailRequest {
  title: string;
  style: ThumbnailStyle;
  brandColors?: string[];
  includeFace?: boolean;
  facialExpression?: 'excited' | 'curious' | 'shocked' | 'happy' | 'serious';
  textOverlay?: string;
  aspectRatio?: '16:9' | '1:1' | '9:16';
}

export interface GeneratedThumbnail {
  id: string;
  imageUrl: string;
  base64?: string;
  width: number;
  height: number;
  textElements: Array<{
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontWeight: string;
  }>;
  colorPalette: string[];
  metadata: {
    provider: AIProvider;
    prompt: string;
    generatedAt: string;
  };
}

export interface TitleRequest {
  topic: string;
  style: VideoStyle;
  targetAudience: string;
  keywords?: string[];
  competitorTitles?: string[];
  maxTitles?: number;
}

export interface TitleSuggestion {
  title: string;
  score: number;
  clickbaitScore: number;
  seoScore: number;
  readabilityScore: number;
  emotionalTrigger: string;
  estimatedCtr: number;
  reasoning: string;
}

export interface DescriptionRequest {
  title: string;
  topic: string;
  style: VideoStyle;
  keywords?: string[];
  links?: Array<{ label: string; url: string }>;
  socialLinks?: Record<string, string>;
  includeTimestamps?: boolean;
  timestamps?: Array<{ time: number; label: string }>;
}

export interface GeneratedDescription {
  description: string;
  shortDescription: string;
  tags: string[];
  hashtags: string[];
  mentions: string[];
  links: Array<{ label: string; url: string; position: number }>;
  metadata: {
    wordCount: number;
    charCount: number;
    keywordDensity: Record<string, number>;
  };
}

export interface ContentPlanRequest {
  channelNiche: string;
  postingFrequency: 'daily' | '3x_weekly' | 'weekly' | 'biweekly' | 'monthly';
  targetAudience: string;
  goals: string[];
  seasonality?: string;
  trendingTopics?: string[];
  excludeTopics?: string[];
}

export interface ContentPlan {
  id: string;
  channelNiche: string;
  period: { start: string; end: string };
  posts: Array<{
    date: string;
    title: string;
    type: VideoStyle;
    topic: string;
    keywords: string[];
    estimatedViews: number;
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'planned' | 'in_progress' | 'filming' | 'editing' | 'scheduled' | 'published';
  }>;
  metrics: {
    totalPosts: number;
    estimatedTotalViews: number;
    averageViewsPerPost: number;
    contentMix: Record<VideoStyle, number>;
  };
  metadata: {
    provider: AIProvider;
    generatedAt: string;
  };
}

const ScriptSchema = z.object({
  title: z.string(),
  hook: z.string(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    notes: z.array(z.string()),
    bRollSuggestions: z.array(z.string()),
    onScreenText: z.string().optional(),
  })),
  totalDuration: z.number(),
  wordCount: z.number(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  tags: z.array(z.string()),
  chapters: z.array(z.object({ title: z.string(), timestamp: z.number() })),
  cta: z.string(),
});

const TitleSuggestionsSchema = z.object({
  titles: z.array(z.object({
    title: z.string(),
    score: z.number(),
    clickbaitScore: z.number(),
    seoScore: z.number(),
    readabilityScore: z.number(),
    emotionalTrigger: z.string(),
    estimatedCtr: z.number(),
    reasoning: z.string(),
  })),
});

const DescriptionSchema = z.object({
  description: z.string(),
  shortDescription: z.string(),
  tags: z.array(z.string()),
  hashtags: z.array(z.string()),
  mentions: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), url: z.string(), position: z.number() })),
});

const ContentPlanSchema = z.object({
  posts: z.array(z.object({
    date: z.string(),
    title: z.string(),
    type: z.string(),
    topic: z.string(),
    keywords: z.array(z.string()),
    estimatedViews: z.number(),
    difficulty: z.string(),
  })),
});

function generateId(): string {
  return `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 150;
  return Math.ceil(wordCount / wordsPerMinute) * 60;
}

function estimateWordCount(durationSeconds: number): number {
  const wordsPerMinute = 150;
  return Math.floor((durationSeconds / 60) * wordsPerMinute);
}

export class ContentGeneratorService {
  private getClient() {
    return getAIProviderClient();
  }

  async generateScript(request: ScriptRequest): Promise<GeneratedScript> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');
    const targetWords = estimateWordCount(request.targetDuration);

    const systemPrompt = `You are a professional video script writer for YouTube and social media.
Write engaging, well-structured scripts that keep viewers watching.
Use conversational language, short sentences, and power words.
Include specific timestamps and visual cues for the editor.
Target approximately ${targetWords} words for a ${request.targetDuration}-second video.`;

    const userPrompt = `Write a complete video script about: "${request.topic}"

Style: ${request.style}
Tone: ${request.tone}
Target audience: ${request.targetAudience}
${request.keywords?.length ? `Keywords to include: ${request.keywords.join(', ')}` : ''}
${request.brandVoice ? `Brand voice: ${request.brandVoice}` : ''}
${request.includeChapters ? 'Include chapter markers.' : ''}
Language: ${request.language ?? 'English'}

Structure the script with:
1. A compelling hook (first 5-10 seconds)
2. Clear sections with timestamps
3. B-roll suggestions for each section
4. On-screen text recommendations
5. A strong call-to-action at the end

Return the script as JSON matching the provided schema.`;

    const messages = createStructuredPrompt(ScriptSchema, systemPrompt, userPrompt);
    const response = await client.complete({
      model,
      messages,
      temperature: 0.8,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as z.infer<typeof ScriptSchema>;

    return {
      id: generateId(),
      title: parsed.title,
      hook: parsed.hook,
      sections: parsed.sections,
      totalDuration: parsed.totalDuration || request.targetDuration,
      wordCount: parsed.wordCount || targetWords,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      tags: parsed.tags,
      chapters: parsed.chapters,
      cta: parsed.cta,
      metadata: {
        provider: response.provider,
        model: response.model,
        tokensUsed: response.usage.totalTokens,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async generateTitles(request: TitleRequest): Promise<TitleSuggestion[]> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');
    const maxTitles = request.maxTitles ?? 10;

    const systemPrompt = `You are a YouTube title optimization expert.
Generate compelling, click-worthy titles that balance SEO with viewer appeal.
Analyze each title for clickbait level, SEO quality, readability, and estimated CTR.
Titles should be under 60 characters when possible for full visibility.`;

    const userPrompt = `Generate ${maxTitles} title suggestions for a video about: "${request.topic}"

Video style: ${request.style}
Target audience: ${request.targetAudience}
${request.keywords?.length ? `Keywords: ${request.keywords.join(', ')}` : ''}
${request.competitorTitles?.length ? `Competitor titles to differentiate from:\n${request.competitorTitles.join('\n')}` : ''}

For each title, provide:
- The title text
- Overall score (0-100)
- Clickbait score (0=none, 100=extreme clickbait)
- SEO score (0-100)
- Readability score (0-100)
- The primary emotional trigger used
- Estimated CTR (as a percentage)
- Brief reasoning for the score

Return as JSON matching the provided schema.`;

    const messages = createStructuredPrompt(TitleSuggestionsSchema, systemPrompt, userPrompt);
    const response = await client.complete({
      model,
      messages,
      temperature: 0.9,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as z.infer<typeof TitleSuggestionsSchema>;
    return parsed.titles.map((t) => ({
      ...t,
      clickbaitScore: Math.min(100, Math.max(0, t.clickbaitScore)),
      seoScore: Math.min(100, Math.max(0, t.seoScore)),
      readabilityScore: Math.min(100, Math.max(0, t.readabilityScore)),
    }));
  }

  async generateDescription(request: DescriptionRequest): Promise<GeneratedDescription> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a YouTube SEO expert who writes optimized video descriptions.
Descriptions should front-load important keywords in the first 2 lines.
Include relevant hashtags, timestamps if provided, and a natural flow.
Optimize for both YouTube search and Google search snippets.`;

    const userPrompt = `Write an optimized YouTube description for:
Title: "${request.title}"
Topic: ${request.topic}
Style: ${request.style}
${request.keywords?.length ? `Keywords: ${request.keywords.join(', ')}` : ''}
${request.includeTimestamps && request.timestamps?.length
  ? `Timestamps:\n${request.timestamps.map((t) => `${formatTime(t.time)} - ${t.label}`).join('\n')}`
  : ''}
${request.links?.length ? `Links to include:\n${request.links.map((l) => `${l.label}: ${l.url}`).join('\n')}` : ''}
${request.socialLinks ? `Social links: ${JSON.stringify(request.socialLinks)}` : ''}

Provide:
- Full description (max 5000 chars)
- Short description (max 200 chars)
- Tags array (max 15)
- Hashtags array (max 10)
- Any @mentions

Return as JSON matching the provided schema.`;

    const messages = createStructuredPrompt(DescriptionSchema, systemPrompt, userPrompt);
    const response = await client.complete({
      model,
      messages,
      temperature: 0.7,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as z.infer<typeof DescriptionSchema>;
    const allLinks = [
      ...parsed.links,
      ...(request.links ?? []).map((l, i) => ({
        label: l.label,
        url: l.url,
        position: parsed.description.indexOf(l.url),
      })).filter((l) => l.position >= 0),
    ];

    return {
      description: parsed.description,
      shortDescription: parsed.shortDescription,
      tags: parsed.tags,
      hashtags: parsed.hashtags,
      mentions: parsed.mentions,
      links: allLinks,
      metadata: {
        wordCount: parsed.description.split(/\s+/).length,
        charCount: parsed.description.length,
        keywordDensity: calculateKeywordDensity(parsed.description, request.keywords ?? []),
      },
    };
  }

  async generateThumbnail(request: ThumbnailRequest): Promise<GeneratedThumbnail> {
    const client = this.getClient();

    const textParts: string[] = [];
    if (request.title) textParts.push(`Title: "${request.title}"`);
    if (request.textOverlay) textParts.push(`Text overlay: "${request.textOverlay}"`);

    const prompt = `Create a professional YouTube thumbnail with ${request.style} style.
${textParts.join('\n')}
${request.brandColors?.length ? `Brand colors: ${request.brandColors.join(', ')}` : ''}
${request.includeFace ? `Include a person with a ${request.facialExpression ?? 'engaged'} expression.` : 'No face required.'}
Aspect ratio: ${request.aspectRatio ?? '16:9'}
Style: High contrast, eye-catching, professional quality, vibrant colors.
Maximum visual impact for YouTube browsing.`;

    const response = await client.complete({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional thumbnail designer. Analyze the request and return a detailed thumbnail design specification.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2048,
      responseFormat: { type: 'json_object' },
    });

    const designSpec = JSON.parse(response.content) as Record<string, unknown>;

    const aspectRatio = request.aspectRatio ?? '16:9';
    const [w, h] = aspectRatio.split(':').map(Number);
    const width = w * 120;
    const height = h * 120;

    return {
      id: generateId(),
      imageUrl: `/api/ai/thumbnail/${generateId()}`,
      width,
      height,
      textElements: extractTextElements(designSpec),
      colorPalette: extractColorPalette(designSpec, request.brandColors),
      metadata: {
        provider: response.provider,
        prompt,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async generateContentPlan(request: ContentPlanRequest): Promise<ContentPlan> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const postsPerWeek = {
      daily: 7,
      '3x_weekly': 3,
      weekly: 1,
      biweekly: 0.5,
      monthly: 0.25,
    }[request.postingFrequency];

    const weeksToGenerate = 4;
    const totalPosts = Math.ceil(postsPerWeek * weeksToGenerate);

    const systemPrompt = `You are a YouTube content strategist who creates data-driven content plans.
Create a balanced content calendar that mixes evergreen and trending topics.
Consider audience retention, algorithm favorability, and channel growth.
Each post should have realistic view estimates based on channel niche.`;

    const userPrompt = `Create a ${weeksToWeekLabel(weeksToGenerate)} content plan for a ${request.channelNiche} channel.

Posting frequency: ${request.postingFrequency} (${totalPosts} posts total)
Target audience: ${request.targetAudience}
Goals: ${request.goals.join(', ')}
${request.seasonality ? `Seasonal context: ${request.seasonality}` : ''}
${request.trendingTopics?.length ? `Trending topics to leverage: ${request.trendingTopics.join(', ')}` : ''}
${request.excludeTopics?.length ? `Avoid these topics: ${request.excludeTopics.join(', ')}` : ''}

Distribute post types across: tutorial, vlog, review, documentary, short_form, entertainment
Each post should have:
- Realistic publish date
- Compelling title
- Post type
- Main topic
- Target keywords
- Estimated views
- Difficulty level

Return as JSON matching the provided schema.`;

    const messages = createStructuredPrompt(ContentPlanSchema, systemPrompt, userPrompt);
    const response = await client.complete({
      model,
      messages,
      temperature: 0.7,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as z.infer<typeof ContentPlanSchema>;

    const posts = parsed.posts.map((p) => ({
      ...p,
      type: p.type as VideoStyle,
      difficulty: p.difficulty as 'easy' | 'medium' | 'hard',
      status: 'planned' as const,
    }));

    const contentMix: Record<string, number> = {};
    let totalViews = 0;
    for (const post of posts) {
      contentMix[post.type] = (contentMix[post.type] || 0) + 1;
      totalViews += post.estimatedViews;
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + weeksToGenerate * 7);

    return {
      id: generateId(),
      channelNiche: request.channelNiche,
      period: {
        start: now.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      posts,
      metrics: {
        totalPosts: posts.length,
        estimatedTotalViews: totalViews,
        averageViewsPerPost: Math.round(totalViews / posts.length),
        contentMix: contentMix as Record<VideoStyle, number>,
      },
      metadata: {
        provider: response.provider,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async generateRepurposePlan(
    originalTitle: string,
    originalContent: string,
    targetPlatforms: string[],
  ): Promise<Array<{
    platform: string;
    format: string;
    title: string;
    description: string;
    dimensions: { width: number; height: number };
    tips: string[];
  }>> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are a multi-platform content strategist.
Given original video content, create platform-specific repurposing plans.
Each platform has different audience expectations, formats, and algorithm preferences.
Optimize for each platform's strengths.`;

    const userPrompt = `Original video: "${originalTitle}"
Content summary: ${originalContent.substring(0, 500)}

Create repurposing plans for these platforms: ${targetPlatforms.join(', ')}

For each platform, provide:
- Recommended format (short, vertical, horizontal, story, carousel, etc.)
- Platform-optimized title
- Platform-optimized description
- Recommended dimensions
- 3-5 specific tips for that platform

Return as JSON with an array of platform plans.`;

    const response = await client.complete({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as {
      platforms: Array<{
        platform: string;
        format: string;
        title: string;
        description: string;
        dimensions: { width: number; height: number };
        tips: string[];
      }>;
    };

    return parsed.platforms ?? [];
  }

  async analyzeContentPerformance(
    titles: string[],
    descriptions: string[],
    viewCounts: number[],
  ): Promise<{
    averageCtr: number;
    topPerformers: Array<{ title: string; views: number; analysis: string }>;
    improvementAreas: string[];
    titlePatterns: string[];
    recommendations: string[];
  }> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const data = titles.map((t, i) => ({
      title: t,
      description: descriptions[i]?.substring(0, 200) ?? '',
      views: viewCounts[i] ?? 0,
    }));

    const systemPrompt = `You are a YouTube analytics expert who identifies patterns in content performance.
Analyze the relationship between titles, descriptions, and view counts.
Identify what works and what doesn't.
Be specific and data-driven in your analysis.`;

    const userPrompt = `Analyze the performance of these videos:

${data.map((d, i) => `${i + 1}. Title: "${d.title}"\n   Views: ${d.views.toLocaleString()}\n   Description: ${d.description}...`).join('\n\n')}

Provide:
1. Average estimated CTR
2. Top 3 performers with analysis of why they worked
3. Specific improvement areas
4. Common patterns in high-performing titles
5. Actionable recommendations for future content

Return as JSON with the analysis.`;

    const response = await client.complete({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    return {
      averageCtr: (parsed.averageCtr as number) ?? 0,
      topPerformers: (parsed.topPerformers as Array<{ title: string; views: number; analysis: string }>) ?? [],
      improvementAreas: (parsed.improvementAreas as string[]) ?? [],
      titlePatterns: (parsed.titlePatterns as string[]) ?? [],
      recommendations: (parsed.recommendations as string[]) ?? [],
    };
  }

  async generateHooks(
    topic: string,
    count: number = 5,
  ): Promise<Array<{ hook: string; style: string; estimatedRetention: number }>> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const response = await client.complete({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a viral content expert who crafts irresistible video hooks. Each hook must grab attention in under 5 seconds.',
        },
        {
          role: 'user',
          content: `Generate ${count} powerful video hooks for a video about: "${topic}"

Each hook should use a different technique (question, bold claim, story, controversy, curiosity gap).
For each, provide the hook text, the technique used, and estimated retention impact (0-100).

Return as JSON with a "hooks" array.`,
        },
      ],
      temperature: 0.9,
      maxTokens: 2048,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as {
      hooks: Array<{ hook: string; style: string; estimatedRetention: number }>;
    };

    return parsed.hooks ?? [];
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function calculateKeywordDensity(text: string, keywords: string[]): Record<string, number> {
  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  const density: Record<string, number> = {};

  for (const keyword of keywords) {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    let count = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const slice = words.slice(i, i + keywordWords.length).join(' ');
      if (slice === keyword.toLowerCase()) count++;
    }
    density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
  }

  return density;
}

function extractTextElements(designSpec: Record<string, unknown>): GeneratedThumbnail['textElements'] {
  const elements = designSpec.textElements as Array<Record<string, unknown>> | undefined;
  if (!elements?.length) return [];

  return elements.map((el) => ({
    text: String(el.text ?? ''),
    x: Number(el.x ?? 0),
    y: Number(el.y ?? 0),
    fontSize: Number(el.fontSize ?? 48),
    color: String(el.color ?? '#FFFFFF'),
    fontWeight: String(el.fontWeight ?? 'bold'),
  }));
}

function extractColorPalette(designSpec: Record<string, unknown>, brandColors?: string[]): string[] {
  const palette = designSpec.colorPalette as string[] | undefined;
  if (brandColors?.length) return brandColors;
  if (palette?.length) return palette;
  return ['#FF0000', '#FFFFFF', '#000000', '#FFD700'];
}

function weeksToWeekLabel(weeks: number): string {
  if (weeks === 1) return '1-week';
  if (weeks === 4) return '4-week';
  return `${weeks}-week`;
}

export const contentGenerator = new ContentGeneratorService();
