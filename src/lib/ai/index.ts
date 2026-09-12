export {
  AIProviderClient,
  AIError,
  getAIProviderClient,
  resetAIProviderClient,
  createStructuredPrompt,
} from './provider';

export type {
  AIProvider,
  AIModel,
  MediaTaskType,
  AIProviderConfig,
  AIMessage,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIErrorCode,
  ImageGenerationRequest,
  ImageGenerationResponse,
  VideoAnalysisRequest,
  VideoAnalysisResult,
} from './provider';

export { ContentGeneratorService, contentGenerator } from './content-generator';

export type {
  ContentTone,
  VideoStyle,
  ThumbnailStyle,
  ScriptRequest,
  ScriptSection,
  GeneratedScript,
  ThumbnailRequest,
  GeneratedThumbnail,
  TitleRequest,
  TitleSuggestion,
  DescriptionRequest,
  GeneratedDescription,
  ContentPlanRequest,
  ContentPlan,
} from './content-generator';

export { VideoEditorService, videoEditor } from './video-editor';

export type {
  VideoFormat,
  AspectRatio,
  CaptionStyle,
  VideoInput,
  VideoAnalysis,
  VideoScene,
  DetectedObject,
  DetectedFace,
  AudioAnalysis,
  SentimentTimeline,
  VideoQualityScore,
  HighlightRequest,
  Highlight,
  HighlightResult,
  CaptionSegment,
  CaptionRequest,
  GeneratedCaptions,
  TrimRequest,
  TrimResult,
  TransitionRequest,
  TransitionResult,
  OverlayRequest,
  OverlayResult,
  QualityAnalysisRequest,
  QualityReport,
} from './video-editor';

export { AnalyticsPredictorService, analyticsPredictor } from './analytics-predictor';

export type {
  TimeGranularity,
  TrendDirection,
  ChannelAnalytics,
  Demographics,
  VideoPerformance,
  GrowthMetrics,
  ViewPrediction,
  PredictionPoint,
  PredictionFactor,
  TrendAnalysis,
  TrendItem,
  SeasonalityPattern,
  CompetitorTrend,
  RevenuePrediction,
  RevenueOptimization,
  ContentPerformancePrediction,
  OptimalScheduleRequest,
  OptimalSchedule,
  ABTestResult,
} from './analytics-predictor';
