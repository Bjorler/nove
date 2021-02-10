import { ApiProperty } from '@nestjs/swagger';
import { GraphEventsResponseDto } from './graph-eventsresponse.dto';
export class GraphPieResponse{
    @ApiProperty({
        type:[GraphEventsResponseDto]
    })
    items:GraphEventsResponseDto[];

    @ApiProperty({
        type:Number,
        example:200
    })
    total_elements:number;

    @ApiProperty({
        type:[String],
        example:["2021"]
    })
    years:string[]

}