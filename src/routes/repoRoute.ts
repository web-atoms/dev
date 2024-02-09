import { readFile } from "node:fs/promises";
import { IncomingMessage, OutgoingMessage } from "http";
import { join } from "path";
import { parse } from "node:path";
import mime from "mime";
import { existsSync, statSync } from "node:fs";
import { ServerResponse } from "node:http";

export default async function devRoute(url: URL, req: IncomingMessage, res: ServerResponse) {
    if(!/^\/\_repo\//i.test(url.pathname)) {
        return;
    }
    const filePath = join(".", url.pathname);

    if (!existsSync(filePath)) {
        res.statusCode = 404;
        res.setHeader("content-type", "text/plain");
        res.end(`No file found at ${filePath}`);
        return;
    }

    const s = statSync(filePath);
    if(s.isDirectory()) {
        // list files...
        return;
    }

    const buffer = await readFile(filePath);

    const contentType = mime.getType(filePath);
    res.setHeader("content-type", contentType);
    res.setHeader("content-length", buffer.length);
    res.write(buffer, () => res.end());
}
