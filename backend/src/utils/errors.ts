// Folder: src/utils
// Centralized error hierarchy for consistent API errors

export type ErrorMeta = Record<string, unknown> | undefined;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly type: string;
  public readonly meta?: ErrorMeta;

  constructor(type: string, message: string, statusCode = 500, meta?: ErrorMeta) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', meta?: ErrorMeta) {
    super('BadRequestError', message, 400, meta);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', meta?: ErrorMeta) {
    super('UnauthorizedError', message, 401, meta);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', meta?: ErrorMeta) {
    super('ForbiddenError', message, 403, meta);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', meta?: ErrorMeta) {
    super('NotFoundError', message, 404, meta);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', meta?: ErrorMeta) {
    super('ConflictError', message, 409, meta);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too Many Requests', meta?: ErrorMeta) {
    super('TooManyRequestsError', message, 429, meta);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', fields?: Record<string, string>) {
    super('ValidationError', message, 400, { fields });
  }
}
