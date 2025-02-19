const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser')


const processos = require('./routes/processos.router');
const dashboard = require('./routes/dashboard.router');

require('dotenv/config')



const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api/processos', processos);
app.use('/api/dashboard', dashboard);





mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true } , () => {
    console.log("Connected to DB");
})


app.listen(8080)