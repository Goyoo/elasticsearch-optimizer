'use strict';

var infoGetter = require('./info_getter');
var colors = require('colors');
var Table = require('cli-table');
var prettyBytes = require('pretty-bytes');
var moment = require('moment');

module.exports.start = function (version)
{
    console.log(
        '\nHi, today we gonna test your ES %s instance(s)',
        version.number.info
    );

    infoGetter.getNodesStats(function (stats)
    {
        console.log(
            'Your cluster %s is composed of %s nodes\n',
            stats.cluster_name.info,
            colors.info(stats.nodes_length)
        );

        var nodeNames = getNodeNames(stats);

        var table = new Table({
            head: nodeNames,
        });

        table.push(getUptime(stats));

        table.push(getHeapSizeChecks(stats));

        console.log(table.toString());
        console.log();
    });
};

function getUptime(stats)
{
    var uptimes = [ 'Uptime' ];

    for (var node in stats.nodes)
        uptimes.push(moment.duration(stats.nodes[node].jvm.uptime_in_millis).humanize().info);

    return uptimes
}

function getNodeNames(stats)
{
    var nodeNames = [ '' ];

    for (var node in stats.nodes)
        nodeNames.push(stats.nodes[node].name.info);

    return nodeNames;
}

function getHeapSizeChecks(stats)
{
    var output = [ 'Heap Size current / max' ];

    var current, max, str;
    for (var node in stats.nodes)
    {
        current = stats.nodes[node].jvm.mem.heap_committed_in_bytes;
        max = stats.nodes[node].jvm.mem.heap_max_in_bytes;
        str = prettyBytes(current) + ' / ' + prettyBytes(max);

        if (current === max)
            output.push(str.checkOk);
        else
            output.push(str.checkCritical);
    }

    return output;
}