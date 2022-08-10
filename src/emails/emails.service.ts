import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { CreateEmailExtensionDto } from './dto/create-email.dto';

@Injectable()
export class EmailsService {
  private TABLE = 'email_extensions';

  constructor(@InjectKnex() private knex: Knex) {}

  async create(createEmailExtensionDto: CreateEmailExtensionDto, session: any) {
    const extension = createEmailExtensionDto?.email.split('@') || '';
    const extensionOk = `@${extension[1]}`;

    const alreadyExist = await this.findByExtension(extensionOk);
    if (alreadyExist.length > 0) {
      throw new BadRequestException('Extension already exist');
    }
    
    try {
      const data = {
        extension: extensionOk,
        created_by: session?.id || 1,
        modified_by: session?.id || 1,
      };

      const extensionSaved = await this.knex
        .table('email_extensions')
        .insert(data);

      return await this.findOne(extensionSaved[0]);
    } catch (error) {
      throw new InternalServerErrorException(error?.message || '');
    }
  }

  async findAll() {
    const extensions = await this.knex
      .table('email_extensions')
      .where({ is_deleted: 0 });
    return extensions;
  }

  async findOne(id: number) {
    const extension = await this.knex
      .table('email_extensions')
      .where({ id, is_deleted: 0 });

    if(extension.length <= 0){
      throw new NotFoundException('Extension does not found');
    }

    return extension;
  }

  async findByExtension(extensionName: string) {
    const extension = await this.knex
      .table('email_extensions')
      .where({ extension: extensionName, is_deleted: 0 });
    return extension;
  }
}
