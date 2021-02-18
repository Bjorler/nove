let axios = require('axios');
let { METHOD, DOMAIN } = require('../../dist/config');

const BASE = `${METHOD}://${DOMAIN}/prepare`

async  function main(){
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