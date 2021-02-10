import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
export class EventsUpdateDto{

    @ApiProperty({
        type:String,
        example:"1",
        required:true
    })
    @IsString()
    @IsNotEmpty()
    eventId:string;

    @ApiProperty({
        type:String,
        example:"Avances Tecnologicos de genética humana",
        required:false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name:string;

    @ApiProperty({
        type:String,
        example:"CDMX, México",
        required:false
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @IsOptional()
    address:string;

    @ApiProperty({
        type:String,
        example:`Vivamus aliquet magna dui, nec tincidunt dolor rutrum non. Nullam eleifend libero quis tortor consequat porttitor. In pulvinar sem nunc, egestas efficitur ante scelerisque quis. Donec et ultrices mi. Aenean a arcu ligula. Quisque ac feugiat eros. Nam nibh libero, commodo nec ex nec, aliquam sollicitudin erat. Cras et accumsan ex. Vestibulum non auctor leo. Pellentesque nec neque ut nulla pharetra sollicitudin. Suspendisse malesuada tellus quis augue fermentum tincidunt. Ut sed purus eu est vehicula volutpat. Mauris quis porttitor mi.`,
        required:false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description:string;

    @ApiProperty({
        type:String,
        example:"2021-06-02",
        required:false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    event_date:string;

    @ApiProperty({
        type:String,
        example:"12:00",
        required:false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    hour_init:string;
    
    @ApiProperty({
        type:String,
        example:"13:00",
        required:false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    hour_end:string;

    @ApiProperty({
        type:"file",
        description:"Event image",
        properties:{
            image:{
                type:"string",
                format:"binary"
            }
        },
        required:false
    })
    @IsOptional()
    image:any
}