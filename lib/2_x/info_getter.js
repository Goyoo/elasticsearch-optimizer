'use strict';

var requester = require('../requester');
var async = require('async');

module.exports.getNodes = function (callback)
{
    async.parallel({
        infos: function (done)
        {
            requester.request('/_nodes', function (error, response, body)
            {
                if (error)
                    return helper.failAndExit(error);

                done(null, body);
            });
        },
        stats: function (done)
        {
            requester.request('/_nodes/stats', function (error, response, body)
            {
                if (error)
                    return helper.failAndExit(error);

                done(null, body);
            });
        }
    }, function (error, res)
    {
        // There can't be an error here

        var nodes = [];
        for (var node in res.infos.nodes)
            nodes.push({
                stats: res.stats.nodes[node],
                infos: res.infos.nodes[node],
            });

        callback(nodes);
    });
};

module.exports.getClusterHealth = function (callback)
{
    requester.request('/_cluster/health', function (error, response, body)
    {
        if (error)
            return helper.failAndExit(error);

        callback(body);
    });
};
