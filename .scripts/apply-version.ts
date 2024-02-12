import yargs from 'yargs';
import { hideBin } from "yargs/helpers";
import { applyVersion } from './lib/apply-version';


console.info('Applying version...');

const arg = yargs(hideBin(process.argv))
    .version(false)
    .option('version', {
        describe: 'Version to apply',
        type: 'string',
        demandOption: true,
        default: 'main'
    }).parseSync();

console.info(`Version: ${arg.version}`);

applyVersion(arg.version);