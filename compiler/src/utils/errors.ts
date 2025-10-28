export class BadRequestError extends Error {
  status = 400 as const;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  status = 404 as const;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class TooManyRequestsError extends Error {
  status = 429 as const;
  constructor(message: string) {
    super(message);
    this.name = "TooManyRequestsError";
  }
}

export class InternalServerError extends Error {
  status = 500 as const;
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}
