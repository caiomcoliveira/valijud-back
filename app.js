const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const processos = require('./routes/processos.router');

require('dotenv/config')



const app = express();

app.use(cors());
app.use('/api/processos', processos);




mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true } , () => {
    console.log("Connected to DB");
})


app.listen(8080)