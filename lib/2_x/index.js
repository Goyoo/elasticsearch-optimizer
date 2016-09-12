'use strict';

const infoGetter = require('./info_getter');
const colors = require('colors');
const Table = require('cli-table');
const humanize = require('humanize');
const moment = require('moment');
const async = require('async');

module.exports.start = (version) => {
    let nodes;

    async.series([
        (done) => {
            infoGetter.getClusterHealth((health) => {
                console.log(`\nHi, today we gonna test your ${health.cluster_name.info} ES cluster`);

                console.log(`Your cluster status is ${colors[health.status](health.status)} and there are ${colors.info(health.number_of_nodes)} node(s) inside\n`);

                done();
            });
        },
        (done) => {
            infoGetter.getNodes((res) => {
                nodes = res;
                done();
            });
        },
        (done) => {
            const nodeNames = getNodeNames(nodes);

            let table = new Table({
                head: [ 'Node name'.white, ...nodeNames],
            });

            table.push(getUptimes(nodes));
            table.push(getVersions(nodes));

            table.push(getMaxFileDescriptors(nodes));
            table.push(checkMemoryIsLocked(nodes));
            table.push(checkMulticastDisabled(nodes));

            table.push(getHeapSizeChecks(nodes));

            console.log(table.toString());

            done();
        }
    ],
    (error) => {
        console.log('\nWe are done here.\n')
        process.exit(0);
    });
};

function getNodeNames(nodes) {
    let rowCells = [];

    for (let i = 0; i < nodes.length; i++) {
        rowCells.push(nodes[i].stats.name.info);
    }

    return rowCells;
}

function getUptimes(nodes) {
    let rowCells = [ 'Version' ];

    for (let i = 0; i < nodes.length; i++) {
        rowCells.push(
            nodes[i].infos.version.info
        );
    }

    return rowCells;
}

function getVersions(nodes) {
    let rowCells = [ 'Uptime' ];

    for (let i = 0; i < nodes.length; i++) {
        rowCells.push(
            moment.duration(
                nodes[i].stats.jvm.uptime_in_millis
            ).humanize().info
        );
    }

    return rowCells;
}

function getMaxFileDescriptors(nodes) {
    let rowCells = [ 'Max file descriptors' ];

    for (let i = 0; i < nodes.length; i++) {
        const max = nodes[i].stats.process.max_file_descriptors;

        // 0xFFF = 4095
        if (0xFFF < max) {
            rowCells.push(colors.checkOk(humanize.numberFormat(max, 0)));
        } else {
            rowCells.push(colors.checkCritical(humanize.numberFormat(max, 0)));
        }
    }

    return rowCells;
}

function checkMemoryIsLocked(nodes) {
    let rowCells = [ 'bootstrap.mlockall: true' ];

    for (let i = 0; i < nodes.length; i++) {
        const max = nodes[i].infos.process.mlockall;

        if (true === max) rowCells.push('Yes'.checkOk);
        else rowCells.push('No'.checkWarning);
    }

    return rowCells;
}

function checkMulticastDisabled(nodes) {
    let rowCells = [ 'discovery.zen.ping.multicast.enabled: false' ];

    for (let i = 0; i < nodes.length; i++) {
        const status = nodes[i].infos.settings.discovery.zen.ping.multicast.enabled;

        if (false === status || 'false' === status) rowCells.push('Yes'.checkOk);
        else rowCells.push('No'.checkWarning);
    }

    return rowCells;
}

function getHeapSizeChecks(nodes) {
    let rowCells = [ 'Heap Size init / max' ];

    for (let i = 0; i < nodes.length; i++) {
        const { heap_init_in_bytes: init, heap_max_in_bytes: max } = nodes[i].infos.jvm.mem;
        const str = `${humanize.filesize(init)} / ${humanize.filesize(max)}`;

        if (init >= max) rowCells.push(str.checkOk);
        else rowCells.push(str.checkCritical);
    }

    return rowCells;
}