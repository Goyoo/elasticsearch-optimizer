'use strict';

var requester = require('./requester');

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
