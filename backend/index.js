const express = require('express');
const app = express()
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const startConsumerMongo = require("./kafka/consumer-mongo");
require("dotenv").config();
const port = 4000;

const database = require('./database/mongoDB');
database.connect();

const userRoute = require('./routes/indexRoute');

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 

// start consumer kafka
startConsumerMongo(); 

userRoute(app);


app.listen(port , () =>{
    console.log(`App listening on port ${port}`);
})