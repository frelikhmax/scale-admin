import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedScaleDevice } from './scale-api-auth.guard';

export const CurrentScaleDevice = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedScaleDevice => {
  const request = context.switchToHttp().getRequest<{ scaleDevice?: AuthenticatedScaleDevice }>();
  if (!request.scaleDevice) {
    throw new Error('Scale device is not authenticated');
  }

  return request.scaleDevice;
});
