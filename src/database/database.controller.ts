import { Controller, Get, Post, Put, Delete, Param, Query, Body,  UseInterceptors,
         HttpException, UploadedFile, HttpStatus, Response
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ExcelReader } from '../commons/read-excel/excelreader';
import { User } from '../commons/decoratos/user.decorator';
import { DatabaseService } from './database.service';
import { LogServices } from '../commons/services/log.service';
import {  LogDto } from '../commons/DTO';
import { DatabaseCedulaDto } from './DTO/database-cedula.dto';
import { DatabaseResponseByCedulaDto } from './DTO/database-responsebycedula.dto';
import { DatabaseHistoricalDto } from './DTO/database-historical.dto';
import { DatabaseUploadDto } from './DTO/database-upload.dto';
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

        let excelReader = new ExcelReader();
        const rows = await excelReader.open(file.path);
        const deleted = await this.databaseService.deleteHistorical(session);
        const { result:data, errors } = await this.databaseService.parseExcel(rows, session);
        
        const saved = await this.databaseService.saveExcel(data);

        let res = new DatabaseUploadDto();
        if(saved){
            let historial:DatabaseHistoricalDto = { file_name: file.originalname, file_path: file.path, created_by:session.id }
            const deletedAll = await this.databaseService.deleteAll();    
            const saved_historical = await this.databaseService.saveHistorical(historial);
            let response = await this.databaseService.lastUpload();
            
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
            
            res.response = response;
            res.errors = errors;
        }
        if(!saved) throw new HttpException("Wrong file format checks the data.",420);

        

        return res;
        
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
        
        let response= new DatabaseResponseByCedulaDto()
        response = await this.databaseService.findDoctorByCedula(id)
        
        return response;
    }
}
