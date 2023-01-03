import { validateSync } from 'class-validator';
import { singleton } from 'tsyringe';
import { EMethodsToDecrypt, EMethodsToEncrypt } from '../ressources/actions';
import {
  IEncrypterInfos,
  IEncrypterModel,
  IEncrypterOptions,
} from '../ressources/options';
import { encrypt, decrypt } from './crypter';
import { EEncrypterErrors } from '../ressources/errors';
import { isObject } from './utils';

@singleton()
export class PrismaEncrypter {
  private models: IEncrypterModel[] = [];
  private global: IEncrypterInfos;
  private crypter = {
    encrypt,
    decrypt,
  };

  rawEncrypt = (value: string, key?: string, iv?: string, algorithm?: string) =>
    encrypt(value, key || this.global?.key, iv, algorithm);
  rawDecrypt = (value: string, key?: string, iv?: string, algorithm?: string) =>
    decrypt(value, key || this.global?.key, iv, algorithm);

  setOptions(options: IEncrypterOptions | string) {
    if (typeof options === 'string') {
      return this.setOptions({
        global: {
          key: options,
        },
      });
    }
    const errors = validateSync(options);
    if (errors.length > 0) throw errors;
    this.models = options.models;
    this.global = options.global;
  }

  addModels(models: IEncrypterModel[]) {
    const errors = validateSync(models);
    if (errors.length > 0) throw errors;
    this.models = this.models.filter(
      (e) => !models.some((m) => m.model === e.model)
    );
    this.models.push(...models);
  }

  getIVKey(model: IEncrypterModel, data) {
    const field = model?.local?.ivField;
    if (!field) return model?.local?.iv || this.global.iv;
    if (!(field in data)) throw new Error(EEncrypterErrors.MissingIVField);
    return data[field];
  }

  transformData(
    method: 'encrypt' | 'decrypt',
    model: IEncrypterModel | null,
    data
  ) {
    if (!data) return data;
    if (Array.isArray(data))
      return data.map((d) => this.transformData(method, model, d));
    const ivKey = model ? this.getIVKey(model, data) : this.global.iv;
    for (const field in data) {
      if (Array.isArray(data[field]) || isObject(data[field])) {
        model = this.models.find((m) => field.includes(m.model.toLowerCase()));
        data[field] = model
          ? this.transformData(method, model, data[field])
          : data[field];
        continue;
      } else if (this.models?.length && !model) continue;
      if (
        typeof data[field] == 'string' &&
        (!model?.fields.length || model?.fields.includes(field))
      ) {
        try {
          data[field] = this.crypter[method](
            data[field],
            model?.local?.key || this.global?.key,
            ivKey,
            model?.local?.algorithm || this.global?.algorithm
          );
        } catch (err) {
          console.error(method, field, data[field], err?.message || err);
        }
      }
    }
    if (
      method == 'decrypt' &&
      model?.local?.ivField &&
      model?.local?.stripIvField
    )
      delete data[model.local.ivField];
    return data;
  }

  async middleware(params, next) {
    if (!this.global?.key && !this.models?.length) return next(params);

    const model = this.models?.length
      ? this.models.find((m) => m.model === params.model)
      : null;

    if (EMethodsToEncrypt[params.action]) {
      if (params?.args)
        for (const arg in params.args) {
          params.args[arg] = this.transformData(
            'encrypt',
            model,
            params.args[arg]
          );
        }
    }

    const result = await next(params);

    if (EMethodsToDecrypt[params.action] && result) {
      try {
        let decrypted = this.transformData('decrypt', model, result);
        return decrypted;
      } catch (err) {
        console.error(err?.message || err);
      }
    }
    return result;
  }
}
