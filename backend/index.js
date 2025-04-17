const express = require('express');
const app = express()
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const port = 3000;

const database = require('./database/mongoDB');
database.connect();

const userRoute = require('./routes/indexRoute');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

userRoute(app);


app.listen(port , () =>{
    console.log(`App listening on port ${port}`);
})