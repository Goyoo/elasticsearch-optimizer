'use strict';

const requester = require('./requester');
const colors = require('colors');
    colors.setTheme({
        input: 'grey',
        verbose: 'cyan',
        prompt: 'grey',
        info: 'cyan',
        data: 'grey',
        help: 'cyan',
        warn: 'yellow',
        debug: 'blue',
        error: 'red',

        checkOk: 'green',
        checkWarning: 'yellow',
        checkCritical: 'red',
    });

module.exports.getESVersion = (callback) =>
{
    requester.request('/', (error, response, body) =>
    {
        if (error)
            return callback(error);
        if (!body || !body.version || !body.version.number)
            return callback(new Error('Error while getting ES version number.'));

        let parsedNumber = body.version.number.split('.');

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

module.exports.failAndExit = (error) =>
{
    if (error && error.message)
        console.error(error.message);
    else
        console.error('Something is wrong, exiting.');

    if (error && error.code)
        process.exit(error.code);

    process.exit(1);
};
