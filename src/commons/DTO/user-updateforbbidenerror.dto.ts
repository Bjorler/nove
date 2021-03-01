import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateForbiddenError{
    @ApiProperty({example:422}) statusCode:number;
    @ApiProperty({example:"You cannot update information for another master user"}) message:string;
}