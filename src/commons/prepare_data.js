let axios = require('axios');
let { METHOD, DOMAIN } = require('../../dist/config');

const BASE = `${METHOD}://${DOMAIN}/prepare`

async  function main(){
    console.log(`
    ##############################################################
         We are working hard to offer you the best experience
                      We will take a few minutes
    ##############################################################
    `)
    let PREPARE_DATA = await axios.get(`${BASE}/create-data`)
    let PREPARE_USERS = await axios.get(`${BASE}/users`)
    let PREPARE_EVENTS = await axios.get(`${BASE}/events`)
    let PREPARE_ATTENDEES = await axios.get(`${BASE}/attendees`)
    let PREPARE_SIGN = await axios.get(`${BASE}/sign`)
    console.log(`
    ##############################################################
                           Prepared environment
    ##############################################################
    `)
}
main();