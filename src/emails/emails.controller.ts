import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import {
  CreateEmailExtensionDto,
  CreateEmailExtensionResponseDto,
  getAllExtensionResponseDto,
} from './dto/create-email.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/commons/decoratos/user.decorator';

@ApiTags('Emails')
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  @ApiOkResponse({ type: CreateEmailExtensionResponseDto })
  create(
    @Body() createEmailExtensionDto: CreateEmailExtensionDto,
    @User() session: any,
  ) {
    return this.emailsService.create(createEmailExtensionDto, session);
  }

  @Get()
  @ApiOkResponse({ type: getAllExtensionResponseDto })
  findAll() {
    return this.emailsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: CreateEmailExtensionResponseDto })
  findOne(@Param('id') id: string) {
    return this.emailsService.findOne(+id);
  }
}
