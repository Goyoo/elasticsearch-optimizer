'use strict';

const request = require('request');

module.exports.request = (uri, callback) =>
{
    request({
        baseUrl: `http://${global.ES_HOST}:${global.ES_PORT}/`,
        json: true,
        timeout: 10 * 1000, // 10 sec
        method: 'GET',
        uri,
    },
    (error, response, body) =>
    {
        // todo: better error checking/handling
        callback(error, response, body);
    });
};
