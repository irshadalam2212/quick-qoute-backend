class ApiResponse<T = unknown> {
  public readonly code: number;
  public readonly data: T | undefined;
  public readonly message: string;
  public readonly success: boolean;

  constructor(code: number, data?: T, message = "Success") {
    this.code = code;
    this.data = data;
    this.message = message;
    this.success = code < 400;
  }
}

export { ApiResponse };
