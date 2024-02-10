import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const repoPath = {
    root: "./",
    packageName: "",
    exists: (name) => existsSync(repoPath.path(name)),
    path: (name) => join(repoPath.root, name),
    loadText: (name) => readFile(repoPath.path(name), "utf8"),
    loadBuffer: (name) => readFile(repoPath.path(name)),
};

const p = JSON.parse(await repoPath.loadText("package.json"));
repoPath.packageName = p.name;