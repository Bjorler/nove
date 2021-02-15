import { Injectable, HttpService } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment';
import * as _ from 'underscore';
import { DatabaseInfoDto } from './DTO/database-info.dto';
import { DatabaseLastUploadDto } from './DTO/database-lastloading.dto';
import { PORT, METHOD, DOMAIN } from '../config';

import * as request from 'request';

@Injectable()
export class DatabaseService {

    private TABLE = "data_upload";
    private SPECIALITIES = {
      7654321:"Clínicas",
      9999992:"Quirúrgicas",
      1111999:"Médico-quirúrgicas"
    }

    constructor(
      @InjectKnex() private knex: Knex,
      private httpService: HttpService
    ){}


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
          
          resolve({name, speciality:'', email, idengage:''});
        } else {
          resolve({error: "notValid"});
        }
      });
    }  

    private parseDataExcel(data, cedula){
      data = data[0];
      let info = [{
        complete_name:data.name,
        name:data.firstname,
        lastname:data.lastname, 
        speciality:data.speciality || data.speciality_2,
        email:data.email, 
        idengage:data.idengage,
        cedula,
        register_type:"excel"
      }]
      return info;
    }

    async  findDoctorByCedula(cedula:number){
      
      let info = [
        {
          complete_name:"",
          name:"",
          lastname:"", 
          speciality:"",
          email:"", 
          idengage:"",
          cedula:cedula,
          register_type:""
      }
      ];
      
      const excel = await this.findByCedula(cedula);

      if( !excel.length ){
        let result = await this.getProfesionalLicensePrototype(cedula);
       
        if(result) info = [result];

      }else{ 
        info = this.parseDataExcel(excel, cedula);
      }
      return info[0];
    }

    async findByCedula(cedula:number){
      const cedulaExist = await this.knex.table(this.TABLE).where( (builder) => {
        builder.where("cedula",'=', cedula).orWhere('cedula_2','=', cedula).orWhere('cedula_3','=', cedula);
      })
      .andWhere({is_deleted:0});

      
      return cedulaExist;
    }


  
    async getProfesionalLicensePrototype(cedula:number){
      let TOTAL_REQUEST = 3;
      let result = undefined;
      while(TOTAL_REQUEST > 0){
        try{
          result = await this.requestSep(cedula)
          
          if(result.items) break;
        }catch(err){
          console.log(err)
        }
        TOTAL_REQUEST--;
      }
      
      if(result.items){
        let data = result.items[0];
        return {complete_name:`${data.nombre} ${data.paterno} ${data.materno}`,
        name:data.nombre,
        lastname:`${data.paterno} ${data.materno}`, 
        speciality:'', email:'', idengage:'',
        cedula:parseInt(data.idCedula),
        register_type:"internet"
        }
      }
      return result;
    
    }

    private requestSep(cedula:number){
      return new Promise((resolve, reject) => {
        let requestOptions = {
          method: 'POST',
          url: 'https://www.cedulaprofesional.sep.gob.mx/cedula/buscaCedulaJson.action',
          headers: {
            'content-type': 'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
          },
          formData: {
            json: '{"maxResult":"1000","nombre":"","paterno":"","materno":"","idCedula":"'+cedula+'"}'
          }
        };
  
        request(requestOptions, (error, res, body) => {
          if(error) return reject(error);
          return resolve(JSON.parse(body));
        })
      })
    }

    async deleteHistorical(session){
      const deleted = await this.knex.table(this.TABLE).update({is_deleted:1, modified_by:session.id});
      return deleted;
    }

    async saveExcel(dataParsed){
      const save = await this.knex.table(this.TABLE).insert(dataParsed);
      return save;
    }


    private isEmpty(value){
      return !value || !isNaN(value); 
    }
    private isNumber(value){
      return !isNaN(value);
    }
    private isEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    async parseExcel(excel, session){
      let isHeader = true;
      let result = [];
      let errors = [];
      
      const isBrandEmpty = this.isEmpty;
      const isIdEngageEmpty = this.isEmpty;
      const isNameEmpty = this.isEmpty;
      const isLastNameEmpty = this.isEmpty;
      const isCedulaNumber = this.isNumber;
      const isEmail = this.isEmail;
      const isEspecialityEmpty = this.isEmpty;
      
      let count = 1
      for(let row of excel){

        if(!isHeader){
          let info = new DatabaseInfoDto();
          if( !isBrandEmpty(row[0]) && !isIdEngageEmpty(row[1]) && !isNameEmpty(row[2]) 
          && !isLastNameEmpty(row[3])
          && isCedulaNumber(row[4]) && isEmail(row[7]) && ( !isEspecialityEmpty(row[8]) 
          || !isEspecialityEmpty(row[9]) ) ){
            
            info.idengage = row[1];
            info.cedula = row[4];
            if(row[5] && row[5] != '-' )info.cedula_2 = row[5];
            if(row[6] && row[6] != '-' )info.cedula_3 = row[6];
            info.name = `${row[2]} ${row[3]}`;
            info.firstname = row[2];
            info.lastname = row[3];
            info.speciality = row[8];
            if(!isEspecialityEmpty(row[9]))info.speciality_2 = row[9]
            info.email = row[7];
            info.created_by = session.id;
            info.brand = row[0];
            result.push(info)
          }else{
            let error = {
              row:count,
              "TherapyArea":row[0],
              "IMSID":row[1],
              "FirstName":row[2],
              "LastName":row[3],
              "LicenseNumber":row[4],
              "SpecialtyLicense1":row[5],
              "SpecialtyLicense2":row[6],
              "EMail":row[7],
              "Specialty":row[8],
              "Specialty2":row[9]
            }
            errors.push(error);
          }
        }else{ isHeader = false; }
        count++;
      }

      return {result, errors};
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
        result.created_on = moment(last[0].created_on).format("DD/MM/YYYY");
        result.download_file = `${METHOD}://${DOMAIN}/database/excel/`
      }

      return result;

    }

    private translateMonth(month){
      let months = {
        "January":"Enero",
        "February":"Febrero",
        "March":"Marzo",
        "April":"Abril",
        "May":"Mayo",
        "June":"Junio",
        "July":"Julio",
        "August":"Agosto",
        "September":"Septiembre",
        "October":"Octubre",
        "November":"Noviembre",
        "December":"Diciembre"
      }
      return months[month]
    }

    private translateDay(day){
      let days = {
        "Monday":"Lunes",
        "Tuesday":"Martes",
        "Wednesday":"Miercoles",
        "Thursday":"Jueves",
        "Friday":"Viernes",
        "Saturday":"Sabado",
        "Sunday":"Domingo"
      }
      return days[day]
    }

    private isToday(date, month){
      if(moment(date).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD") ){
        return "Hoy";
      }else{
        return `${this.translateDay(moment(date).format("dddd"))}, ${parseInt(moment(date).format("DD"))} de ${month}`
      }
    }

    async findAllHistorical(){
      const CURRENT_YEAR = moment(`${new Date().getFullYear()}`).format("YYYY-MM-DD") 
      const historical = await this.knex.table('load_history')
      .select('created_on as date','id','file_name')
      .where('created_on', '>=', CURRENT_YEAR).orderBy('created_on', 'desc');
      
      let groupByMonth = _.groupBy(historical,(e) => this.translateMonth(moment(e.date).format("MMMM"))  );
      let result = {}
      for(let month in groupByMonth){
        
        const groupByDay = _.groupBy(groupByMonth[month],(e)=> this.isToday(e.date, month) )
        
        result[month] = groupByDay
      }

      for(let month in result){
        for( let day in result[month] ){
          for(let item of result[month][day]){
            item['time'] = moment(item.date).format("hh:mm")
            item['date'] = moment(item.date).format("YYYY-MM-DD")
            
          }
        }
      }

      return result;
    }

}
