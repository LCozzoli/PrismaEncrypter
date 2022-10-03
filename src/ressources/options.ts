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
  key?: string;

  @IsOptional()
  @IsString()
  @Length(16, 16)
  iv?: string;

  @IsOptional()
  @IsString()
  algorithm?: string;
}

export class IEncrypterModelInfos extends IEncrypterInfos {
  @IsOptional()
  @IsString()
  ivField?: string;

  @IsOptional()
  @IsBoolean()
  stripIvField?: boolean;
}

export class IEncrypterModel {
  @IsString()
  model: string;

  @IsArray()
  @IsOptional()
  fields?: string[];

  @IsOptional()
  @Type(() => IEncrypterInfos)
  local?: IEncrypterModelInfos;
}

export class IEncrypterOptions {
  @IsOptional()
  @IsBoolean()
  logging?: boolean;

  @IsOptional()
  @Type(() => IEncrypterInfos)
  global?: IEncrypterInfos;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => IEncrypterModel)
  models?: IEncrypterModel[];
}
