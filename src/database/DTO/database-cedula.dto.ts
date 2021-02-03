import { ApiProperty } from '@nestjs/swagger';
import {  IsString } from 'class-validator';

export class DatabaseCedulaDto{
    @ApiProperty({
        type:String,
        example:"11478770",
        description:"ID to look for"
    })
    @IsString()
    cedula:string;
}
