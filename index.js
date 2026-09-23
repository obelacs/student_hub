import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(express.static("public"));

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
  res.render("auth/login", { error: null });
});
app.get("/signup", (req, res) => {
  res.render("auth/signup", { error: null });
});
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
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

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHash = user.password;

      bcrypt.compare(password, storedHash, function (err, isMatch) {
        if (err) {
          console.error("Error comparing password", err);
          return res
            .status(500)
            .render("auth/login", { error: "Internal server error" });
        } else {
          if (isMatch) {
            res.render("dashboard");
          } else {
            return res.render("auth/login", {
              error: "Incorrect email or password",
            });
          }
        }
      });
    } else {
      return res.render("auth/login", { error: "Incorrect email or password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).render("login", { error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
