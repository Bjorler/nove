import { ApiProperty } from '@nestjs/swagger';
export class RoleRepatErrorDto{
    @ApiProperty({
        type:Number,
        example:411
    })
    statusCode:number;

    @ApiProperty({
        type:String,
        example:"Your user already has 2 roles"
    })
    message:string
}