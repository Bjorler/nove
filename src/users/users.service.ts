import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as bcrypt from 'bcrypt';
import { UsersDto } from './DTO/users.dto';
import { METHOD, DOMAIN, PORT } from '../config';

@Injectable()
export class UsersService {
    constructor(
        @InjectKnex() private knex: Knex
    ){}
    
    async encrypt(password:string){
        const salt = 10;
        const hash = await bcrypt.hash(password, salt);
        return {hash, salt}
    }    

    async comparePassword(password:string, hash:string){
        const Match = await bcrypt.compare(password, hash);
        return Match;
    }

    async findByEmail(email:string){
        const exist = await this.knex.table("users").where({email}).andWhere({is_deleted:0})
        return exist;
    }

    async findById(id:number){
        const user = await this.knex.table('users').where({id}).andWhere({is_deleted:0});
        return user;
    }

    async create(user){
        delete user.role
        const newUser = await this.knex.table("users").insert(user);
        return newUser;
    }


    async findAll(limit:number, page:number){
        const offset = page == 1 ? 0 : (page-1)*limit
        const users = await this.knex.select(
            'lastlogin','name',"apellido_paterno",'apellido_materno','email', 'id', 'role_id'
        ).table("users").limit(limit).offset(offset).where({is_deleted:0})
        let result = [];
        for(let user of users){
            let info = new UsersDto();
            info.lastlogin = user.lastlogin;
            info.name = user.name;
            info.apellido_paterno = user.apellido_paterno;
            info.complete_name = `${user.name} ${user.apellido_paterno}`;
            info.email = user.email;
            info.download_img = `${METHOD}://${DOMAIN}:${PORT}/users/image/${user.id}`
            info.id = user.id
            info.role = user.role_id == 1 ? "Master":"Administrador";
            info.role_id = user.role_id
            result.push(info)
        }
        return result;
    }

    async pages(limit:number){
        const count = await this.knex.table("users").count("id",{as:'total'}).where({is_deleted:0})
        
        const total = count[0].total;
        //@ts-ignore
        let module = total % limit;
        //@ts-ignore
        let div = Math.floor(total/limit)
        let pages = div + ( module > 0 ? 1: 0 )
        return pages
    }

    async update(user_id:number, user){
        const updated = await this.knex.table('users').update(user).where({id:user_id});
        return updated;
    }

    async delete(user_id:number){
        const deleted = await this.knex.table('users').update({is_deleted:1})
        .where({id:user_id});
        return deleted ;
    }
}
