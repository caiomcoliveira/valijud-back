const mongoose = require('mongoose')


const ProcessoAntigo = new mongoose.Schema(
    {
        
    }
    , { strict: false })

module.exports = mongoose.model('ProcessoAntigo', ProcessoAntigo)

