import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectKnex, Knex } from 'nestjs-knex';

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
}
