import {
  Length,
  IsString,
  IsOptional,
  ArrayMinSize,
  IsArray,
  ValidateNested,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class IEncrypterInfos {
  @IsOptional()
  @IsString()
  @Min(32)
  key?: string | undefined;

  @IsOptional()
  @IsString()
  @Length(16, 16)
  iv?: string | undefined;

  @IsOptional()
  @IsString()
  algorithm?: string | undefined;
}

export class IEncrypterModelInfos extends IEncrypterInfos {
  @IsOptional()
  @IsString()
  ivField?: string | undefined;

  @IsOptional()
  @IsBoolean()
  stripIvField?: boolean | undefined;
}

export class IEncrypterModel {
  @IsString()
  model: string;

  @IsArray()
  @IsOptional()
  fields?: string[] | undefined;

  @IsOptional()
  @Type(() => IEncrypterInfos)
  local?: IEncrypterModelInfos | undefined;
}

export class IEncrypterOptions {
  @IsOptional()
  @IsBoolean()
  logging?: boolean | undefined;

  @IsOptional()
  @Type(() => IEncrypterInfos)
  global?: IEncrypterInfos | undefined;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => IEncrypterModel)
  models?: IEncrypterModel[] | undefined;
}
