const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

let user = {
  id: "qwerty1234567",
  email: "usama@gmail.com",
  password: "us123",
};

const JWT_SECRET = "secretkey";

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/forget-password", (req, res, next) => {
  const { email } = req.body;

  //   check if user exists or not
  if (email !== user.email) {
    return res.status(400).send("User not found");
  }

  //   if user exists create a link (one time so add password)
  const secret = JWT_SECRET + user.password;
  const payload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
  console.log(link);
  res.send("password reset link has been sent to your email");
});

app.get("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;

  if (id !== user.id) {
    return res.status(400).send("Invalid id");
  }

  const secret = JWT_SECRET + user.password;
  try {
    const payload = jwt.verify(token, secret);
    res.status(200).json(payload);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;

  if (id !== user.id) {
    return res.status(400).send("Invalid id");
  }

  const secret = JWT_SECRET + user.password;
  try {
    const payload = jwt.verify(token, secret);
    if (password !== confirmPassword) {
      return res.status(400).send("Password do not match");
    }
    user.password = password;
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.listen(3000, () => console.log("Server is listening on port 3000"));
