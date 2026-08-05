const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const databasePath = path.join(__dirname, "polyportal.db");

console.log("CHECKING DATABASE:", databasePath);

const db = new sqlite3.Database(databasePath);

db.get(
    `SELECT *
     FROM users
     WHERE id = 1`,
    [],
    (err, user) => {
        if (err) {
            console.error("READ ERROR:", err.message);
        } else {
            console.log("OWNER DATA:");
            console.log(user);
        }

        db.close();
    }
);