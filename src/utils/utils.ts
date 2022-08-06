import fs from 'fs';
import path from 'path';

export function copyDirSync(
	source: string,
	destination: string,
	excludes?: string[]
) {
	fs.mkdirSync(destination, { recursive: true });

	const entries = fs.readdirSync(source, { withFileTypes: true });

	entries.forEach((entry) => {
		const sourcePath = path.join(source, entry.name);
		const destinationPath = path.join(destination, entry.name);
		const relativePath = path.relative(source, sourcePath);

		if (excludes && excludes.includes(relativePath)) {
			return;
		}

		if (entry.isDirectory()) {
			copyDirSync(sourcePath, destinationPath, excludes);
			return;
		}

		fs.copyFileSync(sourcePath, destinationPath);
	});
}
