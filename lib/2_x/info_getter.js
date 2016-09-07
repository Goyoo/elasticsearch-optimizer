'use strict';

var requester = require('../requester');

module.exports.getNodesStats = function (callback)
{
    requester.request('/_nodes/stats', function (error, response, body)
    {
        if (error)
            return helper.failAndExit(error);

        var nodesLength = 0;
        for (var node in body.nodes)
        {
            nodesLength++;
        }

        // snake_case for naming consistency reasons
        body.nodes_length = nodesLength;

        callback(body);
    });
};
