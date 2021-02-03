import { ApiProperty } from '@nestjs/swagger';

export class DatabaseResponseByCedulaDto{
    @ApiProperty({
        type:String,
        example:"ILSE ITZEL BAUTISTA CRUZ"
    })
    name:string="";

    @ApiProperty({
        type:String,
        example:"LICENCIATURA EN CIRUJANO DENTISTA"
    })
    speciality:string="";

    @ApiProperty({
        type:String,
        example:"ilse.bautista@mail.com"
    })
    email:string="";

    @ApiProperty({
        type:Number,
        example:11478770
    })
    cedula:number=0;

    @ApiProperty({
        type:String,
        example:"001",
        description:"El formato de este atributo esta pendiente de validación"
    })
    idengage:string="";

    @ApiProperty({
        type:String,
        example:"excel",
        description:"indicates the place where the information was found"
    })
    register_type:string="";
    

}