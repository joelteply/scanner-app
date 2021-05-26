const http = require("http");
const express = require('express');
const server = express();
require('dotenv').config({ path: server.get('env') === "development" ? ".env.development" : ".env.production" });

/* All remaining requests return the React app, so it can handle routing. */
server.get("/*", function (req, res) {
    res.send("ping back")
});

http.createServer(server).listen(process.env.PORT | "3000")
