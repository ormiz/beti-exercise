const crypto = require("crypto");
const redis = require("redis");
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const app = express();
const port = 3000;

const redisClient = redis.createClient();
redisClient.connect();

app.use(bodyParser.json());

app.post("/login", async (req, res) => {
  try {
    if (!redisClient.isReady) {
      res.status(500).send("Redis is not connected");
    }
    const username = req.body.username;
    const password = req.body.password;
    if (username.startsWith("user") && password === "password") {
      let accessToken = await redisClient.get(`user:${username}`);
      if (!accessToken) {
        accessToken = crypto.randomUUID();
        const loginTimestamp = moment().toISOString();
        await redisClient.set(`user:${username}`, accessToken);
        await redisClient.set(`token:${accessToken}`, loginTimestamp);
        res.send({ accessToken, loginTimestamp });
      } else {
        const loginTimestamp = await redisClient.get(`token:${accessToken}`);
        res.send({ accessToken, loginTimestamp });
      }
    } else {
      res.status(401).send("Incorrect username or password");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

const shouldBlockUser = (timestamp) => {
  const now = moment();
  const loginTimestamp = moment(timestamp);
  const diff = now.diff(loginTimestamp, "minutes", true);
  return diff >= 60 && diff <= 65;
};

const verifyToken = async (req, res, next) => {
  try {
    if (!redisClient.isReady) {
      return res.status(500).send("Redis is not connected");
    }
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader) {
      return res.status(401).send();
    }
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    const loginTimestamp = await redisClient.get(`token:${bearerToken}`);
    if (!loginTimestamp) {
      return res.status(401).send();
    }
    if (shouldBlockUser(loginTimestamp)) {
      const allowTime = moment(loginTimestamp).add(65, "minutes");
      return res.status(403).send(`You are blocked until ${allowTime}`);
    }
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error");
  }
};

app.use(verifyToken);

app.get("/action", (req, res) => {
  res.send("Do something");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
