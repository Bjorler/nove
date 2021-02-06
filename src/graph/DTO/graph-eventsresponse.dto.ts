import { ApiProperty } from '@nestjs/swagger';

export class GraphEventsResponseDto {
    @ApiProperty({
        type:String,
        example:"Enero"
    })
    name: string;

    @ApiProperty({
        type:Number,
        example:12,
    })
    value:number
}

