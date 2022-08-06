import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import cliProgress from 'cli-progress';

import { copyDirSync } from '../utils/utils';
import type { Config } from '../config/config';
import { TRANSFORMATION_RULE_COUNT } from '../constants/constants';

const PACKAGE_VERSION = process.env.npm_package_version ?? 'unknown';

export class CLI {
	private progressInstance: cliProgress.SingleBar;
	private startTime: Date | undefined;

	constructor() {
		this.progressInstance = new cliProgress.SingleBar(
			{
				format:
					'progress [{bar}] {percentage}% | {doSomething} | {value}/{total}',
			},
			cliProgress.Presets.shades_classic
		);
	}

	public run(): void {
		const program = new Command();

		program
			.name('snowpack-to-vite')
			.arguments('[root]')
			.version(PACKAGE_VERSION, '-v, --version', 'Display version number')
			.option(
				'-d, -rootDir <path>',
				'The directory of the project to be converted'
			)
			.option(
				'-e, --entry <path>',
				'The entry point of the whole project. If no entry is specified "src/main.ts" or "src/main.js" will be used.'
			)
			.option(
				'-c, --cover',
				'Transformed project files will cover the raw files'
			)
			.action((root, options) => {
				const config: Config = {
					rootDir: options.rootDir ?? root,
					entry: options.entry,
					cover: options.cover,
				};

				this.start(config);
			})
			.parse(process.argv);
	}

	private async start(config: Config): Promise<void> {
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
			} else if (fs.existsSync(path.resolve(outDir, 'pnpm-lock.yaml'))) {
				packageManager = 'pnpm';
			}

			console.log(
				chalk.green(
					`You can now run "${packageManager} install" to install your dependencies.`
				)
			);
		} catch (err) {
			console.log(chalk.red('Could not convert project!'));
			console.log(chalk.red((err as Error).message));
		} finally {
			this.progressInstance.stop();
		}
	}
}
