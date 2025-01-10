const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var users = [
  { email: "siddhartha@nagarro.com", password: "12345", name: "Siddhartha" },
];
var store = [];
var token = [];
var activeSessions = [];

app.get("/", (_, res) => {
  res.send("Hello there");
});

app.get("/getItems", (_, res) => {
  setTimeout(() => res.json(store), 3000);
});

function authorization(req, res, next) {
  let { authorization } = req.headers;
  const isValidToken = token.some((token) => token === authorization);
  if (authorization && isValidToken) {
    next();
  } else {
    return res.send({ status: 401, message: "unauthorized request " });
  }
}

app.post("/verify", authorization, (req, res) => {
  let { authorization } = req.headers;
  let user = activeSessions.find((user) => user.token === authorization);
  res.send(user);
});

app.post("/saveItem", authorization, (req, res) => {
  const id = crypto.randomBytes(16).toString("hex");
  let { item } = req.body;
  let storedData = store.find((savedItem) => savedItem.item === item.item);
  if (!storedData) item.id = id;
  else item.id = storedData.id;
  let filteredStore = store.filter((savedItem) => savedItem.item !== item.item);
  store = [...filteredStore, item];
  return res.send({ res: 200, message: "saved successfully" });
});

app.delete("/delete/:id", authorization, (req, res) => {
  let { id } = req.params;
  let filteredStore = store.filter((savedItem) => savedItem.id !== id);
  store = [...filteredStore];
  res.send({ res: 200, message: "deleted successfully" });
});

app.get("/itemDetails/:id", (req, res) => {
  let { id } = req.params;
  let filteredStore = store.find((savedItem) => savedItem.id === id);
  res.send(filteredStore);
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let user = users.filter(
    (user) => user.email === email && user.password === password
  );
  if (!user.length)
    return res.send({ status: 404, message: "No user with this credential" });
  const id = crypto.randomBytes(16).toString("hex");
  token.push(id);
  activeSessions.push({ ...user[0], token: id });
  setTimeout(
    () =>
      res.send({
        status: 200,
        user: { email: user[0].email, name: user[0].name, token: id },
      }),
    2000
  );
});

app.post("/signup", (req, res) => {
  let { email, password, name } = req.body;
  let checkUser = users.filter((user) => user.email === email);
  if (checkUser.length)
    return res.send({
      status: 404,
      message: "User already exist with this credential",
    });
  let user = { email, password, name };
  const id = crypto.randomBytes(16).toString("hex");
  token.push(id);
  users.push({ ...user, token: id });
  setTimeout(
    () =>
      res.send({ status: 200, user: { user: email, name: name, token: id } }),
    2000
  );
});

app.listen(5000, () => {
  console.log("application is up on PORT 5000");
});