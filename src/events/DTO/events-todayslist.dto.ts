import { ApiProperty } from '@nestjs/swagger';

export  class EventsTodaysListDto{

    @ApiProperty({
        type:Number,
        example:1,
        description:"Event identifier"
    })
    id:number;

    @ApiProperty({
        type:String,
        example:"05-11-2021",
        description:"Event registration date"
    })
    event_date:string;

    @ApiProperty({
        type:String,
        example:"Clinica y herramientas diagnósticas en genética",
        description:"Event name"
    })
    event_name:string;

    @ApiProperty({
        type:String,
        example:"Evento con fines de educación continua y actualización de conocimientos en cardiología",
        description:"Brief information about the event"
    })
    description:string;

    @ApiProperty({
        type:String,
        example:"12:00 - 13:00 Hrs",
        description:"time format to display on screen"
    })
    display_time:string;

    @ApiProperty({
        type:String,
        example:"12:00:00",
        description:"Value saved in the database referring to the start time"
    })
    hour_init:string;

    @ApiProperty({
        type:String,
        example:"13:00:00",
        description:"Value saved in the database referring to the final time"
    })
    hour_end:string;

    @ApiProperty({
        type:String,
        example:"CDMX, México",
        description:"Event location"
    })
    ubication:string;

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/events/image/1"
    })
    download_img:string;

    @ApiProperty({
        type:String,
        example:"http://116.24.56.9:8080/events/image",
        description:"Default image when main image is missing"
    })
    default_img:string;
}