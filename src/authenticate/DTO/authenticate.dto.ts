import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AutehenticateDto{
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        type:"string",
        example:"admin@octopy.com",
        required:true
    })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type:"string",
        example:"ABC123?!",
        required:true
    })
    password:string;
}