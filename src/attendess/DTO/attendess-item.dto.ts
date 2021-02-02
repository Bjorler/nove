import { ApiProperty } from '@nestjs/swagger';

export class AttendeesItemDto{
    @ApiProperty({
        type:Number,
        example:1
    })
    id:number;

    @ApiProperty({
        type:String,
        example:"Jimena"
    })
    name:string;

    @ApiProperty({
        type:String,
        example:"Alonso Contreras"
    })
    lastname:string;

    @ApiProperty({
        type:Number,
        example:7345678923
    })
    cedula:number;

    @ApiProperty({
        type:String,
        example:"Cardiología Intervencionista"
    })
    speciality:string;

    @ApiProperty({
        type:String,
        example:"jimena.alonso@novonordisk.com"
    })
    email:string;
    
}