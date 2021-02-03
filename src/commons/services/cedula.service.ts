import { Injectable } from '@nestjs/common';

@Injectable()
export class CedulaService {

    getProfessionalLicense =  (license, page) => {
        return new Promise(async (resolve,reject) => {
          await page.goto('https://cedula.buholegal.com/' + license + '/');
          const existeClase = await page.$('#contenedormedio > div > div > div.container.mt-3')
          
          if(existeClase) {
            const name_raw = await page.waitForXPath('//*[@id="contenedormedio"]/div/div/div[2]/div/div[2]/div/div/div/div[1]/h3');
            const name= await page.evaluate(name_raw => name_raw.textContent, name_raw);
            

            const carrera_raw = await page.waitForXPath('//*[@id="contenedormedio"]/div/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div[1]/table/tbody/tr[2]/td[2]')
            const carrera= await page.evaluate(carrera_raw => carrera_raw.textContent, carrera_raw);

            const email_raw = await page.waitForXPath('//*[@id="contenedormedio"]/div/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div[2]/table/tbody/tr[2]/td[2]')
            const email = await page.evaluate(email_raw => email_raw.textContent, email_raw);
            
            resolve({name, carrera, email});
          } else {
            reject({error: "notValid"});
          }
        });
      }
}
