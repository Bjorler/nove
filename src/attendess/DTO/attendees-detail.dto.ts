import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AttendeesDetailDto{
    @ApiProperty({
        type:Number,
        example:1
    })
    @IsNumber()
    id:number;
}