import { ApiProperty } from '@nestjs/swagger';

export class EventsInfoDto{

    @ApiProperty({
        type:Number,
        example:1
    })
    eventId:number;

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

    @ApiProperty({
        type:String,
        example:"event.png"
    })
    image_name:string;

    @ApiProperty({
        type:String,
        example:"Avances Tecnologicos de genética humana"
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
        type:String,
        example:"Haemophilia"
    })
    brand:string;

    @ApiProperty({
        type:String,
        example:"Vivamus aliquet magna dui, nec tincidunt dolor rutrum non. Nullam eleifend libero quis tortor consequat porttitor. In pulvinar sem nunc, egestas efficitur ante scelerisque quis. Donec et ultrices mi. Aenean a arcu ligula. Quisque ac feugiat eros. Nam nibh libero, commodo nec ex nec, aliquam sollicitudin erat. Cras et accumsan ex. Vestibulum non auctor leo. Pellentesque nec neque ut nulla pharetra sollicitudin. Suspendisse malesuada tellus quis augue fermentum tincidunt. Ut sed purus eu est vehicula volutpat. Mauris quis porttitor mi."
    })
    description:string;

    @ApiProperty({
        type:[String],
        example:[{
            "dispay_date": "04-06-2021",
            "event_date": "2021-04-06T05:00:00.000Z"
        }]
    })
    event_date:string[];

    @ApiProperty({
        type:String,
        example:"12:00"
    })
    hour_init:string;

    @ApiProperty({
        type:String,
        example:"13:00"
    })
    hour_end:string; 

    

    @ApiProperty({
        type:String,
        example:"12:00 - 13:00 Hrs"
    })
    display_time:string;
}