import { createCipheriv, createDecipheriv } from 'crypto';

export function decrypt(
  data: string,
  key: string,
  iv: string = '0000000000000000',
  algorithm = 'aes-256-cbc'
): string {
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'utf8'));
  let dec = decipher.update(data, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

export function encrypt(
  data: string,
  key: string,
  iv: string = '0000000000000000',
  algorithm = 'aes-256-cbc'
): string {
  const cipher = createCipheriv(algorithm, key, Buffer.from(iv, 'utf8'));
  let enc = cipher.update(data, 'utf-8', 'hex');
  enc += cipher.final('hex');
  return enc;
}
