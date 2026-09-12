import { z } from 'zod';

export const AIProviderSchema = z.enum(['openai', 'anthropic', 'gemini', 'replicate', 'stability']);
export type AIProvider = z.infer<typeof AIProviderSchema>;

export const AIModelSchema = z.enum([
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'claude-3-5-sonnet',
  'claude-3-haiku',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'stable-diffusion-xl',
  'stable-video-diffusion',
]);
export type AIModel = z.infer<typeof AIModelSchema>;

export type MediaTaskType =
  | 'text_generation'
  | 'image_generation'
  | 'video_analysis'
  | 'transcription'
  | 'summarization'
  | 'translation'
  | 'content_moderation';

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  model: AIModel;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  responseFormat?: { type: 'text' | 'json_object' };
}

export interface AICompletionResponse {
  id: string;
  content: string;
  model: AIModel;
  provider: AIProvider;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_call';
  latencyMs: number;
}

export interface AIStreamChunk {
  id: string;
  delta: string;
  finishReason: AICompletionResponse['finishReason'] | null;
  usage?: AICompletionResponse['usage'];
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  stylePreset?: string;
}

export interface ImageGenerationResponse {
  id: string;
  imageUrl: string;
  base64?: string;
  width: number;
  height: number;
  seed: number;
  model: string;
  provider: AIProvider;
  latencyMs: number;
}

export interface VideoAnalysisRequest {
  videoUrl: string;
  analysisType: 'transcription' | 'highlights' | 'sentiment' | 'objects' | 'scenes';
  language?: string;
}

export interface VideoAnalysisResult {
  id: string;
  analysisType: VideoAnalysisRequest['analysisType'];
  data: Record<string, unknown>;
  confidence: number;
  provider: AIProvider;
  latencyMs: number;
}

export type AIStreamCallback = (chunk: AIStreamChunk) => void;

export class AIError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code: AIErrorCode,
    public statusCode?: number,
    public retryable: boolean = false,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export type AIErrorCode =
  | 'AUTH_ERROR'
  | 'RATE_LIMITED'
  | 'MODEL_NOT_FOUND'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'CONTENT_FILTER'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN_ERROR';

interface RateLimitState {
  requests: number;
  tokens: number;
  resetAt: number;
}

interface ProviderHealth {
  lastSuccess: number;
  lastFailure: number;
  consecutiveFailures: number;
  avgLatencyMs: number;
  latencySamples: number[];
  totalRequests: number;
  totalTokens: number;
  errorRate: number;
}

const DEFAULT_RATE_LIMITS: Record<AIProvider, { requestsPerMinute: number; tokensPerMinute: number }> = {
  openai: { requestsPerMinute: 500, tokensPerMinute: 150_000 },
  anthropic: { requestsPerMinute: 400, tokensPerMinute: 100_000 },
  gemini: { requestsPerMinute: 600, tokensPerMinute: 120_000 },
  replicate: { requestsPerMinute: 200, tokensPerMinute: 60_000 },
  stability: { requestsPerMinute: 150, tokensPerMinute: 50_000 },
};

const MODEL_TO_PROVIDER: Record<AIModel, AIProvider> = {
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4-turbo': 'openai',
  'claude-3-5-sonnet': 'anthropic',
  'claude-3-haiku': 'anthropic',
  'gemini-1.5-pro': 'gemini',
  'gemini-1.5-flash': 'gemini',
  'stable-diffusion-xl': 'stability',
  'stable-video-diffusion': 'replicate',
};

const MODEL_FALLBACKS: Record<AIModel, AIModel[]> = {
  'gpt-4o': ['claude-3-5-sonnet', 'gemini-1.5-pro'],
  'gpt-4o-mini': ['claude-3-haiku', 'gemini-1.5-flash'],
  'gpt-4-turbo': ['claude-3-5-sonnet', 'gemini-1.5-pro'],
  'claude-3-5-sonnet': ['gpt-4o', 'gemini-1.5-pro'],
  'claude-3-haiku': ['gpt-4o-mini', 'gemini-1.5-flash'],
  'gemini-1.5-pro': ['gpt-4o', 'claude-3-5-sonnet'],
  'gemini-1.5-flash': ['gpt-4o-mini', 'claude-3-haiku'],
  'stable-diffusion-xl': [],
  'stable-video-diffusion': [],
};

const TASK_MODEL_MAP: Record<MediaTaskType, AIModel> = {
  text_generation: 'gpt-4o',
  image_generation: 'stable-diffusion-xl',
  video_analysis: 'gemini-1.5-pro',
  transcription: 'gpt-4o-mini',
  summarization: 'claude-3-5-sonnet',
  translation: 'gpt-4o',
  content_moderation: 'gpt-4o-mini',
};

export class AIProviderClient {
  private configs: Map<AIProvider, AIProviderConfig> = new Map();
  private rateLimits: Map<AIProvider, RateLimitState> = new Map();
  private health: Map<AIProvider, ProviderHealth> = new Map();
  private maxRetries: number;
  private defaultTimeout: number;
  private fallbackEnabled: boolean;
  private requestLog: Array<{ timestamp: number; provider: AIProvider; latencyMs: number; success: boolean }> = [];

  constructor(options?: { maxRetries?: number; timeout?: number; fallbackEnabled?: boolean }) {
    this.maxRetries = options?.maxRetries ?? 3;
    this.defaultTimeout = options?.timeout ?? 60_000;
    this.fallbackEnabled = options?.fallbackEnabled ?? true;

    for (const provider of AIProviderSchema.enum) {
      this.health.set(provider, {
        lastSuccess: 0,
        lastFailure: 0,
        consecutiveFailures: 0,
        avgLatencyMs: 0,
        latencySamples: [],
        totalRequests: 0,
        totalTokens: 0,
        errorRate: 0,
      });
    }
  }

  configureProvider(provider: AIProvider, config: AIProviderConfig): void {
    this.configs.set(provider, config);
    this.rateLimits.set(provider, {
      requests: 0,
      tokens: 0,
      resetAt: Date.now() + 60_000,
    });
  }

  configureAll(configs: Partial<Record<AIProvider, AIProviderConfig>>): void {
    for (const [provider, config] of Object.entries(configs)) {
      if (config) {
        this.configureProvider(provider as AIProvider, config);
      }
    }
  }

  private getProviderForModel(model: AIModel): AIProvider {
    return MODEL_TO_PROVIDER[model];
  }

  private getConfig(provider: AIProvider): AIProviderConfig {
    const config = this.configs.get(provider);
    if (!config) {
      throw new AIError(
        `Provider "${provider}" not configured`,
        provider,
        'PROVIDER_UNAVAILABLE',
      );
    }
    return config;
  }

  getRecommendedModel(task: MediaTaskType): AIModel {
    return TASK_MODEL_MAP[task];
  }

  private async checkRateLimit(provider: AIProvider): Promise<void> {
    const state = this.rateLimits.get(provider);
    if (!state) return;

    if (Date.now() > state.resetAt) {
      this.rateLimits.set(provider, { requests: 0, tokens: 0, resetAt: Date.now() + 60_000 });
      return;
    }

    const limits = DEFAULT_RATE_LIMITS[provider];
    if (state.requests >= limits.requestsPerMinute) {
      const waitMs = state.resetAt - Date.now();
      if (waitMs > 5000) {
        throw new AIError(
          `Rate limit exceeded for ${provider}. Retry after ${Math.ceil(waitMs / 1000)}s`,
          provider,
          'RATE_LIMITED',
          429,
          true,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      this.rateLimits.set(provider, { requests: 0, tokens: 0, resetAt: Date.now() + 60_000 });
    }
  }

  private recordUsage(provider: AIProvider, tokens: number): void {
    const state = this.rateLimits.get(provider);
    if (state) {
      state.requests += 1;
      state.tokens += tokens;
    }
    const h = this.health.get(provider);
    if (h) {
      h.totalTokens += tokens;
    }
  }

  private recordLatency(provider: AIProvider, latencyMs: number): void {
    const h = this.health.get(provider);
    if (!h) return;
    h.latencySamples.push(latencyMs);
    if (h.latencySamples.length > 100) {
      h.latencySamples = h.latencySamples.slice(-100);
    }
    h.avgLatencyMs = h.latencySamples.reduce((a, b) => a + b, 0) / h.latencySamples.length;
  }

  private recordSuccess(provider: AIProvider, latencyMs: number): void {
    const h = this.health.get(provider);
    if (h) {
      h.lastSuccess = Date.now();
      h.consecutiveFailures = 0;
      h.totalRequests += 1;
    }
    this.recordLatency(provider, latencyMs);
    this.requestLog.push({ timestamp: Date.now(), provider, latencyMs, success: true });
    if (this.requestLog.length > 500) {
      this.requestLog = this.requestLog.slice(-500);
    }
  }

  private recordFailure(provider: AIProvider): void {
    const h = this.health.get(provider);
    if (h) {
      h.lastFailure = Date.now();
      h.consecutiveFailures += 1;
      h.totalRequests += 1;
      const totalReqs = h.totalRequests;
      const failRate = h.consecutiveFailures / Math.max(totalReqs, 1);
      h.errorRate = failRate;
    }
    this.requestLog.push({ timestamp: Date.now(), provider, latencyMs: 0, success: false });
    if (this.requestLog.length > 500) {
      this.requestLog = this.requestLog.slice(-500);
    }
  }

  isHealthy(provider: AIProvider): boolean {
    const h = this.health.get(provider);
    if (!h) return false;
    if (h.consecutiveFailures >= 5) return false;
    if (h.lastFailure > h.lastSuccess && Date.now() - h.lastFailure < 60_000) return false;
    return true;
  }

  getHealthReport(): Record<AIProvider, ProviderHealth & { healthy: boolean }> {
    const report = {} as Record<AIProvider, ProviderHealth & { healthy: boolean }>;
    for (const [provider, h] of this.health) {
      report[provider] = { ...h, healthy: this.isHealthy(provider as AIProvider) };
    }
    return report;
  }

  getRequestLog(): Array<{ timestamp: number; provider: AIProvider; latencyMs: number; success: boolean }> {
    return [...this.requestLog];
  }

  getCostEstimate(provider: AIProvider, promptTokens: number, completionTokens: number): number {
    const rates: Record<AIProvider, { input: number; output: number }> = {
      openai: { input: 0.005, output: 0.015 },
      anthropic: { input: 0.003, output: 0.015 },
      gemini: { input: 0.00125, output: 0.005 },
      replicate: { input: 0.002, output: 0.002 },
      stability: { input: 0.004, output: 0.004 },
    };
    const rate = rates[provider];
    return (promptTokens * rate.input + completionTokens * rate.output) / 1000;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const primaryProvider = this.getProviderForModel(request.model);
    const modelsToTry = this.fallbackEnabled
      ? [request.model, ...MODEL_FALLBACKS[request.model]]
      : [request.model];

    let lastError: AIError | null = null;

    for (const model of modelsToTry) {
      const provider = this.getProviderForModel(model);
      try {
        return await this.completeWithRetry({ ...request, model }, provider);
      } catch (error) {
        lastError = error instanceof AIError ? error : new AIError(
          String(error),
          provider,
          'UNKNOWN_ERROR',
          undefined,
          false,
          error instanceof Error ? error : undefined,
        );
        if (!this.fallbackEnabled || !lastError.retryable) {
          throw lastError;
        }
      }
    }

    throw lastError ?? new AIError(
      'All providers failed',
      primaryProvider,
      'PROVIDER_UNAVAILABLE',
    );
  }

  private async completeWithRetry(
    request: AICompletionRequest,
    provider: AIProvider,
  ): Promise<AICompletionResponse> {
    let lastError: AIError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.executeRequest(request, provider);
      } catch (error) {
        lastError = error instanceof AIError ? error : new AIError(
          String(error),
          provider,
          'UNKNOWN_ERROR',
          undefined,
          false,
          error instanceof Error ? error : undefined,
        );

        this.recordFailure(provider);

        if (!lastError.retryable || attempt === this.maxRetries) {
          throw lastError;
        }

        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30_000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    throw lastError ?? new AIError('Max retries exceeded', provider, 'UNKNOWN_ERROR');
  }

  private async executeRequest(
    request: AICompletionRequest,
    provider: AIProvider,
  ): Promise<AICompletionResponse> {
    await this.checkRateLimit(provider);
    const config = this.getConfig(provider);
    const startTime = Date.now();

    try {
      const response = await this.callProviderAPI(provider, config, request);
      const latencyMs = Date.now() - startTime;

      this.recordSuccess(provider, latencyMs);
      this.recordUsage(provider, response.usage.totalTokens);

      return { ...response, provider, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.recordFailure(provider);
      this.recordLatency(provider, latencyMs);

      if (error instanceof AIError) throw error;

      const err = error as { status?: number; message?: string; code?: string };
      const statusCode = err.status ?? 500;

      if (statusCode === 429) {
        throw new AIError(`Rate limited by ${provider}`, provider, 'RATE_LIMITED', 429, true);
      }
      if (statusCode === 401 || statusCode === 403) {
        throw new AIError(`Authentication failed for ${provider}`, provider, 'AUTH_ERROR', statusCode, false);
      }
      if (statusCode === 404) {
        throw new AIError(`Model not found: ${request.model}`, provider, 'MODEL_NOT_FOUND', 404, false);
      }
      if (statusCode === 413 || err.message?.includes('context_length')) {
        throw new AIError('Context length exceeded', provider, 'CONTEXT_LENGTH_EXCEEDED', 413, false);
      }

      throw new AIError(
        err.message ?? 'Unknown provider error',
        provider,
        'UNKNOWN_ERROR',
        statusCode,
        statusCode >= 500,
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async callProviderAPI(
    provider: AIProvider,
    config: AIProviderConfig,
    request: AICompletionRequest,
  ): Promise<AICompletionResponse> {
    const timeout = this.defaultTimeout;

    switch (provider) {
      case 'openai':
        return this.callOpenAI(config, request, timeout);
      case 'anthropic':
        return this.callAnthropic(config, request, timeout);
      case 'gemini':
        return this.callGemini(config, request, timeout);
      default:
        throw new AIError(`Unsupported provider: ${provider}`, provider, 'PROVIDER_UNAVAILABLE');
    }
  }

  private async callOpenAI(
    config: AIProviderConfig,
    request: AICompletionRequest,
    timeout: number,
  ): Promise<AICompletionResponse> {
    const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
          ...(config.organization ? { 'OpenAI-Organization': config.organization } : {}),
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4096,
          top_p: request.topP,
          frequency_penalty: request.frequencyPenalty,
          presence_penalty: request.presencePenalty,
          stop: request.stop,
          response_format: request.responseFormat,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw Object.assign(new Error(body), { status: response.status });
      }

      const data = await response.json() as {
        id: string;
        choices: Array<{ message: { role: string; content: string }; finish_reason: string }>;
        model: string;
        usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };

      return {
        id: data.id,
        content: data.choices[0]?.message?.content ?? '',
        model: request.model,
        provider: 'openai',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        finishReason: this.mapFinishReason(data.choices[0]?.finish_reason ?? 'stop'),
        latencyMs: 0,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private async callAnthropic(
    config: AIProviderConfig,
    request: AICompletionRequest,
    timeout: number,
  ): Promise<AICompletionResponse> {
    const baseUrl = config.baseUrl ?? 'https://api.anthropic.com/v1';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const systemMessage = request.messages.find((m) => m.role === 'system');
    const nonSystemMessages = request.messages.filter((m) => m.role !== 'system');

    try {
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens ?? 4096,
          system: systemMessage?.content,
          messages: nonSystemMessages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          temperature: request.temperature ?? 0.7,
          top_p: request.topP,
          stop_sequences: request.stop,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw Object.assign(new Error(body), { status: response.status });
      }

      const data = await response.json() as {
        id: string;
        content: Array<{ type: string; text: string }>;
        model: string;
        stop_reason: string;
        usage: { input_tokens: number; output_tokens: number };
      };

      return {
        id: data.id,
        content: data.content.map((c) => c.text).join(''),
        model: request.model,
        provider: 'anthropic',
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        finishReason: this.mapFinishReason(data.stop_reason),
        latencyMs: 0,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private async callGemini(
    config: AIProviderConfig,
    request: AICompletionRequest,
    timeout: number,
  ): Promise<AICompletionResponse> {
    const baseUrl = config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const contents = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstruction = request.messages.find((m) => m.role === 'system');

    try {
      const modelPath = request.model.replace(/^gemini-/, 'models/gemini-');
      const response = await fetch(
        `${baseUrl}/${modelPath}:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            ...(systemInstruction
              ? { systemInstruction: { parts: [{ text: systemInstruction.content }] } }
              : {}),
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxTokens ?? 4096,
              topP: request.topP,
              stopSequences: request.stop,
              ...(request.responseFormat?.type === 'json_object'
                ? { responseMimeType: 'application/json' }
                : {}),
            },
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const body = await response.text();
        throw Object.assign(new Error(body), { status: response.status });
      }

      const data = await response.json() as {
        candidates: Array<{
          content: { parts: Array<{ text: string }>; role: string };
          finishReason: string;
        }>;
        usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number };
      };

      const text = data.candidates[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
      const usage = data.usageMetadata;

      return {
        id: `gemini-${Date.now()}`,
        content: text,
        model: request.model,
        provider: 'gemini',
        usage: {
          promptTokens: usage?.promptTokenCount ?? 0,
          completionTokens: usage?.candidatesTokenCount ?? 0,
          totalTokens: usage?.totalTokenCount ?? 0,
        },
        finishReason: this.mapFinishReason(data.candidates[0]?.finishReason ?? 'STOP'),
        latencyMs: 0,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async *streamComplete(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    const provider = this.getProviderForModel(request.model);
    await this.checkRateLimit(provider);

    switch (provider) {
      case 'openai':
        yield* this.streamOpenAI(request);
        break;
      case 'anthropic':
        yield* this.streamAnthropic(request);
        break;
      case 'gemini':
        yield* this.streamGemini(request);
        break;
      default:
        throw new AIError(`Streaming not supported for ${provider}`, provider, 'PROVIDER_UNAVAILABLE');
    }
  }

  private async *streamOpenAI(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    const config = this.getConfig('openai');
    const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        ...(config.organization ? { 'OpenAI-Organization': config.organization } : {}),
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Object.assign(new Error(body), { status: response.status });
    }

    const reader = response.body?.getReader();
    if (!reader) throw new AIError('No response body', 'openai', 'NETWORK_ERROR');

    const decoder = new TextDecoder();
    let buffer = '';
    let id = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as {
              id: string;
              choices: Array<{ delta: { content?: string }; finish_reason: string | null }>;
              usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
            };

            id = parsed.id || id;
            const delta = parsed.choices[0]?.delta?.content ?? '';
            const finishReason = parsed.choices[0]?.finish_reason;

            yield {
              id,
              delta,
              finishReason: finishReason ? this.mapFinishReason(finishReason) : null,
              usage: parsed.usage
                ? {
                    promptTokens: parsed.usage.prompt_tokens,
                    completionTokens: parsed.usage.completion_tokens,
                    totalTokens: parsed.usage.total_tokens,
                  }
                : undefined,
            };
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async *streamAnthropic(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    const config = this.getConfig('anthropic');
    const baseUrl = config.baseUrl ?? 'https://api.anthropic.com/v1';
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const nonSystemMessages = request.messages.filter((m) => m.role !== 'system');

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? 4096,
        system: systemMessage?.content,
        messages: nonSystemMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Object.assign(new Error(body), { status: response.status });
    }

    const reader = response.body?.getReader();
    if (!reader) throw new AIError('No response body', 'anthropic', 'NETWORK_ERROR');

    const decoder = new TextDecoder();
    let buffer = '';
    let id = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          try {
            const parsed = JSON.parse(data) as {
              type: string;
              delta?: { text?: string; stop_reason?: string };
              message?: { id: string };
              usage?: { input_tokens: number; output_tokens: number };
            };

            if (parsed.type === 'message_start' && parsed.message) {
              id = parsed.message.id;
            } else if (parsed.type === 'content_block_delta' && parsed.delta) {
              yield { id, delta: parsed.delta.text ?? '', finishReason: null };
            } else if (parsed.type === 'message_delta' && parsed.delta) {
              yield {
                id,
                delta: '',
                finishReason: parsed.delta.stop_reason
                  ? this.mapFinishReason(parsed.delta.stop_reason)
                  : null,
                usage: parsed.usage
                  ? {
                      promptTokens: parsed.usage.input_tokens,
                      completionTokens: parsed.usage.output_tokens,
                      totalTokens: parsed.usage.input_tokens + parsed.usage.output_tokens,
                    }
                  : undefined,
              };
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async *streamGemini(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    const config = this.getConfig('gemini');
    const baseUrl = config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';

    const contents = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstruction = request.messages.find((m) => m.role === 'system');
    const modelPath = request.model.replace(/^gemini-/, 'models/gemini-');

    const response = await fetch(
      `${baseUrl}/${modelPath}:streamGenerateContent?key=${config.apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          ...(systemInstruction
            ? { systemInstruction: { parts: [{ text: systemInstruction.content }] } }
            : {}),
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 4096,
          },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw Object.assign(new Error(body), { status: response.status });
    }

    const reader = response.body?.getReader();
    if (!reader) throw new AIError('No response body', 'gemini', 'NETWORK_ERROR');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          try {
            const parsed = JSON.parse(data) as {
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
                finishReason?: string;
              }>;
            };

            const text = parsed.candidates?.[0]?.content?.parts
              ?.map((p) => p.text ?? '')
              .join('') ?? '';

            yield {
              id: `gemini-stream-${Date.now()}`,
              delta: text,
              finishReason: parsed.candidates?.[0]?.finishReason
                ? this.mapFinishReason(parsed.candidates[0].finishReason)
                : null,
            };
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private mapFinishReason(reason: string): AICompletionResponse['finishReason'] {
    const mapping: Record<string, AICompletionResponse['finishReason']> = {
      stop: 'stop',
      STOP: 'stop',
      length: 'length',
      max_tokens: 'length',
      content_filter: 'content_filter',
      CONTENT_FILTER: 'content_filter',
      tool_calls: 'tool_call',
      tool_call: 'tool_call',
    };
    return mapping[reason] ?? 'stop';
  }
}

let globalClient: AIProviderClient | null = null;

export function getAIProviderClient(): AIProviderClient {
  if (!globalClient) {
    globalClient = new AIProviderClient({
      maxRetries: 3,
      timeout: 60_000,
      fallbackEnabled: true,
    });

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GOOGLE_AI_API_KEY;
    const replicateKey = process.env.REPLICATE_API_TOKEN;
    const stabilityKey = process.env.STABILITY_API_KEY;

    const configs: Partial<Record<AIProvider, AIProviderConfig>> = {};
    if (openaiKey) configs.openai = { apiKey: openaiKey, organization: process.env.OPENAI_ORG_ID };
    if (anthropicKey) configs.anthropic = { apiKey: anthropicKey };
    if (geminiKey) configs.gemini = { apiKey: geminiKey };
    if (replicateKey) configs.replicate = { apiKey: replicateKey };
    if (stabilityKey) configs.stability = { apiKey: stabilityKey };

    globalClient.configureAll(configs);
  }
  return globalClient;
}

export function resetAIProviderClient(): void {
  globalClient = null;
}

export function createStructuredPrompt<T>(
  schema: z.ZodSchema<T>,
  context: string,
  task: string,
): AIMessage[] {
  const jsonSchema = JSON.stringify(zodToJsonSchema(schema), null, 2);
  return [
    {
      role: 'system',
      content: [
        'You are an AI assistant specialized in media content creation.',
        'Respond with valid JSON matching the provided schema.',
        'Do not include markdown formatting, code blocks, or any text outside the JSON response.',
        'Ensure all required fields are present and values match the expected types.',
        `JSON Schema:\n${jsonSchema}`,
      ].join('\n\n'),
    },
    {
      role: 'user',
      content: [context ? `Context:\n${context}` : '', `Task:\n${task}`]
        .filter(Boolean)
        .join('\n\n'),
    },
  ];
}

function zodToJsonSchema(schema: z.ZodSchema): Record<string, unknown> {
  const def = schema._def;
  if (def.typeName === 'ZodObject') {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, val] of Object.entries(def.shape())) {
      const fieldSchema = val as z.ZodSchema;
      properties[key] = zodToJsonSchema(fieldSchema);
      if (!fieldSchema.isOptional()) {
        required.push(key);
      }
    }
    return { type: 'object', properties, required };
  }
  if (def.typeName === 'ZodString') return { type: 'string' };
  if (def.typeName === 'ZodNumber') return { type: 'number' };
  if (def.typeName === 'ZodBoolean') return { type: 'boolean' };
  if (def.typeName === 'ZodArray') {
    return { type: 'array', items: zodToJsonSchema(def.type) };
  }
  if (def.typeName === 'ZodEnum') {
    return { type: 'string', enum: def.values };
  }
  if (def.typeName === 'ZodOptional') {
    return zodToJsonSchema(def.innerType);
  }
  return { type: 'string' };
}
