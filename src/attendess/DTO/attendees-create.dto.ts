import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsNotEmpty, IsObject } from 'class-validator';

export class AttendeesCreateDto{

    @ApiProperty({
        type:String,
        example:1
    })
    @IsString()
    @IsNotEmpty()
    eventId:string;

    @ApiProperty({
        type:Number,
        example:"7345678923",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    cedula:string;

    @ApiProperty({
        type:String,
        example:"Jimena",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    name:string;
    
    @ApiProperty({
        type:String,
        example:"Alonso Contreras",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    lastname:string;

    @ApiProperty({
        type:String,
        example:"Cardiología Intervencionista",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    speciality:string;

    @ApiProperty({
        type:String,
        example:"jimena.alonso@novonordisk.com",
        required:true
    })
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @ApiProperty({
        type:String,
        example:"excel",
        description:"mechanism by which it was registered"
    })
    @IsString()
    @IsNotEmpty()
    register_type:string;


    @ApiProperty({
        type:Object,
        description:"Image",
        properties:{
            file:{
                type:"string",
                format:"binary"
            }
        },
        required:true
    })
    signature:any

    @ApiProperty({
        type:Object,
        description:"Pending"
    })
    questions:any

}