import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDate, MinLength } from 'class-validator';

export class EventsCreateDto{

    @ApiProperty({
        type:String,
        example:"Avances Tecnologicos de genética humana",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    name:string;

    @ApiProperty({
        type:String,
        example:"CDMX, México",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    address:string;

    @ApiProperty({
        type:String,
        example:`Vivamus aliquet magna dui, nec tincidunt dolor rutrum non. Nullam eleifend libero quis tortor consequat porttitor. In pulvinar sem nunc, egestas efficitur ante scelerisque quis. Donec et ultrices mi. Aenean a arcu ligula. Quisque ac feugiat eros. Nam nibh libero, commodo nec ex nec, aliquam sollicitudin erat. Cras et accumsan ex. Vestibulum non auctor leo. Pellentesque nec neque ut nulla pharetra sollicitudin. Suspendisse malesuada tellus quis augue fermentum tincidunt. Ut sed purus eu est vehicula volutpat. Mauris quis porttitor mi.`,
        required:true
    })
    @IsString()
    @IsNotEmpty()
    description:string;

    @ApiProperty({
        type:String,
        example:"2021-06-25",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    event_date:string;

    @ApiProperty({
        type:String,
        example:"12:00"
    })
    @IsString()
    @IsNotEmpty()
    hour_init:string;
    
    @ApiProperty({
        type:String,
        example:"13:00"
    })
    @IsString()
    @IsNotEmpty()
    hour_end:string;

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
    image:any
}