/**
 * Real Scramjet proxy server — follows
 * https://docs.titaniumnetwork.org/proxies/scramjet/
 * and MercuryWorkshop/Scramjet-App pattern.
 *
 * Serves: static UI, /scram/, /baremux/, /libcurl/, and Wisp at /wisp/
 */
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { hostname } from "node:os";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));

logging.set_level(logging.NONE);
Object.assign(wisp.options, {
  allow_udp_streams: false,
  hostname_blacklist: [/example\.com/],
  dns_servers: ["1.1.1.1", "1.0.0.1"],
});

const fastify = Fastify({
  serverFactory: (handler) => {
    return createServer()
      .on("request", (req, res) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        handler(req, res);
      })
      .on("upgrade", (req, socket, head) => {
        if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
        else socket.end();
      });
  },
});

fastify.register(fastifyStatic, {
  root: publicPath,
  decorateReply: true,
});

fastify.register(fastifyStatic, {
  root: scramjetPath,
  prefix: "/scram/",
  decorateReply: false,
});

fastify.register(fastifyStatic, {
  root: libcurlPath,
  prefix: "/libcurl/",
  decorateReply: false,
});

fastify.register(fastifyStatic, {
  root: baremuxPath,
  prefix: "/baremux/",
  decorateReply: false,
});

fastify.setNotFoundHandler((_req, reply) => {
  return reply.code(404).type("text/plain").send("Not found");
});

function shutdown() {
  console.log("Shutting down…");
  fastify.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

let port = parseInt(process.env.PORT || "", 10);
if (isNaN(port)) port = 8080;

fastify.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log("Scramjet proxy listening:");
  console.log(`  http://localhost:${port}`);
  console.log(`  http://${hostname()}:${port}`);
  console.log("  Wisp: /wisp/");
  console.log("  Scramjet assets: /scram/");
});
