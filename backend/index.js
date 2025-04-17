const express = require('express');
const app = express()
const cors = require("cors");
require("dotenv").config();
const port = 3000;

const database = require('./database/mongoDB');
database.connect();

app.use(cors());
app.use(express.json());


app.get('/',(req, res) => {
    res.send('Trang chủ')
})


app.listen(port , () =>{
    console.log(`App listening on port ${port}`);
})