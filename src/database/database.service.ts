import { Injectable, HttpService } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as moment from 'moment';
import * as _ from 'underscore';
import * as FormData from 'form-data';
import { AttendessService } from '../attendess/attendess.service';
import { DatabaseInfoDto } from './DTO/database-info.dto';
import { DatabaseLastUploadDto } from './DTO/database-lastloading.dto';
import {  METHOD, DOMAIN } from '../config';


@Injectable()
export class DatabaseService {

    private TABLE = "data_upload";
    private ENUMCEDULA = {
      cedula_2:"speciality",
      cedula_3: "speciality_2",
      cedula:"Médico General"
    }

    constructor(
      @InjectKnex() private knex: Knex,
      private httpService: HttpService,
      private attendeesService: AttendessService
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

    private findSpeciality(data, cedula){
      let speciality = "Médico General";
      
      for(let key in data){
        if(key == 'cedula' || key == 'cedula_2' || key == 'cedula_3' ){
          if( data[key] == cedula ){
            speciality = data[this.ENUMCEDULA[key]] || this.ENUMCEDULA['cedula']
          }
        }
      }
      return speciality;
    }

    private parseDataExcel(data, cedula){
      data = data[0];
      
      let info = [{
        complete_name:data.name,
        name:data.firstname,
        lastname:data.lastname, 
        speciality:this.findSpeciality(data,cedula),
        email:data.email, 
        idengage:data.idengage,
        cedula,
        register_type:"excel",
        attendees_id:0
      }]
      return info;
    }

    async findDoctorByCedula(cedula:number, event_id:number){
      
      let info = [
        {
          complete_name:"",
          name:"",
          lastname:"", 
          speciality:"",
          email:"", 
          idengage:"",
          cedula:cedula,
          register_type:"registered",
          attendees_id:0
      }
      ];

      const attendees = await this.attendeesService.findByCedula(cedula,event_id);
      
      
      let excel = []
      if(!attendees.length){
        excel = await this.findByCedula(cedula);
        if(excel.length) info = this.parseDataExcel(excel, cedula);
      }
      
      if( !excel.length && !attendees.length ){
        let result = await this.getProfesionalLicensePrototype(cedula);
        
        if(result) info = [result];

      }
      if(attendees.length) { 
        info[0] = {
          complete_name:attendees[0].name,
          name:attendees[0].firstname,
          lastname:attendees[0].lastname, 
          speciality:attendees[0].speciality,
          email:attendees[0].email, 
          idengage:attendees[0].idengage,
          cedula:cedula,
          register_type:"attendees",
          attendees_id: attendees[0].id
      }
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
      if(result.items && result.items.length ){
        let data = result.items[0];
        
        return {complete_name:`${data.nombre} ${data.paterno} ${data.materno}`,
        name:data.nombre,
        lastname:`${data.paterno} ${data.materno}`, 
        speciality:data.titulo, email:'', idengage:'',
        cedula:parseInt(data.idCedula),
        register_type:"internet",
        attendees_id:0
        }
      }else{ result = undefined }
      return result;
    
    }

    private requestSep(cedula:number){
      

      return new Promise((resolve, reject) => {
        
        let formData = new FormData();
        formData.append("json",`{"maxResult":"1000","nombre":"","paterno":"","materno":"","idCedula":"${cedula}"}`)
        
        let header = formData.getHeaders()
        
        this.httpService.post('https://www.cedulaprofesional.sep.gob.mx/cedula/buscaCedulaJson.action',
        formData,{headers:header,responseType:'arraybuffer'})
        .toPromise().then(e => { resolve(JSON.parse(e.data.toString('latin1'))) })
        .catch(err => reject(err)) 
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
      if( !email ) return false
      return re.test(email.trim().toLowerCase());
    }
    private relationExist(dependence, dependent){
      
      if( ( typeof dependence == 'number' ) == dependent )return true;
      if( !( typeof dependence == 'number' ) == !dependent ) return true;
      if( dependent ) return true;

      return false;
    }

    private excelValidations(row){
      const isBrandEmpty = this.isEmpty;
      const isIdEngageEmpty = this.isEmpty;
      const isNameEmpty = this.isEmpty;
      const isLastNameEmpty = this.isEmpty;
      const isCedulaNumber = this.isNumber;
      const isEmail = this.isEmail;
      const isEspecialityEmpty = this.isEmpty;
      const isSpeciality1RelationExist = this.relationExist;
      const isSpeciality2RelationExist = this.relationExist;
      const LicenseNumber = row['License Number']//row[4];
      const SpecialtyLicense1 = row['Specialty License 1']//[5];
      const SpecialtyLicense2 = row['Specialty License 2']//[6];
      let result = { guard: true, errors:[] };
      if(isBrandEmpty(row['Therapy Area']/*[0]*/)){
        result.guard = false,
        result.errors.push({
          message: "Therapy Area must be not empty",
          number:1
        })
      }
      if(isIdEngageEmpty(row["IMS ID"]/*[1]*/)){
        result.guard = false;
        result.errors.push({
          message:"IMS ID must be not empty",
          number:2
        })
      }
      if(isNameEmpty(row['First Name']/*[2]*/)){
        result.guard = false;
        result.errors.push({
          message:"First Name must be not empty",
          number:3
        })
      }
      if(isLastNameEmpty(row['Last Name']/*[3]*/)){
        result.guard = false;
        result.errors.push({
          message:"Last Name must be not empty",
          number:4
        })
      }
      
      if(!isEmail(row['E-Mail']/*[7]*/)){
        result.guard = false;
        result.errors.push({
          message:"E-Mail must an email",
          number:5
        })
      }
      if(!isSpeciality1RelationExist(row['Specialty License 1']/*[5]*/, row['Specialty']/*[8]*/)){
        result.guard = false;
        result.errors.push({
          message:"The Specialty License 1 field and the Specialty field are dependent",
          number:6
        })
      }
      if(!isSpeciality2RelationExist(row['Specialty License 2']/*[6]*/, row['Specialty 2']/*[9]*/)){
        result.guard = false;
        result.errors.push({
          message:"The Specialty License 2 field and the Specialty 2 field are dependent",
          number:7
        })
      }
      
      if(!( typeof LicenseNumber == 'number' )){
        result.guard = false;
        result.errors.push({
          message:"License Number must be not empty",
          number:8
        })
      }

      if(!( typeof LicenseNumber == 'number' ) && !( typeof SpecialtyLicense1 == 'number' ) && !( typeof SpecialtyLicense2 == 'number' ) ){
        result.guard = false;
        result.errors.push({
          message:"Please enter at least one of the following fields License Number, Specialty License 1, Specialty License 2",
          number:9
        })
      }
      if( typeof LicenseNumber == 'string' && LicenseNumber != '-'  ){
        result.guard = false;
        result.errors.push({
          message:"License Number must be a number",
          number:10
        })
      }
      if( typeof SpecialtyLicense1 == 'string' && SpecialtyLicense1 != '-' ){
        result.guard = false;
        result.errors.push({
          message:"Specialty License 1 must be a number",
          number:11
        })
      }
      if( typeof SpecialtyLicense2 == 'string' && SpecialtyLicense2 != '-' ){
        result.guard = false;
        result.errors.push({
          message:"Specialty License 2 must be a number",
          number:12
        })
      }
      return result;
    }

    async parseExcel(excel, session){
      let isHeader = true;
      let result = [];
      let errors = [];
      let count = 1
      const isEspecialityEmpty = this.isEmpty;
      for(let row of excel){
        
        //if(!isHeader){
          let info = new DatabaseInfoDto();
          let validations = this.excelValidations(row);
          
          if( validations.guard ){
            
            info.idengage = row["IMS ID"]//[1];
            info.cedula = row['License Number']//[4];
            if(row['Specialty License 1']/*[5]*/ && row['Specialty License 1']/*[5]*/ != '-' )info.cedula_2 = row['Specialty License 1']/*[5]*/;
            if(row['Specialty License 2']/*[6]*/ && row['Specialty License 2']/*[6]*/ != '-' )info.cedula_3 = row['Specialty License 2']/*[6]*/;
            info.name = `${row['First Name']/*[2]*/} ${row['Last Name']/*[3]*/}`;
            info.firstname = row['First Name']/*[2]*/;
            info.lastname = row['Last Name']/*[3]*/;
            info.speciality = row['Specialty']/*[8]*/;
            if(!isEspecialityEmpty(row['Specialty 2']/*[9]*/))info.speciality_2 = row['Specialty 2']/*[9]*/
            info.email = row['E-Mail']/*[7]*/;
            info.created_by = session.id;
            info.brand = row['Therapy Area']/*[0]*/;
            result.push(info)
          }else{
            let error = {
              row:count,
              "TherapyArea":row['Therapy Area']/*[0]*/,
              "IMSID":row["IMS ID"]/*[1]*/,
              "FirstName":row['First Name']/*[2]*/,
              "LastName":row['Last Name']/*[3]*/,
              "LicenseNumber":row['License Number']/*[4]*/,
              "SpecialtyLicense1":row['Specialty License 1']/*[5]*/,
              "SpecialtyLicense2":row['Specialty License 2']/*[6]*/,
              "EMail":row['E-Mail']/*[7]*/,
              "Specialty":row['Specialty']/*[8]*/,
              "Specialty2":row['Specialty 2']/*[9]*/,
              errors: validations.errors
            }
            errors.push(error);
          }
        //}else{ isHeader = false; }
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
