import http from "node:http";
import { MongoClient, ServerApiVersion } from "mongodb";
import { Server } from "socket.io";

const uri =
  "mongodb+srv://sultanbekkajratuly:d17i4hg4@cluster0.t0mwif5.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const userCollection = client.db("main").collection("users");
const chatCollection = client.db("main").collection("chats");
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

registerRoute("POST", "/login", async (req, res) => {
  try {
    const { user } = req.body;
    const isLoginUser = (value) => {
      return (
        value &&
        typeof value === "object" &&
        "email" in value &&
        "password" in value
      );
    };
    if (isLoginUser(user)) {
      const candidate = await userCollection.findOne({ email: user.email });
      if (!candidate) {
        res.statusCode = 409;
        res.statusMessage = "Not authorized";
        return { type: "error", message: "Not authorized" };
      } else {
        const clone = await userCollection.findOne({ email: user.email });
        if (clone.password !== user.password) {
          res.statusCode = 405;
          res.statusMessage = "Credentials mismatch";
          return { type: "error", message: "Credential mismatch" };
        }
        res.statusCode = 200;
        res.statusMessage = "OK";
        return clone;
      }
    } else {
      res.statusCode = 405;
      res.statusMessage = "Bad request!";
    }
  } catch (e) {
    console.log("An error occured: ");
  }
});

registerRoute("POST", "/delete-message", async (req) => {
  const { to, messageId: id, user1, user2, type } = req.query;
  const { messages } = req.body || {};
  if (type === "array") {
    for (const message of messages) {
      await client.db("messages").collection(to).deleteOne({ id: message });
    }
    io.to(user1).emit("update-messages");
    io.to(user2).emit("update-messages");
  } else {
    await client.db("messages").collection(to).deleteOne({ id });
    io.to(user1).emit("update-messages");
    io.to(user2).emit("update-messages");
  }
});

registerRoute("POST", "/unblock-user", async (req) => {
  const { blocked, blocker } = req.query;
  await userCollection.updateOne(
    { userId: blocker },
    { $pull: { blockedContacts: blocked } }
  );
  const user = await userCollection.findOne({ userId: blocker });
  io.to(blocked).emit("update-chat", user);
  return user;
});

registerRoute("POST", "/block-user", async (req, res) => {
  const { blocked, blocker } = req.query;
  await userCollection.updateOne(
    { userId: blocker },
    { $push: { blockedContacts: blocked } }
  );
  const user = await userCollection.findOne({ userId: blocker });
  io.to(blocked).emit("update-chat", user);
  return user;
});

registerRoute("POST", "/unmute-user", async (req) => {
  try {
    const { muter, muted } = req.query;
    await userCollection.updateOne(
      { userId: muter },
      { $pull: { mutedContacts: muted } }
    );
    const user = await userCollection.findOne({ userId: muter });
    return user;
  } catch (e) {
    console.log("Error!");
  }
});

registerRoute("POST", "/mute-user", async (req) => {
  try {
    const { muter, muted } = req.query;
    await userCollection.updateOne(
      { userId: muter },
      { $push: { mutedContacts: muted } }
    );
    const user = await userCollection.findOne({ userId: muter });
    return user;
  } catch (e) {
    console.log("Error!");
  }
});

registerRoute("POST", "/read-message", async (req, res) => {
  const { to, messageId: id, user2 } = req.query;
  await client
    .db("messages")
    .collection(to)
    .updateOne({ id }, { $set: { status: "read" } });
  io.to(user2).emit("update-messages");
});

registerRoute("POST", "/registration", async (req, res) => {
  try {
  } catch (e) {}
  const { user } = req.body;
  if (userPredicate(user)) {
    const candidate = await userCollection.findOne({ email: user.email });
    if (candidate) {
      res.statusCode = 409;
      res.statusMessage = "Already authorized";
      return { type: "error", message: "Already authorized" };
    } else {
      await userCollection.insertOne(user);
      res.statusCode = 200;
      res.statusMessage = "OK";
      await createChat({ type: "contact", chatId: user.userId });
      return JSON.stringify(user);
    }
  } else {
    res.statusCode = 405;
    res.statusMessage = "Bad request!";
  }
});

registerRoute("GET", "/get-all-messages", async (req, res) => {
  try {
    const { messageIds: messageIdsRaw } = req.query;
    const messageIds = JSON.parse(messageIdsRaw.replace(/%22/g, '"'));
    const messages = [];
    console.log(messageIds);
    console.log("==========================");

    for (const messageId of messageIds) {
      const a = await client
        .db("messages")
        .collection(messageId)
        .find({})
        .toArray();
      messages.push(a);
    }
    console.log(messages);
    return messages;
  } catch (e) {
    console.log("Error!", e);
  }
});

registerRoute("POST", "/update-user", async (req, res) => {
  try {
    const { field, val, prevUser } = req.body;
    await userCollection.updateOne(
      { email: prevUser.email },
      { $set: { [field]: val } }
    );
    const updatedUser = await userCollection.findOne({
      email: prevUser.email,
    });
    return updatedUser;
  } catch (e) {
    console.log("An error occured: ");
    return 405;
  }
});

registerRoute("GET", "/chat", async (req) => {
  const { chatId } = req.query;
  let response = {};
  const data = await chatCollection.findOne({ chatId });

  if (data?.type === "contact") {
    response = await userCollection.findOne({ userId: data.chatId });
  }
  return response;
});

registerRoute("POST", "/create-messages", async (req, res) => {
  try {
    const { type } = req.query;
    if (type === "contact") {
      const { user1, user2 } = req.query;
      const collName = (user1 + user2).split("").sort().join("");
      const collections = await client.db().listCollections().toArray();
      const isExist = collections.filter((c) => c.name === collName).length;

      if (isExist) {
        console.log("Collection exits");
      } else {
        await client.db("messages").createCollection(collName);
      }
    } else {
      const { group } = req.query;
      await client.db("messages").createCollection(group);
    }
  } catch (e) {
    console.log("Error");
  } finally {
    return "";
  }
});

registerRoute("GET", "/messages", async (req, res) => {
  const { chatId } = req.query;
  return await client.db("messages").collection(chatId).find({}).toArray();
});

registerRoute("POST", "/update-user-wallpapers", async (req, res) => {
  const { wallpaper, prevUser } = req.body;
  try {
    await userCollection.updateOne(
      { email: prevUser.email },
      { $set: { chatWallpaper: [wallpaper, ...prevUser.chatWallpaper] } }
    );
    const updatedUser = await userCollection.findOne({
      email: prevUser.email,
    });
    return updatedUser;
  } catch (e) {
    console.log("An error occured: ");
    return 405;
  }
});

registerRoute("GET", "/check-candidate", async (req, res) => {
  const { email, userId } = req.query;
  if (email && userId) {
    const collection = client.db("main").collection("users");
    const candidateByEmail = collection.findOne({ email });
    const candidateByUserId = collection.findOne({ userId });
    const val = await Promise.all([candidateByEmail, candidateByUserId]);
    if (val.every((i) => !!i)) return true;
  }
  return false;
});

registerRoute("GET", "/find-chats", async (req, res) => {
  const { query } = req.query;
  const cursor = await userCollection.find({}).toArray();
  const users = cursor.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );
  return users;
});

registerRoute("POST", "/send-message", async (req, res) => {
  const { to, user1, user2, message } = req.body;

  await client
    .db("messages")
    .collection(to)
    .insertOne({ ...message, status: "received" });
  if (!message.author.chats.includes(user2)) {
    await Promise.all([
      userCollection.updateOne({ userId: user2 }, { $push: { chats: user1 } }),
      userCollection.updateOne({ userId: user1 }, { $push: { chats: user2 } }),
    ]);
    const updatedOnePromise = userCollection.findOne({ userId: user1 });
    const updatedTwoPromise = userCollection.findOne({ userId: user2 });
    const [updatedOne, updatedTwo] = await Promise.all([
      updatedOnePromise,
      updatedTwoPromise,
    ]);
    updatedOne.chats = [...new Set(updatedOne.chats)];
    updatedTwo.chats = [...new Set(updatedTwo.chats)];
    io.to(user1).emit("update-user", updatedOne);
    io.to(user2).emit("update-user", updatedTwo);
  }

  io.to(user1).emit("update-messages");
  io.to(user2).emit("update-messages");

  return "";
});

registerRoute("POST", "/update-user-profile", async (req, res) => {
  try {
    const { user, userId, userName, userAvatar, bio } = req.body;
    if (
      user.bio === bio &&
      user.name === userName &&
      user.userId === userId &&
      user.avatar === userAvatar
    ) {
      return user;
    }

    await userCollection.updateOne(
      { email: user.email },
      {
        $set: {
          name: userName,
          bio,
          avatar: userAvatar,
          userId: user.userId,
        },
      }
    );
    const updatedUser = await userCollection.findOne({ email: user.email });
    return updatedUser;
  } catch (e) {
    console.log("An error occured: ");
    return 405;
  }
});

async function createChat(chat) {
  await chatCollection.insertOne(chat);
}

const server = http.createServer((req, res) => {
  const queries = req.url
    .replace(/\/.+\?/gm, "")
    .split("&")
    .reduce((a, i) => {
      const [key, val] = i.split("=");
      a[key] = val;
      return a;
    }, {});
  req.query = queries;
  const [route, method] = [
    req.url.includes("?")
      ? req.url.match(/\/.+\?/gm, "")?.[0]?.replace("?", "")
      : req.url,
    req.method,
  ];
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  if (route && method) {
    if (router[route] && router[route].method === method) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        const parsedBody = body.length === 0 ? null : JSON.parse(body);
        const request = { ...req, body: parsedBody };
        const response = await router[route].callback(request, res);
        if (response === 405) {
          res.statusCode = 405;
          res.end("Bad request");
        }
        if (!res.writableEnded) {
          res.end(JSON.stringify(response));
        }
      });
    } else {
      res.end("");
    }
  } else {
    res.statusCode = 200;
    res.statusMessage = "Bad request";
    res.end("Bad request");
  }
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("connectToUserId", (id) => {
    socket.join(id);
  });

  socket.on("send-message", async ({ to, from, message }) => {
    await userCollection.updateOne(
      { userId: to },
      { $push: { [`messages.${from}`]: message } }
    );
    await userCollection.updateOne(
      { userId: from },
      { $push: { [`messages.${to}`]: message } }
    );
    const updatedOnePromise = userCollection.findOne({ userId: to });
    const updatedTwoPromise = userCollection.findOne({ userId: from });
    const [updatedOne, updatedTwo] = await Promise.all([
      updatedOnePromise,
      updatedTwoPromise,
    ]);
    updatedOne.messages[from] = updatedOne.messages[from].map((i) =>
      i.id === message.id ? { ...i, status: "received" } : i
    );
    updatedTwo.messages[to] = updatedTwo.messages[to].map((i) =>
      i.id === message.id ? { ...i, status: "received" } : i
    );

    io.to(to).emit("update-user", updatedOne);
    io.to(from).emit("update-user", updatedTwo);
  });
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
