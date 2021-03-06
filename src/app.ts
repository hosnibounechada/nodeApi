import express from "express";
import path from "path";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler } from "./middlewares";
import authRouter from "./routes/auth";
import passport from "passport";
import jwt from "jsonwebtoken";
import { sendEmailTest } from "./services";

const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(json());

app.get("/sendEmailTest", sendEmailTest);

app.use(
  cookieSession({
    // signed: false, secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY!],
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(currentUser);

app.use("/api/v1/auth", authRouter);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { scope: ["email", "profile"] }),
  function (req, res) {
    const userJwt = jwt.sign(
      {
        id: req.user?.id,
        email: req.user?.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };
    res.send(req.user);
  }
);

app.use(errorHandler);

export default app;
