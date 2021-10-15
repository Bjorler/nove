import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class AttendeesNoCedulaError{
    @ApiProperty({
        example:"Los usuarios sin cédula deben proporcionar su correo electrónico"
    })
    message:string;

    @ApiProperty({
        type:Number,
        example:HttpStatus.BAD_REQUEST
    })
    statusCode:number;
}

export class AttendeesFormatCedulaError{
    @ApiProperty({
        example:"Formato de cédula incorrecto: El campo cédula solo admite números"
    })
    message:string;

    @ApiProperty({
        type:Number,
        example:HttpStatus.BAD_REQUEST
    })
    statusCode:number;
}