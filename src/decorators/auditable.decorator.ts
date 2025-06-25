import 'reflect-metadata';
export const AUDITABLE = 'audit:auditable';

export function Auditable(): ClassDecorator {
  return target => Reflect.defineMetadata(AUDITABLE, true, target);
}

export function isAuditable(entity: any): boolean {
  return entity && Reflect.getMetadata(AUDITABLE, entity.constructor);
}
