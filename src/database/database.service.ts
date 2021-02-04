import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment';
import { DatabaseInfoDto } from './DTO/database-info.dto';
import { DatabaseLastUploadDto } from './DTO/database-lastloading.dto';
import { PORT, METHOD, DOMAIN } from '../config';

@Injectable()
export class DatabaseService {

    private TABLE = "data_upload";

    constructor(
      @InjectKnex() private knex: Knex
    ){}

    async findByCedula(cedula:number){
      const cedulaExist = await this.knex.table(this.TABLE).where({cedula}).andWhere({is_deleted:0});
      return cedulaExist;
    }


    getProfessionalLicense(license){
        return new Promise(async (resolve,reject) => {
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            devtools: false
        });
        let page = await browser.newPage();
          await page.goto('https://cedula.buholegal.com/' + license + '/');
          const existeClase = await page.$('#contenedormedio > div > div > div.container.mt-3')
          
          if(existeClase) {
            const name_raw = await page.waitForXPath('//*[@id="contenedormedio"]/div/div/div[2]/div/div[2]/div/div/div/div[1]/h3');
            const name= await page.evaluate(name_raw => name_raw.textContent, name_raw);
            

            const carrera_raw = await page.waitForXPath('//*[@id="contenedormedio"]/div/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div[1]/table/tbody/tr[2]/td[2]')
            const carrera= await page.evaluate(carrera_raw => carrera_raw.textContent, carrera_raw);

            const email_raw = await page.waitForXPath('//*[@id="contenedormedio"]/div/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div[2]/table/tbody/tr[2]/td[2]')
            const email = await page.evaluate(email_raw => email_raw.textContent, email_raw);
            
            resolve({name, speciality:carrera, email, idengage:''});
          } else {
            resolve({error: "notValid"});
          }
        });
    }

    async deleteHistorical(session){
      const deleted = await this.knex.table(this.TABLE).update({is_deleted:1, modified_by:session.id});
      return deleted;
    }

    async saveExcel(dataParsed){
      const save = await this.knex.table(this.TABLE).insert(dataParsed);
      return save;
    }

    async parseExcel(excel, session){
      let isHeader = true;
      let result = []
      
      for(let row of excel){
        if(!isHeader){
          let info = new DatabaseInfoDto();
          info.idengage = row[0];
          info.cedula = row[1];
          info.name = row[2];
          info.speciality = row[3];
          info.email = row[4];
          info.created_by = session.id;
          result.push(info)
        }else{ isHeader = false; }
      }

      return result;
    }

    async findAll(){
      const result = await this.knex.table("load_history");
      return result;
    }

    async findById(id:number){
      const result = await this.knex.table("load_history").where({id}).andWhere({is_deleted:0})
      return result;
    }

    async findLastElememt(){
      const result = await this.knex.table("load_history").andWhere({is_deleted:0})
      return result;
    }

    async deleteAll(){
      const deleted = await this.knex.table("load_history").update({is_deleted:1}).where({is_deleted:0})
      return deleted;
    }

    async saveHistorical(historical){
      const saved = await this.knex.table("load_history").insert(historical);
      return saved;
    }

    async lastUpload(){
      const last = await this.knex.table("load_history").where({is_deleted:0});
      let result = new DatabaseLastUploadDto();
      if(last.length){
        result.id = last[0].id;
        result.file_name = last[0].file_name;
        result.created_on = moment(last[0].created_on).format("DD-MM-YYYY");
        result.download_file = `${METHOD}://${DOMAIN}:${PORT}/database/excel/${last[0].id}`
      }

      return result;

    }

}
