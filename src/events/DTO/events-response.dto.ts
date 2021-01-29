import { ApiProperty } from '@nestjs/swagger';

export class EventsResponse{

    @ApiProperty({
        type:Number,
        example:1
    })
    id:number;

    @ApiProperty({
        type:String,
        example:"Clinica y herramientas diagnósticas en genética humana"
    })
    name:string;

    @ApiProperty({
        type:String,
        example:"CDMX, México"
    })
    location:string;

    @ApiProperty({
        type:String,
        example:"05-11-2021"
    })
    event_date:string;

    @ApiProperty({
        type:Number,
        example:30
    })
    assistance:number;
}