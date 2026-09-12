export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", code: string = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string = "Unauthorized",
    code: string = "UNAUTHORIZED"
  ) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string = "Forbidden",
    code: string = "FORBIDDEN"
  ) {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    code: string = "NOT_FOUND"
  ) {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = "Resource already exists",
    code: string = "CONFLICT"
  ) {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    errors: Record<string, string[]>,
    message: string = "Validation failed"
  ) {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(
    message: string = "Too many requests",
    retryAfter: number = 60
  ) {
    super(message, 429, "RATE_LIMIT_ERROR");
    this.retryAfter = retryAfter;
  }
}

export class InternalError extends AppError {
  constructor(
    message: string = "Internal server error",
    code: string = "INTERNAL_ERROR"
  ) {
    super(message, 500, code, false);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = "Service unavailable",
    code: string = "SERVICE_UNAVAILABLE"
  ) {
    super(message, 503, code);
  }
}

export class PaymentError extends AppError {
  constructor(
    message: string = "Payment processing failed",
    code: string = "PAYMENT_ERROR"
  ) {
    super(message, 402, code);
  }
}

export class UploadError extends AppError {
  constructor(
    message: string = "File upload failed",
    code: string = "UPLOAD_ERROR"
  ) {
    super(message, 413, code);
  }
}

export class MediaProcessingError extends AppError {
  constructor(
    message: string = "Media processing failed",
    code: string = "MEDIA_PROCESSING_ERROR"
  ) {
    super(message, 422, code);
  }
}

export class ContentError extends AppError {
  constructor(
    message: string = "Content operation failed",
    code: string = "CONTENT_ERROR"
  ) {
    super(message, 400, code);
  }
}

export class SubscriptionError extends AppError {
  constructor(
    message: string = "Subscription operation failed",
    code: string = "SUBSCRIPTION_ERROR"
  ) {
    super(message, 400, code);
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalError(error.message);
  }

  return new InternalError("An unknown error occurred");
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }
  return "UNKNOWN_ERROR";
}
