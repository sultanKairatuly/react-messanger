import http from "node:http";
import { MongoClient, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://sultanbekkajratuly:d17i4hg4@cluster0.t0mwif5.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const PORT = 5000;
const router = {};
function registerRoute(method, route, callback) {
  if (router[route] && router[route].method === method) {
    return;
  }

  router[route] = {
    method,
    callback,
  };
}

registerRoute("POST", "/registration", async (req, res) => {
  const { user } = req.body;
  console.log(req.headers);
  console.log(user);
  if (userPredicate(user)) {
    const collection = client.db("main").collection("users");
    const candidate = await collection.findOne({ email: user.email });
    console.log("candidate ", candidate);
    if (candidate) {
      res.statusCode = 409;
      res.statusMessage = "Already authorized";
    } else {
      await collection.insertOne(user);
      console.log("User succefuslly created!");
      res.statusCode = 200;
      res.statusMessage = "OK";
      res.end(JSON.stringify(user));
    }
  } else {
    res.statusCode = 405;
    res.statusMessage = "Bad request!";
  }
  if (!res.writableEnded) res.end();
});

registerRoute("GET", "/check-candidate", async (req, res) => {
  const queriesArray = req.url.replace(/\/.+\?/gm, "").split("=");
  const queries = {};
  for (let i = 0; i < queriesArray.length; i++) {
    if (i % 2 === 0) {
      queries[queriesArray[i]] = null;
    } else {
      queries[queriesArray[i - 1]] = queriesArray[i];
    }
  }

  const { email } = queries;
  if (email) {
    const collection = client.db("main").collection("users");
    const candidate = await collection.findOne({ email });
    if (candidate) return true;
  }
  console.log(email);
  return false;
});

const server = http.createServer((req, res) => {
  // const [route, method] = [
  //   req.url.includes("?")
  //     ? req.url.match(/\/.+\?/gm, "")?.[0]?.replace("?", "")
  //     : req.url,
  //   req.method,
  // ];
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  // console.log("route ", route);
  // console.log("methoid ", method);
  // if (route && method) {

  //   if (router[route] && router[route].method === method) {
  //     let body = "";
  //     req.on("data", (chunk) => {
  //       body += chunk.toString();
  //     });
  //     req.on("end", async () => {
  //       const parsedBody = body.length === 0 ? {} : JSON.parse(body);
  //       const request = { ...req, body: parsedBody };
  //       const response = await router[route].callback(request, res);
  //       res.end(JSON.stringify(response));
  //     });
  //   } else {
  //     res.end("");
  //   }

  //   console.log(method);
  // } else {
  //   res.statusCode = 200;
  //   res.statusMessage = "Bad request";
  //   res.end("Bad request");
  // }

  res.end("");
});

server.listen(PORT || 5000, () => {
  console.log(`Server is listening on port ${PORT || 5000}`);
});

function userPredicate(value) {
  return (
    value != null &&
    typeof value === "object" &&
    "password" in value &&
    "email" in value &&
    "type" in value &&
    "name" in value &&
    "avatar" in value &&
    "id" in value &&
    "messages" in value &&
    "blockedContacts" in value &&
    "chats" in value
  );
}
