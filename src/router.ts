import { IncomingMessage, Server, ServerResponse } from "http";
import devRoute from "./routes/repoRoute.js";
import homeRoute from "./routes/homeRoute.js";

import httpProxy from "http-proxy";

const proxyHost = process.argv.find((s) => /^(http|https)\:\/\//.test(s));

export default function router(server: Server) {

    const proxy = httpProxy.createProxyServer({
        target: proxyHost,
        changeOrigin: true,
        ws: true,
        secure: true,
        cookieDomainRewrite: {
            "*": ""
        },        
    });

    const wrap = (url: URL, fx: (url: URL, req: IncomingMessage, res: ServerResponse) => any) => (req: IncomingMessage, res: ServerResponse) => {
        fx(url, req, res)?.catch(console.error);
    };

    server.on("request", (req, res) => {
        const url = new URL(req.url);

        wrap(url, devRoute);
        wrap(url, homeRoute);

        proxy.web(req, res);
    });

    server.on("upgrade", (req, socket, head) => {
        proxy.ws(req, socket, head);
    });

    proxy.on("proxyRes", (pReq, res, pRes) => {
        let cookie = pRes.getHeader("set-cookie") as any;
        if (cookie) {
            cookie = Array.isArray(cookie) ? cookie : [cookie];
            cookie = cookie.map((s) => s.split(";").filter((c) => c.trim().toLocaleLowerCase() !== "secure").join(";"));
            pRes.setHeader("set-cookie",cookie);
        }
    });


}
