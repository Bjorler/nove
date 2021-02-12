import * as ExcelJS from 'exceljs';
/**
 * API Documentation
 * https://github.com/exceljs/exceljs#styles
 */
export class Excel{
    public workbook = new ExcelJS.Workbook();  
    async openExcel(path:string){
        await this.workbook.xlsx.readFile(path);
    }

    

    async getSheet(sheet:number){
        return await this.workbook.getWorksheet(sheet);
    }

    getRow(row:number, sheet){
        return sheet.getRow(row);
    }

    getCell(cell:number, row){
        return row.getCell(cell);
    }

    setValue(cell, val){
        cell.value = val;
    }

    saveChanges(row){
        row.commit()
    }
    async addImage(path:string, sheet, row:number, cell:number){

        let extension = path.split(".")
        let ext = extension[extension.length-1];

        const imageId = this.workbook.addImage({
            filename:path,
            extension:ext != 'png'? 'jpeg':'png'
        })


        sheet.addImage(imageId,{tl:{col:cell-1, row:row-1},ext: { width: 90, height: 17 }})
    }

    async writeFile(path:string){
        await this.workbook.xlsx.writeFile(path)
    }

    setColor(color:string, cell){
        cell.font = {
            color:{argb: color}
        }
    }
    center(cell){
        cell.alignment = { vertical: 'center', horizontal: 'center' };
    }
}