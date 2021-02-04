import { ApiProperty } from '@nestjs/swagger';

export class AttendeesListDto{
    @ApiProperty({
        type:Number,
        example:1
    })
    id:number;


    @ApiProperty({
        type:String,
        example:"Jimena Alonso Contreras"
    })
    name:string;

    @ApiProperty({
        type:Number,
        example:"7345678923"
    })
    cedula:number;

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/attendees/signature/1"
    })
    download_signature:string;

    @ApiProperty({
        type:String,
        example:"excel",
        description:"Mechanism by which it was registered, If the registration method is not excel, it means that it is a new user"
    })
    register_type:string;

    @ApiProperty({
        type:String,
        example:"Cardiología Intervencionista"
    })
    speciality:string;

    @ApiProperty({
        type:String,
        example:"jimena.alonso@mail.com"
    })
    email:string;

    @ApiProperty({
        type:String,
        example:""
    })
    idengage:string;

}