import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateAdminError{
    @ApiProperty({example:423}) statusCode:number;
    @ApiProperty({example:"You cannot modify the information of an administrator, you can only modify the password"}) message:string;
}