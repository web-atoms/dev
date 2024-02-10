import { IncomingMessage, ServerResponse } from "http";
import { ResponseHelper } from "../core/ResponseHelper.js";
import mime from "mime";
import { repoPath } from "../core/repoPath.js";

export default async function staticRoute(url: URL, req: IncomingMessage, res: ServerResponse) {

    try {

        const buffer = await repoPath.loadBuffer(url.pathname.substring(1));
        await ResponseHelper.write(res, buffer, mime.getType(url.pathname));
    } catch (error) {
        await ResponseHelper.write(res, error.stack ?? error, "text/plain", 500);
    }

}
