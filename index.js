'use strict';

const program = require('commander');
const validator = require('validator');
const helper = require('./lib/helper');
 
program
    .version('0.0.1')
    .usage('[options] <host> <port>')
    .parse(process.argv)
;

/*
 * Host and port sanitizing
 */
let host = '127.0.0.1';
if (program.args[0])
{
    // if (!validator.isIP(program.args[0]))
    //     return console.error('<host> should be a valid IP address.')
    host = program.args[0];
}

let port = 9200;
if (program.args[1])
{
    if (!validator.isInt(program.args[1], { min: 0, max: 0xFFFF }))
        return console.error('<port> should be a valid port number.')
    
    port = program.args[1];
}

global.ES_HOST = host;
global.ES_PORT = port;

/*
 * ES version support checks
 */
helper.getESVersion((error, version) =>
{
    if (error)
        return helper.failAndExit(error);
    if (2 != version.major)
        return helper.failAndExit(new Error('This module only supports ES 2.x.'));

    require('./lib/2_x').start(version);
});