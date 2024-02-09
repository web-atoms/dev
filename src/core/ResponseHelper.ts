import { ServerResponse } from "node:http";

export const ResponseHelper = {

    write: (
        res: ServerResponse,
        text: string | Buffer,
        contentType = "text/html",
        status = 200) => {
        res.statusCode = status;
        res.setHeader("content-type", contentType);
        res.write(text, () => res.end());
    }

};