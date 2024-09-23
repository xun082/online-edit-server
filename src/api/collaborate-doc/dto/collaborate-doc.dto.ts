import { IsNotEmpty, IsString } from 'class-validator';

export class DetailDto {
  @IsNotEmpty()
  @IsString()
  recordId: string;
}
