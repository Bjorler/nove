import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class DatabaseEmailDto{
    @ApiProperty({ example:"doctor.sincedula@mail.com", type:String })
    @IsEmail({},{message:"El campo mail debe ser de tipo correo electrónico"})
    @IsNotEmpty({ message:"El campo mail no debe estar vacío" })
    mail:string;

    @ApiProperty({
        type:String,
        example:1
    })
    @IsString()
    @IsNotEmpty({ message:"El campo event_di no debe estar vacío" })
    event_id:string;
}