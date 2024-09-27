import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Catch } from '@nestjs/common';
import { throwError } from 'rxjs';

@Catch()
export class RcpExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown) {
    return throwError(() => exception);
  }
}
