'use strict';

const infoGetter = require('./info_getter');
const colors = require('colors');
const Table = require('cli-table');
const prettyBytes = require('pretty-bytes');
const moment = require('moment');
const async = require('async');

module.exports.start = version =>
{
    let nodes;

    async.series([
        done =>
        {
            infoGetter.getClusterHealth(health =>
            {
                console.log(
                    '\nHi, today we gonna test your %s ES cluster',
                    health.cluster_name.info
                );
                console.log(
                    'Your cluster status is %s and there are %s node(s) inside\n',
                    colors[health.status](health.status),
                    colors.info(health.number_of_nodes)
                );
                done();
            });
        },
        done =>
        {
            infoGetter.getNodes(res =>
            {
                nodes = res;
                done();
            });
        },
        done =>
        {
            let nodeNames = getNodeNames(nodes);

            let table = new Table({
                head: [ 'Infos'.info ].concat(nodeNames),
            });

            table.push(getUptimes(nodes));
            table.push(getVersions(nodes));

            table.push(getHeapSizeChecks(nodes));

            console.log(table.toString());

            done();
        }
    ],
    error =>
    {
        console.log('\nWe are done here.\n')
        process.exit(0);
    });
};

function getUptimes(nodes)
{
    let versions = [ 'Version' ];

    for (let i = 0; i < nodes.length; i++)
        versions.push(
            nodes[i].infos.version
        );

    return versions;
}

function getVersions(nodes)
{
    let uptimes = [ 'Uptime' ];

    for (let i = 0; i < nodes.length; i++)
        uptimes.push(
            moment.duration(
                nodes[i].stats.jvm.uptime_in_millis
            ).humanize()
        );

    return uptimes;
}

function getNodeNames(nodes)
{
    let nodeNames = [];

    for (let i = 0; i < nodes.length; i++)
        nodeNames.push(nodes[i].stats.name.info);

    return nodeNames;
}

function getHeapSizeChecks(nodes)
{
    let output = [ 'Heap Size init / max' ];

    for (let i = 0; i < nodes.length; i++)
    {
        let init = nodes[i].infos.jvm.mem.heap_init_in_bytes;
        let max = nodes[i].infos.jvm.mem.heap_max_in_bytes;
        let str = prettyBytes(init) + ' / ' + prettyBytes(max);

        if (init >= max)
            output.push(str.checkOk);
        else
            output.push(str.checkCritical);
    }

    return output;
}