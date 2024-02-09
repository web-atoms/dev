import { IncomingMessage, ServerResponse } from "http";
import { ResponseHelper } from "../core/ResponseHelper.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { filePath } from "../core/filePath.js";

export default async function homeRoute(url: URL, req: IncomingMessage, res: ServerResponse) {

    if (!(url.pathname === "/" || /^\_repo\//.test(url.pathname))) {
        return;
    }

    const html = await filePath.loadText("index.html");

    let packageName = filePath.packageName;
    let view = url.pathname.substring(6);

    if (url.pathname === "/") {
        packageName = "@web-atoms/web-controls";
        view = "dist/dev/DevHost"
    }

    ResponseHelper.write(res,
        html
            .replace("@package", packageName)
            .replace("@view", view)
    );
}
