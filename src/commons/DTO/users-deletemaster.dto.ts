import { ApiProperty } from '@nestjs/swagger';

export class UsersDeleteMasterDto{
    @ApiProperty({
        type:Number,
        example:419
    })
    statusCode: number;

    @ApiProperty({
        type:String,
        example:"Unable to remove master user"
    })
    message:string
}