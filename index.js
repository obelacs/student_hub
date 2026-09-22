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
  res.render("auth/login");
});
app.get("/signup", (req, res) => {
  res.render("auth/signup");
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
      return res.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          return res.redirect("/signup")
        } else {
          await db.query(
            "INSERT into users(name, email, password) VALUES($1, $2, $3)",
            [name, email, hash],
          );
          console.log("Success!!")
        }
        
      });
    }

    if (password < 8) {
    } else {
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
