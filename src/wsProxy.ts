import { IncomingMessage } from "http";
import { Socket } from "net";
import internal from "stream";
import { WebSocket, WebSocketServer } from "ws";

const pipeWebSocket = (src: WebSocket, dest: WebSocket) => {
    try {
        src.on("message", (data, binary) => {
            try {
                dest.send(data, { binary });
            } catch (error) {
                console.error(error);
            }
        });

        const safeClose = (e) => {
            console.error(e);
            try {
                if (dest.readyState === 1) {
                    dest.close();
                }
            } catch (e1) {
                console.error(e1);
            }
        };

        src.on("error", safeClose);
        src.on("close", safeClose);
    } catch (error) {
        console.error(error);
    }
};

const wss = new WebSocketServer({ noServer: true });


export function wsProxy(url: URL, req: IncomingMessage, socket: internal.Duplex, head) {

    wss.handleUpgrade(req, socket, head, (inWS) => {
        try {


            console.log(`Socket upgraded`);

            console.log(`Connecting to ${url.toString()}`);
            const ws = new WebSocket(url.toString(), {
                headers: {
                    cookie: req.headers.cookie
                }
            });
            ws.once("error", console.error);
            ws.once("upgrade", (uh) => {

                console.log(`Socket Connected`);
                // do nothing... socket connected...
            
                pipeWebSocket(ws, inWS);
                pipeWebSocket(inWS, ws);

            });
            socket.on("error", (error) => {
                console.error(error);
                try {
                    if (ws.readyState === 1) {
                        ws.close();
                    }
                } catch (e1) {
                    console.error(e1);
                }
            });  
        } catch (error) {
            socket.end();
            console.error(error);
        }          
    });

  

}