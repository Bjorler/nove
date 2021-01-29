import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export  class FindUserDto{
    @ApiProperty({
        type:Number,
        example:28,
        description:"Identifier of the user to be searched"
    })
    @IsNumber()
    id:number
}