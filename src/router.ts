import { IncomingMessage, Server, ServerResponse } from "http";
import viewRoute from "./routes/viewRoute.js";
import colors from "colors/safe.js";
import httpProxy from "http-proxy";
import staticRoute from "./routes/staticRoute.js";
import { repoPath } from "./core/repoPath.js";
import modulesRoute from "./routes/modulesRoute.js";

const proxyHost = process.argv.find((s) => /^(http|https)\:\/\//.test(s));

const errorHandler = (error) => {
    console.error(error.stack ?? error.toString());
};

export default function router(server: Server, secure = false) {

    const proxy = httpProxy.createProxyServer({
        target: proxyHost,
        changeOrigin: true,
        ws: true,
        secure: true,
        cookieDomainRewrite: {
            "*": ""
        }
    });

    proxy.on("error", errorHandler);

    server.on("error", errorHandler);

    server.on("request", (req, res) => {
        const url = new URL( req.url, secure ? `https://${req.headers.host}` : `http://${req.headers.host}`);

        if (url.pathname === "/" || url.pathname.startsWith(viewRoute.prefix)) {
            viewRoute(url, req, res).catch(errorHandler);
            return;
        }

        if (repoPath.exists(url.pathname.substring(1))) {
            staticRoute(url, req, res).catch(errorHandler);
            return;
        }

        if (url.pathname.startsWith("/flat-modules")) {
            modulesRoute(url, req, res).catch(errorHandler);
            return;
        }
        proxy.web(req, res);
    });

    server.on("upgrade", (req, socket, head) => {
        console.log(`Forwarding WS ${req.url}`);
        proxy.ws(req, socket, head);
    });

    proxy.on("proxyRes", (pReq, res, pRes) => {
        let cookie = pRes.getHeader("set-cookie") as any;
        if (cookie) {
            cookie = Array.isArray(cookie) ? cookie : [cookie];
            cookie = cookie.map((s) => s.split(";").filter((c) => c.trim().toLocaleLowerCase() !== "secure").join(";"));
            pRes.setHeader("set-cookie",cookie);
        }

        if (pRes.statusCode >= 400) {
            console.error( colors.red(`HTTP STATUS ${pReq.statusCode} for ${proxyHost}${pReq.url}`));
        } else if (pRes.statusCode > 300) {
            console.error( colors.yellow(`HTTP STATUS ${pReq.statusCode} for ${proxyHost}${pReq.url}`));
        }
    });


}
