
const express = require('express');
const async = require('async')
const Processo = require('../models/processos');


const { isValidProcesso } = require('../utils/Validator');
const ProcessoAntigo = require('../models/ProcessoAntigo');

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


router.route('').post(async (req, res) => {
    pAntesSalvo = await ProcessoAntigo.findOne({ _id: req.body._id });
    if(pAntesSalvo == null){
        pAntes = await Processo.findOne({ _id: req.body._id });
        await ProcessoAntigo.create({ ...req.body }, (err, p) => {
            if(err)
                res.json({message: 'Error ao salvar cópia do processo original'});
        });
    }
    Processo.findOneAndUpdate({ _id: req.body._id }, req.body , {useFindAndModify: false},
        (err, processo) => {
            if (err) {
                res.json({ message: "Não foi possível salvar o processo atualizado" })
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
            res.status(500).json({message: 'Não foi possível encontrar o processo '});
        } else {
            if (processo._doc) {
                processo._doc['isValid'] = isValidProcesso(processo._doc);
            }
            res.json(processo);
        }
    });
});


router.route('/antigo/:numero').get((req, res) => {
    ProcessoAntigo.findOne({ "dadosBasicos.numero": req.params['numero'] }, function (err, processo) {
        if (err) {
            res.status(500).json({message: 'Não foi possível obter o processo Antigo'})
        } else {
            if(processo){
                if (processo._doc) {
                    processo._doc['isValid'] = isValidProcesso(processo._doc);
                }
                res.json(processo);
            }
            else {
                res.status(500).json({message: 'Versão anterior não encontrada.'});
            }
        }
    });
});



router.route('/estatisticas').get(async (req,res) => {
    let stats = [];
    pCount = await Processo.countDocuments({});
    stats.push({icon: 'paper', label: 'Processo Cadastrados', value: pCount});


    

    pCountValid = await Processo.countDocuments({valid: true});
    stats.push({icon: 'paper', label: 'Processo Validados', value: pCountValid});

    pCountInValid = pCount - pCountValid
    stats.push({icon: 'paper', label: 'Processo Inválidos', value: pCountInValid});

    res.json(stats);
});



module.exports = router;