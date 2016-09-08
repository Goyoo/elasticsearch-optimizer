'use strict';

var infoGetter = require('./info_getter');
var colors = require('colors');
var Table = require('cli-table');
var prettyBytes = require('pretty-bytes');
var moment = require('moment');
var async = require('async');

module.exports.start = function (version)
{
    var nodes;

    async.series([
        function (done)
        {
            infoGetter.getClusterHealth(function (health)
            {
                console.log(
                    '\nHi, today we gonna test your %s ES cluster',
                    health.cluster_name
                );
                console.log(
                    'Your cluster status is %s and there are %s node(s) inside\n',
                    colors[health.status](health.status),
                    colors.info(health.number_of_nodes)
                );
                done();
            });
        },
        function (done)
        {
            infoGetter.getNodes(function (res)
            {
                nodes = res;
                done();
            });
        },
        function (done)
        {
            var nodeNames = getNodeNames(nodes);

            var table = new Table({
                head: [ 'Infos'.info ].concat(nodeNames),
            });

            table.push(getUptimes(nodes));
            table.push(getVersions(nodes));

            table.push(getHeapSizeChecks(nodes));

            console.log(table.toString());

            done();
        }
    ],
    function (error)
    {
        console.log('\nWe are done here.\n')
        process.exit(0);
    });
};

function getUptimes(nodes)
{
    var versions = [ 'Version' ];

    for (var i = 0; i < nodes.length; i++)
        versions.push(
            nodes[i].infos.version
        );

    return versions;
}

function getVersions(nodes)
{
    var uptimes = [ 'Uptime' ];

    for (var i = 0; i < nodes.length; i++)
        uptimes.push(
            moment.duration(
                nodes[i].stats.jvm.uptime_in_millis
            ).humanize()
        );

    return uptimes;
}

function getNodeNames(nodes)
{
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++)
        nodeNames.push(nodes[i].stats.name.info);

    return nodeNames;
}

function getHeapSizeChecks(nodes)
{
    var output = [ 'Heap Size init / max' ];

    var init, max, str;
    for (var i = 0; i < nodes.length; i++)
    {
        init = nodes[i].infos.jvm.mem.heap_init_in_bytes;
        max = nodes[i].infos.jvm.mem.heap_max_in_bytes;
        str = prettyBytes(init) + ' / ' + prettyBytes(max);

        if (init >= max)
            output.push(str.checkOk);
        else
            output.push(str.checkCritical);
    }

    return output;
}