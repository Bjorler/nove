import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEmail } from 'class-validator';
export class AttendeesEmailDto{
    @ApiProperty({
        type:Number,
        example:1,
        description:"identifier of the attendance"
    })
    @IsNumber()
    id:number;

    @ApiProperty({
        type:String,
        example:"daisy@mail.com"
    })
    @IsEmail()
    email:string;

}