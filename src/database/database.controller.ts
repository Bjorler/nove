import { Controller, Get, Post, Put, Delete, Param, Query, Body,  UseInterceptors,
         HttpException, UploadedFile, HttpStatus, Response
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags} from '@nestjs/swagger';
import * as Excel from 'read-excel-file';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { User } from '../commons/decoratos/user.decorator';
import { DatabaseService } from './database.service';
import { LogServices } from '../commons/services/log.service';
import {  LogDto } from '../commons/DTO';
import { DatabaseCedulaDto } from './DTO/database-cedula.dto';
import { DatabaseResponseByCedulaDto } from './DTO/database-responsebycedula.dto';
import { DatabaseHistoricalDto } from './DTO/database-historical.dto';
import { DatabaseUploadDecorator, DataBaseLastUploadDecorator, DatabaseExcelDecorator,
DatabaseHistoricalDecorator, DatabaseSearchDecorator
} from './decorators';

@ApiTags("Database Upload")
@Controller('database')
export class DatabaseController {
    private TABLE_DATA_UPLOAD = "data_upload";
    private TABLE_LOAD_HISTORY = "load_history";
    constructor(
        private databaseService: DatabaseService,
        private logServices: LogServices
    ){}

    @Post()
    @DatabaseUploadDecorator()
    @UseInterceptors(FileInterceptor('file',{
        storage:diskStorage({
            destination:path.join(__dirname,'../excel'),//Si esta ruta presenta agun error remplazarla por ./images
            filename: async (req, file, callback)=>{
                fs.readdir(path.join(__dirname,'../excel'),(err, info)=>{
                    
                    for(let file of info){
                        fs.unlinkSync(path.join(__dirname,'../excel/',file))
                    }
                    const name = new Date().getTime()
                    callback(null, `${name}_${file.originalname}`)
                })
                
            }
        })/*,
        fileFilter:(req, file ,callback)=>{
            console.log(file)
            const authorized = new Set(["image/png","image/jpeg", 'image/gif'])
            if(authorized.has(file.mimetype)) return callback(null, true)
            callback( new HttpException("Only image are allowed jpg/png/gif",413), false)
        }*/
    }))
    async loadExcel(@UploadedFile() file, @User() session){
        
        if(!file) throw new HttpException("The file parameter is required",418)

        const response = await Excel(fs.readFileSync(file.path)).then(async (rows) => {
            
            const deleted = await this.databaseService.deleteHistorical(session);
            const data = await this.databaseService.parseExcel(rows, session);
            const saved = await this.databaseService.saveExcel(data);
            let historial:DatabaseHistoricalDto = { file_name: file.originalname, file_path: file.path, created_by:session.id }
            const deletedAll = await this.databaseService.deleteAll();    
            const saved_historical = await this.databaseService.saveHistorical(historial);
            const response = await this.databaseService.lastUpload();
            
            /** CREATE LOG DELETE FILES */
            let log = new LogDto();
            log.new_change = "delete";
            log.type = "delete";
            log.db_table = this.TABLE_LOAD_HISTORY;
            log.created_by = session.id;
            log.modified_by = session.id;
            log.element = deletedAll;
            await this.logServices.createLog(log)

            /** CREATE LOG UPLOAD FILE */
            log = new LogDto();
            log.new_change = "create";
            log.type = "create";
            log.db_table = this.TABLE_DATA_UPLOAD;
            log.created_by = session.id;
            log.modified_by = session.id;
            log.element = saved[0];
            await this.logServices.createLog(log)

            /** CREATE LOG SAVE HISTORICAL */
            log.db_table = this.TABLE_LOAD_HISTORY;
            log.element = saved_historical[0];
            await this.logServices.createLog(log);

            return response;
        }).catch((err)=>{
            return err;
        })
        return response
    }    

    @Get("/lastupload")
    @DataBaseLastUploadDecorator()
    async lastUpload(){
        const last = await this.databaseService.lastUpload();
        return last;
    }

    @Get("/excel")
    @DatabaseExcelDecorator()
    async downloadExcel( @Response() res){
        
        const existExcel = await this.databaseService.findLastElememt();
        if(!existExcel.length) throw new HttpException("EXCEL NOT FOUND", HttpStatus.NOT_FOUND);

        res.download(existExcel[0].file_path);

    }


    @Get("/historical")
    @DatabaseHistoricalDecorator()
    async getHistorical(){
        const historical = this.databaseService.findAllHistorical();
        return historical;
    }


    @Get("/:cedula")
    @DatabaseSearchDecorator()
    async findDoctorByCedula(@Param() cedula:DatabaseCedulaDto){
        
        const id = parseInt(cedula.cedula);
        if(isNaN(id)) throw new HttpException("Internal server error", 500)
        let info = [];
        const excel = await this.databaseService.findByCedula(id);
        if( !excel.length ){
            const internet = await this.databaseService.getProfessionalLicense(id);
            //@ts-ignore
            if(internet.error != "notValid"  ) info = [Object.assign(internet,{cedula:cedula.cedula,register_type:"internet"})] 
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
