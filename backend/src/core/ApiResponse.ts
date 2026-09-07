import { Response } from 'express';

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: Record<string, unknown>
  ): Response {
    const payload: IApiResponse<T> = {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message = 'Internal Server Error',
    statusCode = 500,
    meta?: Record<string, unknown>
  ): Response {
    const payload: IApiResponse<null> = {
      success: false,
      message,
      meta,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(payload);
  }
}
