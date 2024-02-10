import { IncomingMessage, ServerResponse } from "http";
import { ParsedPath } from "node:path";
import { repoPath } from "../core/repoPath.js";
import { ResponseHelper } from "../core/ResponseHelper.js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

export interface IPackedFile extends ParsedPath {
    packed?: string;
    xf?: boolean;
    module?: string;
    package?: string;
    hostUrl?: string;
}

const replaceSrc = (src: string): string => {
    src = src.replaceAll("\\", "/");
    const tokens = src.split("/");
    if (tokens[0] === "src") {
        tokens[0] = "dist";
    }
    return tokens.join("/");
};

function populate(dir: string, files: ParsedPath[], search: string, packed: boolean): void {
    for (const iterator of readdirSync(dir)) {
        if (iterator === "node_modules") {
            continue;
        }
        const filePath = path.join(dir, iterator);
        const p = path.parse(filePath) as IPackedFile;
        if (/\.(tsx)/i.test(p.ext)) {
            p.dir = replaceSrc(p.dir);
            p.module = [repoPath.packageName, p.dir, p.name]
                .filter((x) => x)
                .join("/");
            const fp = path.join(dir, `${p.name}${p.ext}`);
            const t = readFileSync(fp, "utf-8");
            if (t.indexOf('import Pack from "@web-atoms/core/dist/Pack";') !== -1
                || /\/\/\s*\@web\-atoms\-pack\:\s*true/gi.test(t)) {
                p.packed = path.join(dir, `${p.name}.pack.js`).split("\\").join("/").replace("src/", "dist/");
            }
            if (packed && !p.packed) {
                continue;
            }
            if (search && p.module.toLowerCase().indexOf(search) === -1 ) {
                continue;
            }
            files.push(p);
            continue;
        }
        const s = statSync(filePath);
        if (s.isDirectory()) {
            populate(filePath, files, search, packed);
        }
    }
}


export default async function modulesRoute(url: URL, req: IncomingMessage, res: ServerResponse) {
    const search = (url.searchParams.get("search") || "").toLowerCase();
    const packed = url.searchParams.get("packed") === "true";

    const files: IPackedFile [] = [];
    populate("./", files, search, packed);
    res.setHeader("cache-control", "no-cache");

    const server = req.socket.localAddress.split(":").pop();
    const serverPort = req.socket.localPort;

    for (const iterator of files) {
        iterator.hostUrl = `http://${server}:${serverPort}`;
        iterator.package = repoPath.packageName;
    }

    return ResponseHelper.write(res, JSON.stringify({ files }), "application/json");
}