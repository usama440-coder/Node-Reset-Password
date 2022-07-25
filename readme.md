# Node-Reset-Password

#### Basic Setup

- In production, DB

```
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
app.listen(3000, () => console.log("Server is listening on port 3000"));
```

#### Forget Password link

- Take email from user
- Perform validation
- In secret key, add password to JWT_SECRET so that one time link can be created
- Sign token and generate a link which to be sent to the user's email
  - In our case, just log

```
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
```

#### Get link

- Now when user clicks on the link, you must present it with a form
- Perform all the validation and verify the token then render the page

```
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
```

#### Sending reset password request

- Now take id and token from the link and passwords from user
- Again verify the token
- Update in database

```
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
```
