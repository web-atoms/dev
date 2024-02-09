import SelfSigned from "./SelfSigned.js";
import * as portfinder from "portfinder";
import * as http from "node:http";
import * as https from "node:https";
import * as os from "node:os";
import * as colors from "colors/safe.js";
import router from "./router.js";

const { cert, key } = SelfSigned.setupSelfSigned();

const netInterfaces = os.networkInterfaces();

const httpPort = await portfinder.getPortPromise({
    startPort: 8080
});

const httpPortColored = colors.cyan(httpPort.toString());

const httpServer = http.createServer().listen(httpPort, () => {
    for (const iterator of Object.keys(netInterfaces)) {
        const intFace = netInterfaces[iterator];
        for (const ip of intFace) {
            if (ip.family === "IPv4") {
                console.log((`  http://${ip.address}:${httpPortColored}`));
            }
        }
    }
});

const httpsPort = await portfinder.getPortPromise({
    startPort: 8085
});

const httpsPortColored = colors.cyan(httpPort.toString());
const httpsServer = https.createServer( { cert, key }).listen(httpsPort, () => {
    for (const iterator of Object.keys(netInterfaces)) {
        const intFace = netInterfaces[iterator];
        for (const ip of intFace) {
            if (ip.family === "IPv4") {
                console.log((`  https://${ip.address}:${httpsPortColored}`));
            }
        }
    }
});

router(httpServer);
router(httpsServer);
