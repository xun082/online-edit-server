import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DetailDto {
  @IsNotEmpty()
  @IsString()
  recordId: string;
}

export class CreateShareLinkDto {
  @IsString()
  recordId: string;

  @IsString()
  @IsOptional()
  accessLevel?: string;
}

export class ShareDetailDto {
  @IsString()
  shareId: string;
}
