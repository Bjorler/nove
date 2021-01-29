import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    if(value.userId){ value.userId = parseInt(value.userId) }
    if(value.id){ value.id = parseInt(value.id) }
    
    const object = plainToClass(metatype, value);
    
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(this.parseErrorMessage(errors),'Validation failed');
    }
    return value;
  }

  private parseErrorMessage(errors){
      let result = [];
      for (let err of errors){
          
          let body = { dataPath: err.property, error: err.constraints }
          result.push(body);
      }
      return result;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}