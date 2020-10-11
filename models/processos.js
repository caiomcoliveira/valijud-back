const mongoose = require('mongoose')


const Processos = new mongoose.Schema(
    {
        grau: String
    }
    , { strict: false })

module.exports = mongoose.model('processos', Processos, 'processos')

