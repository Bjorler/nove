import { IsString,IsEmail, MinLength,IsNotEmpty, Matches, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RolesDto } from '../../commons/DTO/roles.dto';

export class UpdateUserDto{
    @IsNumber()
    @ApiProperty({
        type:Number,
        description:"identifier of the user to be updated",
        example:1,
        required:true
    })
    userId:number



    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @IsOptional()
    @ApiProperty({
        type:String,
        example:"Miguel",
        required:false
    })
    name:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @IsOptional()
    @ApiProperty({
        type:String,
        example:"Morales",
        required:false
    })
    apellido_materno:string;
    
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @IsOptional()
    @ApiProperty({
        type:String,
        example:"Morales",
        required:false
    })
    apellido_paterno:string;
    
    @IsNotEmpty()
    @IsEmail()
    @MinLength(1)
    @IsOptional()
    @ApiProperty({
        type:String,
        example:"miguel.morales@email.com",
        required:false
    })
    email:string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&]{8,}$/
    ,{message:"password must contain at least one uppercase and one number"})
    @MinLength(8)
    @IsOptional()
    @ApiProperty({
        type:String,
        example:"tmpOr4l2020",
        required:false
    })
    password:string;

    @IsEnum(RolesDto)  
    @IsOptional()
    @ApiProperty(
        {
            enum:["ADMIN","MASTER"],
            required:false
        }
    )  
    role?:RolesDto;

    @ApiProperty({
        type:"file",
        description:"Image",
        properties:{
            file:{
                type:"string",
                format:"binary"
            }
        },
        required:false
    })
    @IsOptional()
    image:any
}