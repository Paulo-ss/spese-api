import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express-serve-static-core';
import { getToday } from '../common/utils/dates.utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();

        const status = (exception as any)?.response?.statusCode || 500;
        let errorMessage =
            (exception as any)?.response?.message || 'Internal Server Error.';

        if (exception instanceof TypeError) {
            errorMessage = exception.stack;
        }

        response.status(status).json({
            statusCode: status,
            errorMessage,
            timestamp: getToday().toISOString(),
            path: request.url,
        });
    }
}
