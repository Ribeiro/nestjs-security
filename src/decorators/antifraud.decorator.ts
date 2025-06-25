import { SetMetadata } from '@nestjs/common';
import { ANTIFRAUD_META_KEY } from '../antifraud/antifraud.constants';

export interface AntifraudOptions {
  key: string;
  limit: number;
  duration: number;
}

export function Antifraud(options: AntifraudOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    SetMetadata(ANTIFRAUD_META_KEY, options)(target, propertyKey, descriptor);
  };
}
