'use strict';

const request = require('request');

module.exports.request = function(uri, callback)
{
    request({
        baseUrl: 'http://' + global.ES_HOST + ':' + global.ES_PORT + '/',
        json: true,
        timeout: 10 * 1000, // 10 sec
        uri: uri,
        method: 'GET',
    },
    function (error, response, body)
    {
        // todo: better error checking/handling
        callback(error, response, body);
    });
};
