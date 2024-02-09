import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const filePath = {
    devRoot: join( dirname(fileURLToPath(import.meta.url)), "..", ".." ),

    packageName: "",

    loadText: (name) => {
        return readFile(join(filePath.devRoot, name), "utf8");
    }
};

const p = JSON.parse(await filePath.loadText("package.json"));
filePath.packageName = p.name;