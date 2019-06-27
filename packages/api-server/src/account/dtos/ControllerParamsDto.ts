import { IsUUID } from 'class-validator';

export class ControllerParamsDto {
  @IsUUID('4')
  readonly id: string;
}
