'use strict';

const requester = require('../requester');
const async = require('async');

module.exports.getNodes = callback =>
{
    async.parallel({
        infos: done =>
        {
            requester.request('/_nodes', (error, response, body) =>
            {
                if (error)
                    return helper.failAndExit(error);

                done(null, body);
            });
        },
        stats: done =>
        {
            requester.request('/_nodes/stats', (error, response, body) =>
            {
                if (error)
                    return helper.failAndExit(error);

                done(null, body);
            });
        }
    }, (error, res) =>
    {
        // There can't be an error here

        let nodes = [];
        for (let node in res.infos.nodes)
            nodes.push({
                stats: res.stats.nodes[node],
                infos: res.infos.nodes[node],
            });

        callback(nodes);
    });
};

module.exports.getClusterHealth = (callback) =>
{
    requester.request('/_cluster/health', (error, response, body) =>
    {
        if (error)
            return helper.failAndExit(error);

        callback(body);
    });
};
