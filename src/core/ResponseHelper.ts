import { ServerResponse } from "node:http";

export const ResponseHelper = {

    write: (
        res: ServerResponse,
        text: string | Buffer,
        contentType = "text/html",
        status = 200) => {
        return new Promise<void>((resolve, reject) => {
            res.statusCode = status;
            res.setHeader("content-type", contentType);
            res.write(text, () => {
                try {
                    res.end();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

};