
const express = require('express');

const Processo = require('../models/processos');
const { isValidProcesso } = require('../utils/Validator');

const router = express.Router();

router.route('/').get((req, res) => {
    Processo.find({}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    })
    .limit(5);
});


router.route('/validar').get( (req, res) => {
    Processo.find({}, function (err, processos) {
        if (err) {
            res.send(err);
        } else {
            let invalidos = 0;
            async.eachSeries(processos, (processo, next) => {
                let isValid = isValidProcesso(processo);
                processo._doc.valid = isValid;
                if (!isValid) {
                    invalidos++;
                }
                let salvar = new Processo(processo)
                salvar.save();
                next();
            }, (err) => {
                if (err) {
                    console.log(err);
                    res.send("Deu bosta");
                }
                res.json({ razao: `${invalidos} inválidos de ${processos.length}` });
            });
        }
    });

});


router.route('/invalidos').get( (req, res) => {
    let query = { "valid": false };
    let page = +req.query.page;
    let limit = +req.query.limit;
    Processo.find(query, async function (err, result) {
        if (err) {
            res.send(err);
        } else {
            let count = await Processo.count(query, function (err, count) {
            });
            res.json({ content: result, totalItems: count, page, limit });
        }
    }).limit(limit).skip((limit) * (page));
})


router.route('/numero/:numero').get((req, res) => {
    Processo.findOne({ "dadosBasicos.numero": req.params['numero'] }, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            result._doc['valid'] = isValidProcesso(result);
            res.json(result);
        }
    });
});



module.exports = router;