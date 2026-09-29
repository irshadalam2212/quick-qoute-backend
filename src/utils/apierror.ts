class ApiError extends Error {
  public readonly code: number;
  public readonly data: unknown[];
  public readonly success: false;
  public readonly errors: unknown[];

  constructor(
    code: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    stack = "",
  ) {
    super(message);

    this.code = code;
    this.data = [];
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
