#!/usr/bin/env node

require('colors');
const inquirer = require('inquirer');
const program = require('../lib/commander');

const { API_HOST, PACKAGE_INFO } = require('../constants');
const stencilDownload = require('../lib/stencil-download');
const { checkNodeVersion } = require('../lib/cliCommon');
const { printCliResultErrorAndExit } = require('../lib/cliCommon');

program
    .version(PACKAGE_INFO.version)
    .option('-h, --host [hostname]', 'specify the api host', API_HOST)
    .option('-f, --file [filename]', 'specify the filename to download only')
    .option('-e, --exclude [exclude]', 'specify a directory to exclude from download')
    .option('-c, --channel_id [channelId]', 'specify the channel ID of the storefront', parseInt)
    .parse(process.argv);

checkNodeVersion();

const cliOptions = program.opts();
const extraExclude = cliOptions.exclude ? [cliOptions.exclude] : [];
const options = {
    exclude: ['parsed', 'manifest.json', ...extraExclude],
    apiHost: cliOptions.host || API_HOST,
    channelId: cliOptions.channel_id || 1,
    file: cliOptions.file,
};

async function run(opts) {
    const overwriteType = opts.file ? opts.file : 'files';

    const answers = await inquirer.prompt([
        {
            message: `${'Warning'.yellow} -- overwrite local with remote ${overwriteType}?`,
            name: 'overwrite',
            type: 'checkbox',
            choices: ['Yes', 'No'],
        },
    ]);

    if (!answers.overwrite.includes('Yes')) {
        console.log(`Request cancelled by user ${'No'.red}`);
        return;
    }

    console.log(`${'ok'.green} -- ${overwriteType} will be overwritten by change`);

    try {
        await stencilDownload(opts);
    } catch (err) {
        printCliResultErrorAndExit(err);
    }

    console.log(`${'ok'.green} -- Theme file(s) updated from remote`);
}

run(options);
