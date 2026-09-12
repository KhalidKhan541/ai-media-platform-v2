import { getAIProviderClient, createStructuredPrompt, type AIProvider } from './provider';

export type VideoFormat = 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
export type CaptionStyle = 'default' | 'karaoke' | 'word_highlight' | 'minimal' | 'bold';

export interface VideoInput {
  url: string;
  duration?: number;
  resolution?: { width: number; height: number };
  format?: VideoFormat;
  language?: string;
}

export interface VideoAnalysis {
  id: string;
  videoUrl: string;
  duration: number;
  resolution: { width: number; height: number };
  scenes: VideoScene[];
  objects: DetectedObject[];
  faces: DetectedFace[];
  audioAnalysis: AudioAnalysis;
  sentiment: SentimentTimeline;
  quality: VideoQualityScore;
  metadata: {
    provider: AIProvider;
    analyzedAt: string;
    processingTimeMs: number;
  };
}

export interface VideoScene {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  mood: string;
  dominantColors: string[];
  hasText: boolean;
  hasSpeech: boolean;
  isHighlight: boolean;
  confidenceScore: number;
  tags: string[];
}

export interface DetectedObject {
  label: string;
  confidence: number;
  firstAppearance: number;
  lastAppearance: number;
  framePositions: Array<{ x: number; y: number; width: number; height: number }>;
}

export interface DetectedFace {
  id: string;
  confidence: number;
  firstAppearance: number;
  lastAppearance: number;
  expression: string;
  age?: number;
  gender?: string;
  emotion: string;
}

export interface AudioAnalysis {
  hasSpeech: boolean;
  hasMusic: boolean;
  hasNoise: boolean;
  speechToNoiseRatio: number;
  musicGenre?: string;
  tempo?: number;
  volumeLevel: number;
  silentSegments: Array<{ start: number; end: number }>;
  loudSegments: Array<{ start: number; end: number; peakDb: number }>;
}

export interface SentimentTimeline {
  overall: 'positive' | 'neutral' | 'negative';
  segments: Array<{
    startTime: number;
    endTime: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    text?: string;
  }>;
}

export interface VideoQualityScore {
  overall: number;
  resolution: number;
  lighting: number;
  audio: number;
  stability: number;
  colorGrading: number;
  pacing: number;
  recommendations: string[];
}

export interface HighlightRequest {
  videoUrl: string;
  targetDuration: number;
  style: 'best_moments' | 'trailer' | 'summary' | 'emotional_peak' | 'action_packed';
  minClipDuration?: number;
  maxClipDuration?: number;
  transitionType?: 'cut' | 'dissolve' | 'wipe' | 'zoom' | 'fade';
}

export interface Highlight {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  description: string;
  score: number;
  type: 'emotional' | 'action' | 'dialogue' | 'visual' | 'humor' | 'dramatic';
  transitionIn: string;
  transitionOut: string;
  suggestedMusic?: string;
  onScreenText?: string;
}

export interface HighlightResult {
  id: string;
  highlights: Highlight[];
  totalDuration: number;
  narrativeFlow: string;
  suggestedPacing: Array<{
    section: string;
    speed: 'slow' | 'normal' | 'fast';
    reason: string;
  }>;
  metadata: {
    provider: AIProvider;
    generatedAt: string;
  };
}

export interface CaptionSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  confidence: number;
  words: Array<{
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
}

export interface CaptionRequest {
  videoUrl: string;
  language?: string;
  style: CaptionStyle;
  maxCharsPerLine?: number;
  maxLines?: number;
  includeSpeakerLabels?: boolean;
  includeWordTimestamps?: boolean;
  profanityFilter?: boolean;
  customDictionary?: Record<string, string>;
}

export interface GeneratedCaptions {
  id: string;
  segments: CaptionSegment[];
  totalSegments: number;
  language: string;
  wordCount: number;
  style: CaptionStyle;
  format: 'srt' | 'vtt' | 'ass' | 'json';
  content: string;
  metadata: {
    provider: AIProvider;
    generatedAt: string;
    processingTimeMs: number;
  };
}

export interface TrimRequest {
  videoUrl: string;
  segments: Array<{ start: number; end: number; label?: string }>;
  outputFormat?: VideoFormat;
  outputAspectRatio?: AspectRatio;
  outputResolution?: { width: number; height: number };
}

export interface TrimResult {
  id: string;
  outputUrl: string;
  segments: Array<{ start: number; end: number; outputStart: number; outputEnd: number }>;
  totalDuration: number;
  outputFormat: VideoFormat;
  outputResolution: { width: number; height: number };
}

export interface TransitionRequest {
  segments: Array<{
    videoUrl: string;
    startTime: number;
    endTime: number;
  }>;
  transitionType: 'cut' | 'dissolve' | 'wipe' | 'zoom' | 'fade' | 'glitch' | 'slide';
  transitionDuration?: number;
  outputFormat?: VideoFormat;
}

export interface TransitionResult {
  id: string;
  outputUrl: string;
  segmentCount: number;
  transitionCount: number;
  totalDuration: number;
}

export interface OverlayRequest {
  videoUrl: string;
  overlays: Array<{
    type: 'text' | 'image' | 'logo' | 'lower_third' | 'end_screen' | 'subscribe_button';
    content: string;
    startTime: number;
    endTime: number;
    position: { x: number; y: number };
    style?: Record<string, unknown>;
  }>;
  outputFormat?: VideoFormat;
}

export interface OverlayResult {
  id: string;
  outputUrl: string;
  overlayCount: number;
}

export interface QualityAnalysisRequest {
  videoUrl: string;
  benchmarks?: {
    minResolution?: number;
    minBitrate?: number;
    maxNoiseLevel?: number;
    targetColorTemp?: number;
  };
}

export interface QualityReport {
  id: string;
  overallScore: number;
  scores: {
    resolution: number;
    bitrate: number;
    frameRate: number;
    audioSync: number;
    colorConsistency: number;
    noiseLevel: number;
    sharpness: number;
    exposure: number;
  };
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    startTime?: number;
    endTime?: number;
    description: string;
    recommendation: string;
  }>;
  technicalDetails: {
    codec: string;
    bitrate: number;
    frameRate: number;
    resolution: { width: number; height: number };
    audioCodec: string;
    audioSampleRate: number;
    audioChannels: number;
    colorSpace: string;
    duration: number;
    fileSize: number;
  };
  metadata: {
    provider: AIProvider;
    analyzedAt: string;
  };
}

function generateId(): string {
  return `vid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(',', '.');
}

function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

export class VideoEditorService {
  private getClient() {
    return getAIProviderClient();
  }

  async analyzeVideo(video: VideoInput): Promise<VideoAnalysis> {
    const startTime = Date.now();
    const client = this.getClient();
    const model = client.getRecommendedModel('video_analysis');

    const systemPrompt = `You are an expert video analyst AI.
Analyze the provided video and extract detailed information about scenes, objects, faces, audio, and sentiment.
Provide comprehensive, timestamp-accurate analysis.
Rate the video quality across multiple dimensions.`;

    const userPrompt = `Analyze this video: ${video.url}
${video.duration ? `Duration: ${video.duration}s` : ''}
${video.resolution ? `Resolution: ${video.resolution.width}x${video.resolution.height}` : ''}
${video.language ? `Primary language: ${video.language}` : ''}

Provide detailed analysis including:
1. Scene detection with timestamps, descriptions, and mood
2. Object detection with confidence scores
3. Face detection with expressions and emotions
4. Audio analysis (speech, music, noise)
5. Sentiment timeline
6. Quality scoring across multiple dimensions
7. Specific improvement recommendations

Return as JSON matching the analysis schema.`;

    const messages = createStructuredPrompt(
      z.object({
        scenes: z.array(z.any()),
        objects: z.array(z.any()),
        faces: z.array(z.any()),
        audioAnalysis: z.any(),
        sentiment: z.any(),
        quality: z.any(),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.4,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;

    return {
      id: generateId(),
      videoUrl: video.url,
      duration: video.duration ?? 0,
      resolution: video.resolution ?? { width: 1920, height: 1080 },
      scenes: normalizeScenes(parsed.scenes),
      objects: normalizeObjects(parsed.objects),
      faces: normalizeFaces(parsed.faces),
      audioAnalysis: normalizeAudio(parsed.audioAnalysis),
      sentiment: normalizeSentiment(parsed.sentiment),
      quality: normalizeQuality(parsed.quality),
      metadata: {
        provider: response.provider,
        analyzedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  async generateHighlights(request: HighlightRequest): Promise<HighlightResult> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const systemPrompt = `You are an expert video editor who identifies the most compelling moments in footage.
Select highlights that maximize viewer engagement and match the requested style.
Provide precise timestamps, transition suggestions, and narrative flow.`;

    const userPrompt = `Identify highlights from this video: ${request.videoUrl}
Target duration: ${request.targetDuration}s
Style: ${request.style}
${request.minClipDuration ? `Min clip: ${request.minClipDuration}s` : ''}
${request.maxClipDuration ? `Max clip: ${request.maxClipDuration}s` : ''}
Transition preference: ${request.transitionType ?? 'varied'}

Select the best moments that create a compelling ${request.style.replace('_', ' ')} video.
For each highlight, provide:
- Precise start/end timestamps
- Description of the moment
- Engagement score (0-100)
- Highlight type (emotional, action, dialogue, visual, humor, dramatic)
- Transition suggestions
- Optional music or text overlay recommendations

Return as JSON matching the schema.`;

    const messages = createStructuredPrompt(
      z.object({
        highlights: z.array(z.any()),
        totalDuration: z.number(),
        narrativeFlow: z.string(),
        suggestedPacing: z.array(z.any()),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.6,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;

    return {
      id: generateId(),
      highlights: normalizeHighlights(parsed.highlights),
      totalDuration: (parsed.totalDuration as number) ?? request.targetDuration,
      narrativeFlow: (parsed.narrativeFlow as string) ?? '',
      suggestedPacing: (parsed.suggestedPacing as HighlightResult['suggestedPacing']) ?? [],
      metadata: {
        provider: response.provider,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async generateCaptions(request: CaptionRequest): Promise<GeneratedCaptions> {
    const startTime = Date.now();
    const client = this.getClient();
    const model = client.getRecommendedModel('transcription');

    const systemPrompt = `You are a professional caption transcriber.
Generate accurate, well-timed captions for video content.
Use proper punctuation, capitalization, and line breaks for readability.
${request.includeSpeakerLabels ? 'Identify and label different speakers.' : ''}
${request.profanityFilter ? 'Censor profanity with asterisks.' : ''}`;

    const maxChars = request.maxCharsPerLine ?? 42;
    const maxLines = request.maxLines ?? 2;

    const userPrompt = `Generate captions for: ${request.videoUrl}
Language: ${request.language ?? 'English'}
Style: ${request.style}
Max characters per line: ${maxChars}
Max lines: ${maxLines}
${request.includeWordTimestamps ? 'Include word-level timestamps.' : ''}
${request.customDictionary ? `Custom dictionary for names/terms: ${JSON.stringify(request.customDictionary)}` : ''}

Generate captions with precise timing.
Each caption segment should:
- Be readable at normal speed
- Not break mid-word or mid-sentence
- Match speech rhythm and natural pauses
- Include speaker labels if multiple speakers detected

Return as JSON with segments array containing start, end, text, speaker, and words array.`;

    const messages = createStructuredPrompt(
      z.object({
        segments: z.array(z.any()),
        language: z.string(),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.2,
      maxTokens: 16384,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    const segments = normalizeCaptionSegments(parsed.segments);
    const format = 'json';

    let content = '';
    switch (format) {
      case 'srt':
        content = generateSrt(segments);
        break;
      case 'vtt':
        content = generateVtt(segments);
        break;
      case 'ass':
        content = generateAss(segments, request.style);
        break;
      default:
        content = JSON.stringify(segments, null, 2);
    }

    return {
      id: generateId(),
      segments,
      totalSegments: segments.length,
      language: (parsed.language as string) ?? request.language ?? 'en',
      wordCount: segments.reduce((acc, s) => acc + s.text.split(/\s+/).length, 0),
      style: request.style,
      format,
      content,
      metadata: {
        provider: response.provider,
        generatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  async trimVideo(request: TrimRequest): Promise<TrimResult> {
    const totalDuration = request.segments.reduce((acc, s) => acc + (s.end - s.start), 0);

    return {
      id: generateId(),
      outputUrl: `/api/video/trimmed/${generateId()}.${request.outputFormat ?? 'mp4'}`,
      segments: request.segments.map((s, i) => {
        let outputStart = 0;
        for (let j = 0; j < i; j++) {
          outputStart += request.segments[j].end - request.segments[j].start;
        }
        return {
          start: s.start,
          end: s.end,
          outputStart,
          outputEnd: outputStart + (s.end - s.start),
        };
      }),
      totalDuration,
      outputFormat: request.outputFormat ?? 'mp4',
      outputResolution: request.outputResolution ?? { width: 1920, height: 1080 },
    };
  }

  async addTransitions(request: TransitionRequest): Promise<TransitionResult> {
    const transitionDuration = request.transitionDuration ?? 0.5;
    let totalDuration = 0;

    for (let i = 0; i < request.segments.length; i++) {
      const seg = request.segments[i];
      const segDuration = seg.endTime - seg.startTime;
      totalDuration += segDuration;
      if (i > 0) {
        totalDuration -= transitionDuration;
      }
    }

    return {
      id: generateId(),
      outputUrl: `/api/video/transitions/${generateId()}.${request.outputFormat ?? 'mp4'}`,
      segmentCount: request.segments.length,
      transitionCount: Math.max(0, request.segments.length - 1),
      totalDuration: Math.max(0, totalDuration),
    };
  }

  async addOverlays(request: OverlayRequest): Promise<OverlayResult> {
    return {
      id: generateId(),
      outputUrl: `/api/video/overlays/${generateId()}.${request.outputFormat ?? 'mp4'}`,
      overlayCount: request.overlays.length,
    };
  }

  async analyzeQuality(request: QualityAnalysisRequest): Promise<QualityReport> {
    const client = this.getClient();
    const model = client.getRecommendedModel('video_analysis');

    const systemPrompt = `You are a video quality analyst.
Provide detailed technical analysis of video quality metrics.
Identify specific issues with precise timestamps and actionable recommendations.`;

    const userPrompt = `Analyze the technical quality of: ${request.videoUrl}
${request.benchmarks ? `Quality benchmarks: ${JSON.stringify(request.benchmarks)}` : ''}

Provide:
1. Detailed quality scores (resolution, bitrate, frame rate, audio sync, color, noise, sharpness, exposure)
2. Identify specific quality issues with timestamps
3. Technical details (codec, bitrate, frame rate, resolution, audio specs, color space, file size)
4. Actionable improvement recommendations for each issue

Return as JSON matching the quality report schema.`;

    const messages = createStructuredPrompt(
      z.object({
        scores: z.any(),
        issues: z.array(z.any()),
        technicalDetails: z.any(),
      }),
      systemPrompt,
      userPrompt,
    );

    const response = await client.complete({
      model,
      messages,
      temperature: 0.3,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    const scores = (parsed.scores as Record<string, number>) ?? {};
    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.keys(scores).length, 1);

    return {
      id: generateId(),
      overallScore: Math.round(overallScore * 10) / 10,
      scores: {
        resolution: scores.resolution ?? 0,
        bitrate: scores.bitrate ?? 0,
        frameRate: scores.frameRate ?? 0,
        audioSync: scores.audioSync ?? 0,
        colorConsistency: scores.colorConsistency ?? 0,
        noiseLevel: scores.noiseLevel ?? 0,
        sharpness: scores.sharpness ?? 0,
        exposure: scores.exposure ?? 0,
      },
      issues: normalizeIssues(parsed.issues),
      technicalDetails: normalizeTechnicalDetails(parsed.technicalDetails),
      metadata: {
        provider: response.provider,
        analyzedAt: new Date().toISOString(),
      },
    };
  }

  async autoEdit(
    videoUrl: string,
    preferences: {
      style: 'cinematic' | 'fast_paced' | 'relaxed' | 'dramatic';
      targetDuration: number;
      musicGenre?: string;
      addCaptions?: boolean;
      captionStyle?: CaptionStyle;
      colorGrade?: string;
      removeSilences?: boolean;
    },
  ): Promise<{
    editPlan: {
      segments: Array<{ start: number; end: number; speed: number; effects: string[] }>;
      transitions: Array<{ type: string; duration: number; position: number }>;
      overlays: Array<{ type: string; content: string; time: number; duration: number }>;
      audioAdjustments: Array<{ type: string; time: number; value: number }>;
    };
    estimatedDuration: number;
    appliedEffects: string[];
  }> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const response = await client.complete({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert video editor AI. Create an automatic edit plan for the given video.
Style: ${preferences.style}
Target duration: ${preferences.targetDuration}s
${preferences.musicGenre ? `Music: ${preferences.musicGenre}` : ''}
${preferences.addCaptions ? `Captions: ${preferences.captionStyle ?? 'default'}` : ''}
${preferences.colorGrade ? `Color grade: ${preferences.colorGrade}` : ''}
${preferences.removeSilences ? 'Remove silent segments.' : ''}

Return JSON with editPlan, estimatedDuration, and appliedEffects.`,
        },
        {
          role: 'user',
          content: `Create an auto-edit plan for: ${videoUrl}`,
        },
      ],
      temperature: 0.6,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    return {
      editPlan: {
        segments: (parsed.editPlan as Record<string, unknown>)?.segments as Array<{ start: number; end: number; speed: number; effects: string[] }> ?? [],
        transitions: (parsed.editPlan as Record<string, unknown>)?.transitions as Array<{ type: string; duration: number; position: number }> ?? [],
        overlays: (parsed.editPlan as Record<string, unknown>)?.overlays as Array<{ type: string; content: string; time: number; duration: number }> ?? [],
        audioAdjustments: (parsed.editPlan as Record<string, unknown>)?.audioAdjustments as Array<{ type: string; time: number; value: number }> ?? [],
      },
      estimatedDuration: (parsed.estimatedDuration as number) ?? preferences.targetDuration,
      appliedEffects: (parsed.appliedEffects as string[]) ?? [],
    };
  }

  async generateThumbnailFromVideo(
    videoUrl: string,
    timestamps: number[],
    style: 'best_frame' | 'composite' | 'ai_generated',
  ): Promise<Array<{
    timestamp: number;
    imageUrl: string;
    score: number;
    description: string;
  }>> {
    const client = this.getClient();
    const model = client.getRecommendedModel('text_generation');

    const response = await client.complete({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a thumbnail creation expert. Analyze video frames at given timestamps and recommend the best thumbnail approach.',
        },
        {
          role: 'user',
          content: `Video: ${videoUrl}
Timestamps to analyze: ${timestamps.join(', ')}
Style: ${style}

For each timestamp, provide:
- Frame description
- Thumbnail quality score (0-100)
- Visual appeal assessment
- Recommended thumbnail approach

Return JSON with array of thumbnail options.`,
        },
      ],
      temperature: 0.6,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.content) as Record<string, unknown>;
    const options = (parsed.thumbnails ?? parsed.options ?? []) as Array<Record<string, unknown>>;

    return options.map((opt) => ({
      timestamp: (opt.timestamp as number) ?? 0,
      imageUrl: (opt.imageUrl as string) ?? `/api/video/thumbnail/${generateId()}`,
      score: (opt.score as number) ?? 0,
      description: (opt.description as string) ?? '',
    }));
  }
}

function normalizeScenes(data: unknown): VideoScene[] {
  if (!Array.isArray(data)) return [];
  return data.map((s: Record<string, unknown>) => ({
    id: String(s.id ?? generateId()),
    startTime: Number(s.startTime ?? s.start ?? 0),
    endTime: Number(s.endTime ?? s.end ?? 0),
    description: String(s.description ?? ''),
    mood: String(s.mood ?? 'neutral'),
    dominantColors: Array.isArray(s.dominantColors) ? s.dominantColors as string[] : [],
    hasText: Boolean(s.hasText),
    hasSpeech: Boolean(s.hasSpeech),
    isHighlight: Boolean(s.isHighlight),
    confidenceScore: Number(s.confidenceScore ?? s.confidence ?? 0.5),
    tags: Array.isArray(s.tags) ? s.tags as string[] : [],
  }));
}

function normalizeObjects(data: unknown): DetectedObject[] {
  if (!Array.isArray(data)) return [];
  return data.map((o: Record<string, unknown>) => ({
    label: String(o.label ?? o.name ?? ''),
    confidence: Number(o.confidence ?? 0.5),
    firstAppearance: Number(o.firstAppearance ?? o.start ?? 0),
    lastAppearance: Number(o.lastAppearance ?? o.end ?? 0),
    framePositions: Array.isArray(o.framePositions) ? o.framePositions as DetectedObject['framePositions'] : [],
  }));
}

function normalizeFaces(data: unknown): DetectedFace[] {
  if (!Array.isArray(data)) return [];
  return data.map((f: Record<string, unknown>) => ({
    id: String(f.id ?? generateId()),
    confidence: Number(f.confidence ?? 0.5),
    firstAppearance: Number(f.firstAppearance ?? f.start ?? 0),
    lastAppearance: Number(f.lastAppearance ?? f.end ?? 0),
    expression: String(f.expression ?? 'neutral'),
    age: f.age ? Number(f.age) : undefined,
    gender: f.gender ? String(f.gender) : undefined,
    emotion: String(f.emotion ?? f.expression ?? 'neutral'),
  }));
}

function normalizeAudio(data: unknown): AudioAnalysis {
  if (!data || typeof data !== 'object') {
    return {
      hasSpeech: false, hasMusic: false, hasNoise: false,
      speechToNoiseRatio: 0, volumeLevel: 0,
      silentSegments: [], loudSegments: [],
    };
  }
  const a = data as Record<string, unknown>;
  return {
    hasSpeech: Boolean(a.hasSpeech),
    hasMusic: Boolean(a.hasMusic),
    hasNoise: Boolean(a.hasNoise),
    speechToNoiseRatio: Number(a.speechToNoiseRatio ?? 0),
    musicGenre: a.musicGenre ? String(a.musicGenre) : undefined,
    tempo: a.tempo ? Number(a.tempo) : undefined,
    volumeLevel: Number(a.volumeLevel ?? 0),
    silentSegments: Array.isArray(a.silentSegments) ? a.silentSegments as AudioAnalysis['silentSegments'] : [],
    loudSegments: Array.isArray(a.loudSegments) ? a.loudSegments as AudioAnalysis['loudSegments'] : [],
  };
}

function normalizeSentiment(data: unknown): SentimentTimeline {
  if (!data || typeof data !== 'object') {
    return { overall: 'neutral', segments: [] };
  }
  const s = data as Record<string, unknown>;
  return {
    overall: (s.overall as SentimentTimeline['overall']) ?? 'neutral',
    segments: Array.isArray(s.segments) ? s.segments.map((seg: Record<string, unknown>) => ({
      startTime: Number(seg.startTime ?? seg.start ?? 0),
      endTime: Number(seg.endTime ?? seg.end ?? 0),
      sentiment: (seg.sentiment as 'positive' | 'neutral' | 'negative') ?? 'neutral',
      confidence: Number(seg.confidence ?? 0.5),
      text: seg.text ? String(seg.text) : undefined,
    })) : [],
  };
}

function normalizeQuality(data: unknown): VideoQualityScore {
  if (!data || typeof data !== 'object') {
    return {
      overall: 0, resolution: 0, lighting: 0, audio: 0,
      stability: 0, colorGrading: 0, pacing: 0, recommendations: [],
    };
  }
  const q = data as Record<string, unknown>;
  return {
    overall: Number(q.overall ?? 0),
    resolution: Number(q.resolution ?? 0),
    lighting: Number(q.lighting ?? 0),
    audio: Number(q.audio ?? 0),
    stability: Number(q.stability ?? 0),
    colorGrading: Number(q.colorGrading ?? 0),
    pacing: Number(q.pacing ?? 0),
    recommendations: Array.isArray(q.recommendations) ? q.recommendations as string[] : [],
  };
}

function normalizeHighlights(data: unknown): Highlight[] {
  if (!Array.isArray(data)) return [];
  return data.map((h: Record<string, unknown>) => ({
    id: String(h.id ?? generateId()),
    startTime: Number(h.startTime ?? h.start ?? 0),
    endTime: Number(h.endTime ?? h.end ?? 0),
    duration: Number(h.duration ?? (Number(h.endTime ?? h.end ?? 0) - Number(h.startTime ?? h.start ?? 0))),
    description: String(h.description ?? ''),
    score: Number(h.score ?? 0),
    type: (h.type as Highlight['type']) ?? 'emotional',
    transitionIn: String(h.transitionIn ?? 'cut'),
    transitionOut: String(h.transitionOut ?? 'cut'),
    suggestedMusic: h.suggestedMusic ? String(h.suggestedMusic) : undefined,
    onScreenText: h.onScreenText ? String(h.onScreenText) : undefined,
  }));
}

function normalizeCaptionSegments(data: unknown): CaptionSegment[] {
  if (!Array.isArray(data)) return [];
  return data.map((s: Record<string, unknown>) => ({
    id: String(s.id ?? generateId()),
    startTime: Number(s.startTime ?? s.start ?? 0),
    endTime: Number(s.endTime ?? s.end ?? 0),
    text: String(s.text ?? ''),
    speaker: s.speaker ? String(s.speaker) : undefined,
    confidence: Number(s.confidence ?? 0.9),
    words: Array.isArray(s.words) ? s.words.map((w: Record<string, unknown>) => ({
      text: String(w.text ?? ''),
      startTime: Number(w.startTime ?? w.start ?? 0),
      endTime: Number(w.endTime ?? w.end ?? 0),
      confidence: Number(w.confidence ?? 0.9),
    })) : [],
  }));
}

function normalizeIssues(data: unknown): QualityReport['issues'] {
  if (!Array.isArray(data)) return [];
  return data.map((i: Record<string, unknown>) => ({
    type: String(i.type ?? ''),
    severity: (i.severity as 'low' | 'medium' | 'high' | 'critical') ?? 'low',
    startTime: i.startTime ? Number(i.startTime) : undefined,
    endTime: i.endTime ? Number(i.endTime) : undefined,
    description: String(i.description ?? ''),
    recommendation: String(i.recommendation ?? ''),
  }));
}

function normalizeTechnicalDetails(data: unknown): QualityReport['technicalDetails'] {
  if (!data || typeof data !== 'object') {
    return {
      codec: '', bitrate: 0, frameRate: 0,
      resolution: { width: 0, height: 0 },
      audioCodec: '', audioSampleRate: 0, audioChannels: 0,
      colorSpace: '', duration: 0, fileSize: 0,
    };
  }
  const t = data as Record<string, unknown>;
  return {
    codec: String(t.codec ?? ''),
    bitrate: Number(t.bitrate ?? 0),
    frameRate: Number(t.frameRate ?? 0),
    resolution: {
      width: Number((t.resolution as Record<string, unknown>)?.width ?? 0),
      height: Number((t.resolution as Record<string, unknown>)?.height ?? 0),
    },
    audioCodec: String(t.audioCodec ?? ''),
    audioSampleRate: Number(t.audioSampleRate ?? 0),
    audioChannels: Number(t.audioChannels ?? 0),
    colorSpace: String(t.colorSpace ?? ''),
    duration: Number(t.duration ?? 0),
    fileSize: Number(t.fileSize ?? 0),
  };
}

function generateSrt(segments: CaptionSegment[]): string {
  return segments
    .map((s, i) => {
      const speakerPrefix = s.speaker ? `[${s.speaker}] ` : '';
      return `${i + 1}\n${formatSrtTime(s.startTime)} --> ${formatSrtTime(s.endTime)}\n${speakerPrefix}${s.text}`;
    })
    .join('\n\n');
}

function generateVtt(segments: CaptionSegment[]): string {
  const lines = ['WEBVTT', ''];
  for (const s of segments) {
    const speakerPrefix = s.speaker ? `[${s.speaker}] ` : '';
    lines.push(`${formatVttTime(s.startTime)} --> ${formatVttTime(s.endTime)}`);
    lines.push(`${speakerPrefix}${s.text}`);
    lines.push('');
  }
  return lines.join('\n');
}

function generateAss(segments: CaptionSegment[], style: CaptionStyle): string {
  const header = `[Script Info]
Title: Generated Captions
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1
Style: Highlight,Arial,52,&H0000FFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events = segments.map((s) => {
    const styleName = style === 'word_highlight' ? 'Highlight' : 'Default';
    const text = s.text.replace(/\n/g, '\\N');
    return `Dialogue: 0,${formatAssTime(s.startTime)},${formatAssTime(s.endTime)},${styleName},,0,0,0,,${text}`;
  });

  return header + '\n' + events.join('\n');
}

export const videoEditor = new VideoEditorService();
