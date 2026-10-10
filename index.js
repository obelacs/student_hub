import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = 3000;
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "student_hub",
  password: "password123456789",
  port: 5432,
});
db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    }
  res.render("auth/login", { error: null });
});
app.get("/signup", (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    }
  res.render("auth/signup", { error: null });
});

app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard", {
      user: req.user,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/signup", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT from users where email = $1", [
      email,
    ]);
    if (checkResult.rows.length > 0) {
      return res.render("auth/signup", {
        error: "Email already use, log in instead!",
      });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.err("Error hashing password", err);
          return res
            .status(500)
            .render("auth/signup", { error: "Internal Server Error" });
        } else {
          if (password.length < 8) {
            return res.render("auth/signup", {
              error: "Password should be more than 8 characters",
            });
          } else {
            await db.query(
              "INSERT into users(name, email, password) VALUES($1, $2, $3)",
              [name, email, hash],
            );
            return res.render("dashboard");
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),
);

passport.use(
  new Strategy(async function verify(username, password, cb) {
    console.log(username);

    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHash = user.password;

        bcrypt.compare(password, storedHash, function (err, isMatch) {
          if (err) {
            return cb(err);
          } else {
            if (isMatch) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb(null, false);
      }
    } catch (error) {
      return cb(error);
      
    }
  }),
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
