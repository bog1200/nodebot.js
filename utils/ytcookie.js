const ytdl = require("@distube/ytdl-core");
// read the cookie from the file
const fs = require("fs");
const path = require("path");
let cookie = "";
const cookiefile = path.resolve(__dirname, "../ytcookie.json");
if (fs.existsSync(cookiefile)) {
    cookie = fs.readFileSync(cookiefile, "utf8");
    console.log("[BOT] Cookie loaded");
}

const agent = ytdl.createAgent([cookie]);

module.exports = agent;