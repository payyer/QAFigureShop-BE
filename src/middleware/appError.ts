export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Phân biệt lỗi do mình tự ném (Business Logic) và lỗi hệ thống (Crash)

        Error.captureStackTrace(this, this.constructor);
    }
}