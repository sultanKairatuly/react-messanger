import http from "node:http";
import { MongoClient, ServerApiVersion } from "mongodb";
import { Server } from "socket.io";
import webpush from "web-push";

const uri =
  "mongodb+srv://sultanbekkajratuly:d17i4hg4@cluster0.t0mwif5.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let ioSocket = null;
const userCollection = client.db("main").collection("users");
const chatCollection = client.db("main").collection("chats");
const subscriptionCollection = client.db("main").collection("subscriptions");

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
  const { messages: data } = req.body || {};
  if (type === "array") {
    for (const message of data) {
      await client.db("messages").collection(to).deleteOne({ id: message });
    }
    const messages = await client
      .db("messages")
      .collection(to)
      .find({})
      .toArray();
    io.to(user2).emit("update-messages", { data: messages, id: to });
  } else {
    await client.db("messages").collection(to).deleteOne({ id });
    const messages = await client
      .db("messages")
      .collection(to)
      .find({})
      .toArray();
    io.to(user2).emit("update-messages", { data: messages, id: to });
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

registerRoute("POST", "/delete-for-user-only", async (req) => {
  const { userId, deletingId } = req.query;
  await userCollection.updateOne({ userId }, { $pull: { chats: deletingId } });
  const updatedUser = await userCollection.findOne({ userId });
  return updatedUser;
});

registerRoute("POST", "/delete-for-both", async (req) => {
  const { userId, deletingId } = req.query;
  await userCollection.updateOne({ userId }, { $pull: { chats: deletingId } });
  await userCollection.updateOne(
    { userId: deletingId },
    { $pull: { chats: userId } }
  );

  const updatedUserPromise = userCollection.findOne({ userId });
  const updatedUser2Promise = userCollection.findOne({ userId: deletingId });
  const [updatedUser, updatedUser2] = await Promise.all([
    updatedUserPromise,
    updatedUser2Promise,
  ]);

  io.to(deletingId).emit("update-user", updatedUser2);
  return updatedUser;
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
  const messages = await client
    .db("messages")
    .collection(to)
    .find({})
    .toArray();
  io.to(user2).emit("update-messages", { data: messages, id: to });
});

registerRoute("POST", "/registration", async (req, res) => {
  try {
    const { user } = req.body;
    if (userPredicate(user)) {
      const candidate = await userCollection.findOne({ email: user.email });
      if (candidate) {
        res.statusCode = 409;
        res.statusMessage = "Already authorized";
        return { type: "error", message: "Already authorized" };
      } else {
        user.chats.push(
          (user.userId + "savedMessages").split("").sort().join("")
        );
        await userCollection.insertOne(user);
        res.statusCode = 200;
        res.statusMessage = "OK";
        const promiseOne = client
          .db("messages")
          .createCollection(
            (user.userId + "savedMessages").split("").sort().join("")
          );
        const promiseTwo = createChat({ type: "contact", chatId: user.userId });
        const savedChats = {
          type: "group",
          name: "Saved Messages",
          avatar: "default",
          members: [user],
          id: Math.random() * 10000,
          chatId: (user.userId + "savedMessages").split("").sort().join(""),
          bio: "",
          randomColor: "rgb(30,144,255)",
        };
        const promiseThree = chatCollection.insertOne(savedChats);
        await Promise.all([promiseOne, promiseThree, promiseTwo]);
        return JSON.stringify(user);
      }
    } else {
      res.statusCode = 405;
      res.statusMessage = "Bad request!";
    }
  } catch (e) {
    console.log("An error occured: ", e);
  }
});

registerRoute("GET", "/get-members", async (req) => {
  let { membersId } = req.query;
  membersId = JSON.parse(membersId.replace(/%22/g, '"'));
  const userPromises = [];
  for (const userId of membersId.map((member) => member.userId)) {
    const userPromise = userCollection.findOne({ userId });
    userPromises.push(userPromise);
  }

  const users = await Promise.all(userPromises);
  return users.map((user, idx) => ({ ...user, role: membersId[idx].role }));
});

registerRoute("GET", "/get-all-messages", async (req, res) => {
  try {
    const { messageIds: messageIdsRaw } = req.query;
    const messageIds = JSON.parse(messageIdsRaw.replace(/%22/g, '"'));
    const messages = [];

    for (const messageId of messageIds) {
      const a = await client
        .db("messages")
        .collection(messageId)
        .find({})
        .toArray();
      messages.push(a);
    }
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
  console.log("chat!", chatId);
  const data = await chatCollection.findOne({ chatId });

  if (data?.type === "contact") {
    response = await userCollection.findOne({ userId: data.chatId });
  } else {
    response = data;
  }
  return response;
});

registerRoute("POST", "/create-messages", async (req, res) => {
  try {
    const { type } = req.query;
    if (type === "contact") {
      const { user1, user2 } = req.query;
      const collName = (user1 + user2).split("").sort().join("");
      const collections = await client
        .db("messages")
        .listCollections()
        .toArray();
      const isExist = collections.filter((c) => c.name === collName).length;

      if (isExist) {
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
  const response = await client
    .db("messages")
    .collection(chatId)
    .find({})
    .toArray();
  return response;
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

registerRoute("GET", "/find-groups", async (req) => {
  const { query } = req.query;
  const cursor = await chatCollection.find({}).toArray();
  const decodedText = decodeURIComponent(query);
  const groups = cursor.filter((group) => {
    if (group.type === "contact") return false;

    return group.name.toLowerCase().includes(decodedText.toLowerCase());
  });
  return groups;
});

registerRoute("POST", "/create-group", async (req) => {
  try {
    const { group } = req.body;
    await client.db("messages").createCollection(group.chatId);
    await chatCollection.insertOne(group);
    const a = await chatCollection.findOne({ chatId: group.chatId });
    return a;
  } catch (e) {
    console.log(e);
  }
});

registerRoute("POST", "/leave-group", async (req) => {
  const { chatId, liver: userId, role } = req.query;
  chatCollection.updateOne(
    { chatId },
    { $pull: { members: { userId, role } } }
  );
  userCollection.updateOne({ userId }, { $pull: { chats: chatId } });
});

registerRoute("POST", "/send-message", async (req) => {
  const { to, user1, user2, message, type, socketId } = req.body;
  console.log("Message!:", message);
  if (type === "group") {
    await client
      .db("messages")
      .collection(to)
      .insertOne({ ...message, status: "received" });
    const updatedOne = await client
      .db("messages")
      .collection(to)
      .find({})
      .toArray();
    io.to(to).emit("update-messages", { data: updatedOne, id: to });
    const chat = await chatCollection.findOne({ chatId: to });
    const socket = io.sockets.sockets.get(socketId);
    socket.broadcast
      .to(to)
      .emit("notify", { chat, text: `${user1}: ${message.text}` });
  } else {
    await client
      .db("messages")
      .collection(to)
      .insertOne({ ...message, status: "received" });
    const messages = await client
      .db("messages")
      .collection(to)
      .find({})
      .toArray();
    const chat = await userCollection.findOne({ userId: user1 });
    const notifyText = message.type === 'image' ? 'Photo' : message.text
    if (!message.author.chats.includes(user2)) {
      await Promise.all([
        userCollection.updateOne(
          { userId: user2 },
          { $push: { chats: user1 } }
        ),
        userCollection.updateOne(
          { userId: user1 },
          { $push: { chats: user2 } }
        ),
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
      io.to(user1)
        .to(user2)
        .emit("update-messages", { data: messages, id: to });
      io.to(user2).emit("notify", { chat, text: notifyText });
    } else {
      io.to(user1)
        .to(user2)
        .emit("update-messages", { data: messages, id: to });
      io.to(user2).emit("notify", { chat, text: notifyText });
    }
  }

  return "";
});

registerRoute("POST", "/typing", async (req) => {
  const { userId, chatId } = req.query;
  const user = await userCollection.findOne({ userId });
  io.to(chatId).emit("typing", user);
});

registerRoute("POST", "/stopped-typing", async (req) => {
  const { userId, chatId } = req.query;
  const user = await userCollection.findOne({ userId });
  io.to(chatId).emit("stopped-typing", user);
});

registerRoute("POST", "/setUserOnline", async (req) => {
  const { userId } = req.query;
  const emitters = (await userCollection.find({}).toArray())
    .filter((u) => u.chats.includes(userId))
    .map((user) => user.userId);
  await userCollection.updateOne({ userId }, { $set: { lastSeen: 0 } });
  const updatedUser = await userCollection.findOne({ userId });
  emitters.forEach((e) => {
    io.to(e).emit("update-chat", updatedUser);
  });
  return updatedUser;
});

registerRoute("POST", "/setUserTime", async (req, res) => {
  const { userId } = req.query;
  const emitters = (await userCollection.find({}).toArray())
    .filter((u) => u.chats.includes(userId))
    .map((user) => user.userId);
  await userCollection.updateOne(
    { userId },
    { $set: { lastSeen: Date.now() } }
  );
  const updatedUser = await userCollection.findOne({ userId });
  emitters.forEach((e) => {
    io.to(e).emit("update-chat", updatedUser);
  });
  return updatedUser;
});

registerRoute("POST", "/add-subscription", async (req) => {
  let { subscription } = req.body;
  subscription = JSON.parse(subscription);
  subscription.expirationTime = 10000;
  subscriptionCollection.insertOne(subscription);
});

registerRoute("POST", "/remove-subscription", async (req) => {
  const { subscription } = req.body;
  subscriptionCollection.deleteOne({ endpoint: subscription.endpoint });
});

registerRoute("POST", "/notify-me", async (req) => {
  const {
    subscription: { endpoint },
  } = req.body;
  const subscription = await subscriptionCollection.findOne({ endpoint });
  sendNotifications([subscription]);
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

registerRoute("POST", "/connect", (req) => {
  const { socket, userId } = req.query;

  io.sockets.sockets.forEach((val, key) => {
    if (key === socket) {
      val.join(userId);
    }
  });
});

function sendNotifications(subscriptions) {
  const notification = JSON.stringify({
    title: "Hello, Notifications!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`,
    },
  });
  const options = {
    TTL: 10000,
  };
  subscriptions.forEach((subscription) => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr(endpoint.length - 8, endpoint.length);
    webpush
      .sendNotification(subscription, notification, options)
      .then((result) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch((error) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
}

async function createChat(chat) {
  await chatCollection.insertOne(chat);
}

function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue) return key;
  }
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
    console.log("Connection trauma: ", id);
    socket.join(id);
  });
  socket.on("connectToGroups", (chats) => {
    for (const chat of chats) {
      chatCollection.findOne({ chatId: chat }).then((chat) => {
        if (chat?.type === "group") {
          socket.join(chat.chatId);
        }
      });
    }
  });
  socket.on("joinGroup", async ({ chat: { chatId, members }, joiner }) => {
    socket.join(chatId);
    const systemMessage = {
      text: `${joiner.name} joined group`,
      id: Math.random() * 10000 * 12123,
      createdAt: Date.now(),
      type: "system",
    };
    await userCollection.updateOne(
      { userId: joiner.userId },
      { $push: { chats: chatId } }
    );
    if (!members.find((m) => m.userId === joiner.userId)) {
      await chatCollection.updateOne(
        { chatId },
        { $push: { members: { role: "member", userId: joiner.userId } } }
      );
    }

    await client.db("messages").collection(chatId).insertOne(systemMessage);
    const messagesPromise = client
      .db("messages")
      .collection(chatId)
      .find({})
      .toArray();
    const userPromise = userCollection.findOne({ userId: joiner.userId });
    const chatPromise = chatCollection.findOne({ chatId });
    const [messages, chat, user] = await Promise.all([
      messagesPromise,
      chatPromise,
      userPromise,
    ]);

    io.to(chatId).emit("update-messages", {
      data: messages,
      id: chatId,
    });
    io.to(joiner.userId).emit("update-chat", chat);
    io.to(joiner.userId).emit("update-user", user);
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
    "blockedContacts" in value &&
    "chats" in value &&
    "activeChatWallpaper" in value &&
    "bio" in value &&
    "userId" in value &&
    "chatWallpaper" in value
  );
}
