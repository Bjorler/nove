import * as Excel from 'read-excel-file';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
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
    open2(path:string){
        const result  = XLSX.readFile(path);
        const sheet = result.SheetNames
        return XLSX.utils.sheet_to_json(result.Sheets[sheet[0]])
    }
}