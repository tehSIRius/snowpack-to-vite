import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import cliProgress from 'cli-progress';
import { copyDirSync } from '../utils/utils';
import { TRANSFORMATION_RULE_COUNT } from '../constants/constants';
const PACKAGE_VERSION = process.env.npm_package_version ?? 'unknown';
export class CLI {
    constructor() {
        this.progressInstance = new cliProgress.SingleBar({
            format: 'progress [{bar}] {percentage}% | {doSomething} | {value}/{total}',
        }, cliProgress.Presets.shades_classic);
    }
    run() {
        const program = new Command();
        program
            .name('snowpack-to-vite')
            .arguments('[root]')
            .version(PACKAGE_VERSION, '-v, --version', 'Display version number')
            .option('-d, -rootDir <path>', 'The directory of the project to be converted')
            .option('-e, --entry <path>', 'The entry point of the whole project. If no entry is specified "src/main.ts" or "src/main.js" will be used.')
            .option('-c, --cover', 'Transformed project files will cover the raw files')
            .action((root, options) => {
            const config = {
                rootDir: options.rootDir ?? root,
                entry: options.entry,
                cover: options.cover,
            };
            this.start(config);
        })
            .parse(process.argv);
    }
    async start(config) {
        try {
            this.startTime = new Date();
            console.log(chalk.green('Snowpack to Vite'));
            if (!fs.existsSync(config.rootDir)) {
                throw new Error(`Project path does not exist! ${config.rootDir}`);
            }
            const rootDir = path.resolve(config.rootDir);
            console.log(chalk.blue(`Selected project path: ${rootDir}`));
            let outDir = rootDir;
            if (!config.cover) {
                const projectName = path.basename(rootDir);
                outDir = path.join(path.dirname(rootDir), `${projectName}-vite`);
                console.log(chalk.blue(`Output path: ${outDir}`));
                if (fs.existsSync(outDir)) {
                    console.debug(chalk.blue('Clearing ouput directory.'));
                    fs.rmSync(outDir, { recursive: true, force: true });
                }
                copyDirSync(rootDir, outDir, ['node_modules']);
            }
            this.progressInstance.start(TRANSFORMATION_RULE_COUNT, 0, {
                doSomething: 'Transformation begins...',
            });
            // TODO
            console.log(chalk.green('Done!'));
            let packageManager = 'npm';
            if (fs.existsSync(path.resolve(outDir, 'yarn.lock'))) {
                packageManager = 'yarn';
            }
            else if (fs.existsSync(path.resolve(outDir, 'pnpm-lock.yaml'))) {
                packageManager = 'pnpm';
            }
            console.log(chalk.green(`You can now run "${packageManager} install" to install your dependencies.`));
        }
        catch (err) {
            console.log(chalk.red('Could not convert project!'));
            console.log(chalk.red(err.message));
        }
        finally {
            this.progressInstance.stop();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3BCLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUM7QUFFdkMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLElBQUksU0FBUyxDQUFDO0FBRXJFLE1BQU0sT0FBTyxHQUFHO0lBSWY7UUFDQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUNoRDtZQUNDLE1BQU0sRUFDTCxrRUFBa0U7U0FDbkUsRUFDRCxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FDbEMsQ0FBQztJQUNILENBQUM7SUFFTSxHQUFHO1FBQ1QsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUU5QixPQUFPO2FBQ0wsSUFBSSxDQUFDLGtCQUFrQixDQUFDO2FBQ3hCLFNBQVMsQ0FBQyxRQUFRLENBQUM7YUFDbkIsT0FBTyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsd0JBQXdCLENBQUM7YUFDbkUsTUFBTSxDQUNOLHFCQUFxQixFQUNyQiw4Q0FBOEMsQ0FDOUM7YUFDQSxNQUFNLENBQ04sb0JBQW9CLEVBQ3BCLDZHQUE2RyxDQUM3RzthQUNBLE1BQU0sQ0FDTixhQUFhLEVBQ2Isb0RBQW9ELENBQ3BEO2FBQ0EsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFB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