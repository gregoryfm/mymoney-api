const express = require('express');
const bodyParser = require('body-parser');
const allowCors = require('./cors')
const queryParserInt = require('express-query-int');

const port = 3003;
const server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(allowCors);
server.use(queryParserInt());

server.listen(port, () => {
  console.log(`backend is running on port ${port}`);
})

module.exports = server;
