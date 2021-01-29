import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedDto{
    @ApiProperty({
        type:"nmumber",
        example:401
    })
    statusCode: number;

    @ApiProperty({
        type:"message",
        example:"MISSING token"
    })
    message:string
}