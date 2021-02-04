const fs = require('fs');
const path = require("path");
let code = `
export const HOST = "localhost";
export const USER = "root";
export const PASSWORD = "";
export const DATABASE = "noveve";
export const SECRET = "0c7Op12o2L$n0v3vE"
export const METHOD = "http";
export const DOMAIN = "localhost";
export const PORT = 4057;
export const  USER_EMAIL = "";
export const PASSWORD_EMAIL = "";
`
fs.writeFile(path.join(__dirname,'../testing.ts'), code, ()=> {})
console.log("archivo creado en la ruta: "+path.join(__dirname,'../config.ts'))