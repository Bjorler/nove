import { IsString,IsEmail, MinLength,IsNotEmpty, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RolesDto } from '../../commons/DTO/roles.dto';

export class UserDto{
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @ApiProperty({
        type:String,
        example:"Miguel",
    })
    name:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @ApiProperty({
        type:String,
        example:"Morales"
    })
    apellido_materno:string;
    
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @ApiProperty({
        type:String,
        example:"Morales"
    })
    apellido_paterno:string;
    
    @IsNotEmpty()
    @IsEmail()
    @MinLength(1)
    @ApiProperty({
        type:String,
        example:"miguel.morales@email.com"
    })
    email:string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!_%*?&]{8,}$/
    ,{message:"password must contain at least one uppercase, one number and one lowercase"})
    @MinLength(8)
    @ApiProperty({
        type:String,
        example:"tmpOr4l2020"
    })
    password:string;

    @IsEnum(RolesDto,{message:`role must be a valid enum value [ADMIN, MASTER]`})  
    @ApiProperty( { enum:RolesDto })  
    role?:RolesDto;

    @ApiProperty({
        type:"file",
        description:"User avatar",
        properties:{
            file:{
                type:"string",
                format:"binary"
            }
        },
        required:false
    })
    avatar:any
}