import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export  class DeleteUserDto{
    @ApiProperty({
        type:Number,
        example:28,
        description:"Identifier of the user to be removed"
    })
    @IsNumber()
    userId:number
}