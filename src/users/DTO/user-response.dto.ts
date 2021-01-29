import { ApiProperty } from '@nestjs/swagger';
import { UsersDto } from './users.dto';

export class UserResponseDto {
    @ApiProperty({
        type:Number,
        example:10
    })
    total_pages:number

    @ApiProperty({
        type:[UsersDto]
    })
    users:UsersDto[]
}