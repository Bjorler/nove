import { ApiProperty } from '@nestjs/swagger';

export class UserDetailDto{
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
        example:"Morales"
    })
    apellido_materno:string;

    @ApiProperty({
        type:String,
        example:"miguel.morale@email.com"
    })
    email:string;

    @ApiProperty({
        type:Number,
        example:9
    })
    password_length:number;

    @ApiProperty({
        type:String,
        example:"Master"
    })
    role:string;

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/users/image/1"
    })
    download_img:string;
    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/users/image/",
        description:"Default image when main image is missing"
    })
    default_img:string;

    @ApiProperty({
        type:String,
        example:"avatar.png"
    })
    avatar:string;

    @ApiProperty({
        type:Number,
        example:1
    })
    id:number;

    @ApiProperty({
        type:Number,
        example:1
    })
    role_id:number;

}