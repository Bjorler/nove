import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, UseInterceptors,
         SetMetadata, UsePipes, HttpException
} from '@nestjs/common';
import { ApiTags, ApiHeader, ApiResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse,
         ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { TokenGuard, MasterGuard } from '../commons/guards';
import { ValidationPipe } from '../commons/validations/validations.pipe';
import { DatabaseService } from './database.service';
import { ErrorDto, UnauthorizedDto, ForbiddenDto, InternalServerErrrorDto } from '../commons/DTO';
import { DatabaseCedulaDto } from './DTO/database-cedula.dto';
import { DatabaseResponseByCedulaDto } from './DTO/database-responsebycedula.dto';

@ApiTags("Database Upload")
@Controller('database')
export class DatabaseController {

    constructor(
        private databaseService: DatabaseService
    ){}

    @Get("/:cedula")
    @SetMetadata('roles',["MASTER","ADMIN"])
    @SetMetadata('permission',['R'])
    @ApiHeader({
        name:"token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlX2lkIjoyLCJpZCI6MTUsInBhc3N3b3JkIjoiJDJiJDEwJGE0dmI4azBQMDllSHk1b0FrUzlmRGViNmc4M1NZaWtCTGNJYll1SDQwTm9JMnhoU1FXTW8yIiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJwZXJtaXNzaW9ucyI6eyJldmVudHMiOiJDIn0sImlhdCI6MTYxMTg2MTU4Nn0.KDX947q2WhlGlcZxtjUDZDh_vQ3HDPvxzuvShr-ptWo"
    })
    @ApiResponse({status:200, type:DatabaseResponseByCedulaDto})
    @ApiBadRequestResponse({type:ErrorDto})
    @ApiUnauthorizedResponse({type:UnauthorizedDto})
    @ApiForbiddenResponse({type:ForbiddenDto})
    @ApiInternalServerErrorResponse({type:InternalServerErrrorDto})  
    @UseGuards(TokenGuard, MasterGuard)
    @UsePipes(new ValidationPipe)
    async findDoctorByCedula(@Param() cedula:DatabaseCedulaDto){
        
        const id = parseInt(cedula.cedula);
        if(isNaN(id)) throw new HttpException("Internal server error", 500)
        let info = [];
        const excel = await this.databaseService.findByCedula(id);
        if( !excel.length ){
            const internet = await this.databaseService.getProfessionalLicense(id);
            //@ts-ignore
            if(internet.error != "notValid"  ) info = [Object.assign(internet,{register_type:"internet"})] 
        }else{ info = [Object.assign(excel[0],{register_type:"excel"})]}
        let response= new DatabaseResponseByCedulaDto()
        if(info.length){
            response.idengage = info[0].idengage;
            response.cedula = info[0].cedula;
            response.email = info[0].email;
            response.name = info[0].name;
            response.speciality = info[0].speciality;
            response.register_type = info[0].register_type;
        }
        return response;
    }
}
