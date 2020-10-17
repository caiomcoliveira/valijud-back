const mongoose = require('mongoose')


const Processos = new mongoose.Schema(
    {
        
    }
    , { strict: false })

module.exports = mongoose.model('processos', Processos)

