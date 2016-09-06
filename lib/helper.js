'use strict';

var requester = require('./requester');

module.exports.getESVersion = function (callback)
{
    requester.request('/', function (error, response, body)
    {
        if (error)
            return callback(error);
        if (!body || !body.version || !body.version.number)
            return callback(new Error('Error while getting ES version number.'));

        var parsedNumber = body.version.number.split('.');

        callback(
            null,
            {
                major: parsedNumber[0],
                minor: parsedNumber[1],
                number: body.version.number,
            }
        );
    });
};

module.exports.failAndExit = function (error)
{
    if (error && error.message)
        console.error(error.message);
    else
        console.error('Something is wrong, exiting.');

    if (error && error.code)
        process.exit(error.code);

    process.exit(1);
};
