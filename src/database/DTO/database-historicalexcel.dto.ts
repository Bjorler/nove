import { ApiProperty } from '@nestjs/swagger';

class ItemDto {
    @ApiProperty({
        type:String,
        example:"2021-02-01",
        description:"Document upload date"
    })
    date:string;
    
    @ApiProperty({
        type:Number,
        example:29,
        description:"Record identifier"
    })
    id:number;

    @ApiProperty({
        type:String,
        example:"document.xlsx",
        description:"File name"
    })
    file_name:string;

    @ApiProperty({
        type:String,
        example:"12:00",
        description:"Charge time"
    })
    time:string;
}

class GroupedDto{
    @ApiProperty({
        type:[ItemDto],
        description:"File upload information per day"
    })
    upload_date:string;
}

export class DatabaseHistoricalExcelDto{
    @ApiProperty({
        type:[GroupedDto],
        description:"Contains file upload history grouped by month"
    })
    month:string;
}