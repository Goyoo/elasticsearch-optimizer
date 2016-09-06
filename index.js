'use strict';

var program = require('commander');
var validator = require('validator');
 
program
    .version('0.0.1')
    .usage('[options] <host> <port>')
    .parse(process.argv);
 
var host = '127.0.0.1';
if (program.args[0])
{
    // if (!validator.isIP(program.args[0]))
    //     return console.error('<host> should be a valid IP address.')
    host = program.args[0];
}

var port = 9200;
if (program.args[1])
{
    if (!validator.isInt(program.args[1], { min: 0, max: 0xFFFF }))
        return console.error('<port> should be a valid port number.')
    
    port = program.args[1];
}

console.log('ES is running on %s:%s', host, port);
