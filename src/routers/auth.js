const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;

    // validation of data
    await validateSignUpData(req);

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).send("Email already exist!");
    }

    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    await user.save();
    res.send("Signup successfully!!");
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Wrong email");
    }

    const user = await User.findOne({
      emailId: emailId,
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
      });
      res.send("Login successfully!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", "", {
    expires: new Date(Date.now() - 1000),
    httpOnly: true,
  });
  res.send("Logged out successfully!");
});
module.exports = { authRouter };
