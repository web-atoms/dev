import { IncomingMessage, Server, ServerResponse } from "http";
import viewRoute from "./routes/viewRoute.js";
import colors from "colors/safe.js";
import httpProxy from "http-proxy";
import staticRoute from "./routes/staticRoute.js";
import { repoPath } from "./core/repoPath.js";
import modulesRoute from "./routes/modulesRoute.js";

const proxyHost = process.argv.find((s) => /^(http|https)\:\/\//.test(s)) ?? "https://localhost";

console.log(`Starting Proxy to ${proxyHost}`);

const errorHandler = (error) => {
    console.error(error.stack ?? error.toString());
};

const proxyHostURL = new URL(proxyHost);

export default function router(server: Server, secure = false) {

    const proxy = httpProxy.createProxyServer({
        target: proxyHost,
        changeOrigin: true,
        ws: true,
        secure: true,
        hostRewrite: proxyHostURL.host,
        cookieDomainRewrite: {
            "*": ""
        }
    });

    proxy.on("error", errorHandler);
    proxy.on("econnreset", errorHandler);
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
        socket.on("error", errorHandler);
        proxy.ws(req, socket, head);
    });

    proxy.on("proxyRes", (pRes, res) => {
        let cookie = pRes.headers["set-cookie"];
        if (cookie) {
            cookie = cookie.map((s) => s.split(";").filter((c) => !/^secure$/i.test(c.trim())).join(";") + ";SameSite=false;");
            console.log(cookie.join(","));
            // pRes.setHeader("set-cookie",cookie);
            pRes.headers["set-cookie"] = cookie;
            console.log(JSON.stringify(pRes.headers, void 0, 2));
        }

        if (pRes.statusCode >= 400) {
            console.error( colors.red(`HTTP STATUS ${pRes.statusCode} for ${proxyHost}${pRes.url}`));
        } else if (pRes.statusCode > 300) {
            console.error( colors.yellow(`HTTP STATUS ${pRes.statusCode} for ${proxyHost}${pRes.url}`));
        }
    });


}
