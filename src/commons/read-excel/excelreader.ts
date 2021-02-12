import * as Excel from 'read-excel-file';
import * as fs from 'fs';
/**
 * Api Documentation
 * https://www.npmjs.com/package/read-excel-file
 */
export class ExcelReader{
    open(path:string){
        return new Promise((resolve, reject)=>{
            Excel(fs.readFileSync(path)).then( rows => resolve(rows)).catch( err => reject(err))
        })
    }
}