
const express = require('express');
const async = require('async')
const Processo = require('../models/processos');


const { isValidProcesso } = require('../utils/Validator');
const ProcessoValidado = require('../models/ProcessoValidado');

const router = express.Router();

// lista os processos paginados
router.route('').get((req, res) => {
    let page = +req.query.page - 1;
    let limit = +req.query.limit;
    let query = req.query.numero ? { "dadosBasicos.numero": { $regex: '.*' + req.query.numero + '.*' } } : {}
    Processo.find(query, async function (err, processos) {
        if (err) {
            res.send(err);
        } else {
            let totalItems = await Processo.countDocuments(query);
            processos.forEach(p => {
                p._doc.errors = isValidProcesso(p._doc)
            }
            );
            res.json({ content: processos, totalItems, page, limit });
        }
    }).limit(limit).skip(page * limit);
});


router.route('').post((req, res) => {
    ProcessoValidado.findOneAndUpdate({ _id: req.body._id }, req.body, { useFindAndModify: false, upsert: true, new: true },
        (err, processo) => {
            if (err) {
                res.json({ message: "Não foi possível salvar o processo" })
            }
            else {
                res.json(processo);
            }
        }
    );

});



router.get('validar', (req, res) => {

    Processo.find({}, function (err, processos) {
        if (err) {
            res.send(err);
        } else {
            let invalidos = 0;
            async.eachSeries(processos, (processo, next) => {
                let isValid = isValidProcesso(processo._doc);
                processo._doc.isValid = isValid;
                if (!isValid) {
                    invalidos++;
                }
                let salvar = new Processo(processo)
                salvar.save();
                next();
            }, (err) => {
                if (err) {
                    res.json({ message: "Não foi possível validar os processos " });
                }
                res.json({ razao: `${invalidos} inválidos de ${processos.length}` });
            });
        }
    }).limit(10);
});


router.get('invalidos', (req, res) => {
    let query = { "valid": false };
    let page = +req.query.page;
    let limit = +req.query.limit;
    Processo.find(query, async function (err, result) {
        if (err) {
            res.send(err);
        } else {
            let count = await Processo.countDocuments(query, function (err, count) {
            });
            res.json({ content: result, totalItems: count, page, limit });
        }
    }).limit(limit).skip((limit) * (page));
})


router.route('/numero/:numero').get((req, res) => {
    Processo.findOne({ "dadosBasicos.numero": req.params['numero'] }, function (err, processo) {
        if (err) {
            res.send(err);
        } else {
            if (processo._doc) {
                processo._doc['isValid'] = isValidProcesso(processo._doc);
            }
            res.json(processo);
        }
    });
});




module.exports = router;