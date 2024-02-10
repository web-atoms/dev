import { IncomingMessage, ServerResponse } from "http";
import { ResponseHelper } from "../core/ResponseHelper.js";
import { filePath } from "../core/filePath.js";
import { repoPath } from "../core/repoPath.js";

export default async function viewRoute(url: URL, req: IncomingMessage, res: ServerResponse) {
    try {

        const html = await filePath.loadText("index.html");

        let packageName = repoPath.packageName;
        let view = url.pathname.substring(viewRoute.prefix.length);
        let root = "";
        let embedScript = "";

        if(repoPath.exists("./.vscode/.waSetup.js")) {
            embedScript = `<script src="/.vscode/.waSetup.js"></script>`
        }

        if (url.pathname === "/") {
            view = "@web-atoms/web-controls/dist/dev/DevHost";
        }

        await ResponseHelper.write(res,
            html
                .replaceAll("@packageName", packageName)
                .replaceAll("@view", view)
                .replaceAll("@root", root)
                .replaceAll("<embed-script/>", embedScript)
        );

    } catch (error) {
        await ResponseHelper.write(res, error.stack ?? error, "text/plain", 500);
    }

}

viewRoute.prefix = "/_view/";