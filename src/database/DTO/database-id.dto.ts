import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DatabaseIdDto{
    @ApiProperty({
        type:Number,
        example:""
    })
    @IsNumber()
    id:number;
}