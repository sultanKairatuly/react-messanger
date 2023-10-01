import http from "node:http";

type Methods = "CONNECT" | "PUT" | "GET" | "DELETE" | "POST" | "OPTION";
type RouteCallback = (
  req: http.IncomingMessage & { body: Record<string, unknown> },
  res: http.ServerResponse
) => unknown;
const PORT = 5000;
const router: Record<
  string,
  {
    method: Methods;
    callback: RouteCallback;
  }
> = {};
function registerRoute(
  method: Methods,
  route: string,
  callback: RouteCallback
) {
  if (router[route] && router[route].method === method) {
    return;
  }

  router[route] = {
    method,
    callback,
  };
}
registerRoute("GET", "/hello", (req, res) => {
  console.log("From callback: ", req.body);
  res.end("/adawdadawdawdawdawd");
});

registerRoute("POST", "/user", (req, res) => {
  console.log("From callback POST : ", req.body);
  res.end("Hello");
});
const server = http.createServer((req, res) => {
  const [route, method] = [req.url, req.method];
  if (route && method) {
    if (router[route] && router[route].method === method) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const parsedBody =
          body.length === 0
            ? {}
            : (JSON.parse(body) as Record<string, unknown>);
        const request = { ...req, body: parsedBody };

        router[route].callback(
          request as http.IncomingMessage & {
            body: Record<string, unknown>;
          },
          res
        );
      });
    }
  }
  if (!res.writableEnded) {
    res.statusCode = 404;
    res.write("No registrated route was found");
    res.end();
  }
});

server.listen(PORT || 5000, () => {
  console.log(`Server is listening on port ${PORT || 5000}`);
});
