import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailExtensionDto } from './create-email.dto';

export class UpdateEmailDto extends PartialType(CreateEmailExtensionDto) {}
