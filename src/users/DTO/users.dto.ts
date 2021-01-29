import { ApiProperty } from '@nestjs/swagger';

export class UsersDto{
    @ApiProperty({
        type:String,
        example:"2021-01-28 16:23:33"
    })
    lastlogin:string;

    @ApiProperty({
        type:String,
        example:"Miguel"
    })
    name:string;

    @ApiProperty({
        type:String,
        example:"Morales"
    })
    apellido_paterno:string;

    @ApiProperty({
        type:String,
        example:"Miguel Morales"
    })
    complete_name:string;
    
    @ApiProperty({
        type:String,
        example:"miguel.morales@email.com"
    })
    email:string;

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/users/image/1"
    })
    download_img:string;
    
    @ApiProperty({
        type:Number,
        example:1
    })
    id:number;

    @ApiProperty({
        type:String,
        example:"Administrador"
    })
    role:string;

    @ApiProperty({
        type:Number,
        example:1
    })
    role_id:number;
}