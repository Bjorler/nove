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
        example:"Sede Central"
    })
    sede:string;

    @ApiProperty({
        type:[String],
        example:["2021-03-08T16:17:04.000Z"]
    })
    event_date:string[];

    @ApiProperty({
        type:Number,
        example:30
    })
    assistance:number;
}