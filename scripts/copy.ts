import * as fs from "fs";
import * as path from "path";

import { glob } from "glob";

function move(source: string, destination: string) {
	glob(source, (err, files) => {
		if (err) {
			throw err;
		}
		console.log(files);
		files.forEach((file) => {
			fs.copyFileSync(file, path.resolve(destination, path.basename(file)));
		});
	});
}

move("src/nodes/Loki/*.{png,svg,json}", "dist/nodes/Loki");
