const mongoose = require('mongoose')


const ProcessoValidado = new mongoose.Schema(
    {
        grau: String
    }
    , { strict: false })

module.exports = mongoose.model('ProcessoValidado', ProcessoValidado)

