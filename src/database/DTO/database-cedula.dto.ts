import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DatabaseCedulaDto{
    @ApiProperty({
        type:String,
        example:"11478770",
        description:"ID to look for"
    })
    @IsString()
    cedula:string;
}

export class EventIdRequest{
    @ApiProperty({
        type:String,
        example:1
    })
    @IsString()
    @IsNotEmpty()
    event_id:string;
}