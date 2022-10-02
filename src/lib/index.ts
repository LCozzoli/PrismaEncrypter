import 'reflect-metadata';
import { IEncrypterModel, IEncrypterOptions } from '../ressources/options';
import { container } from 'tsyringe';
import { PrismaEncrypter } from './handler';

export function encryptionMiddleware(options: IEncrypterOptions | string) {
  const handler = container.resolve(PrismaEncrypter);
  handler.setOptions(options);
  return handler.middleware.bind(handler);
}

export function encryptModels(models: IEncrypterModel[]) {
  const handler = container.resolve(PrismaEncrypter);
  handler.addModels(models);
}

export function encryptModel(model: IEncrypterModel) {
  const handler = container.resolve(PrismaEncrypter);
  handler.addModels([model]);
}

export function manualEncrypt(
  value: string,
  key?: string,
  iv?: string,
  algorithm?: string
) {
  const handler = container.resolve(PrismaEncrypter);
  return handler.rawEncrypt(value, key, iv, algorithm);
}

export function manualDecrypt(
  value: string,
  key?: string,
  iv?: string,
  algorithm?: string
) {
  const handler = container.resolve(PrismaEncrypter);
  return handler.rawDecrypt(value, key, iv, algorithm);
}
