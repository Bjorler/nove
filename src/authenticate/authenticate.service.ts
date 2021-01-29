import { Injectable } from '@nestjs/common';
import { Knex, InjectKnex } from 'nestjs-knex';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthenticateService {
    constructor(
        @InjectKnex() private knex: Knex,
        private userService: UsersService,
        private jwt: JwtService
    ){}

    async findByEmail(email:string){
        const user = await this.knex.select(
            'users.role_id','users.id', 'users.password', 'users.email','users.name',
            'users.apellido_paterno',
            'role.permissions', 'role.name as role_name'
        ).table("users")
        .innerJoin('role','users.role_id', 'role.id')
        .where('users.email','=', email).andWhere('users.is_deleted','=', 0)
        return user
    }

    async findUser(users, password:string){
        for(let user of users){
            const isPassword = await this.userService.comparePassword(password,user.password)
            user.permissions = JSON.parse(user.permissions)
            if(isPassword) return user;
        }
        return undefined
    }

    generateJWT(payload){
        return this.jwt.sign(payload)
    }

    async lastLogin(userId:number){
        await this.knex.table("users").update({lastlogin:new Date()})
        .where({id: userId})
    }

}
