
const express = require('express');
const async = require('async')
const Processo = require('../models/processos');


const { getErrorsProcesso:  getErrorsProcesso, hasAnyErrorsProcesso } = require('../utils/Validator');
const ProcessoAntigo = require('../models/ProcessoAntigo');

const router = express.Router();

// lista os processos paginados
router.route('').get((req, res) => {
    let page = +req.query.page - 1;
    let limit = +req.query.limit;
    let query = req.query.numero ? { "dadosBasicos.numero": { $regex: '.*' + req.query.numero.replace(/[.-]/g, '') + '.*' } } : {}
    Processo.find(query, async function (err, processos) {
        if (err) {
            res.send(err);
        } else {
            let totalItems = await Processo.countDocuments(query);
            processos.forEach(p => {
                p._doc.errors = getErrorsProcesso(p._doc)
            }
            );
            res.json({ content: processos, totalItems, page, limit });
        }
    }).limit(limit).skip(page * limit).sort({"errorsCount": -1});
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
    let errorsCount = getErrorsProcesso(req.body).length;
    let toSave = {...req.body, errorsCount}
    Processo.findOneAndUpdate({ _id: req.body._id }, toSave , {useFindAndModify: false, upsert: true},
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



router.get('/validar', (req, res) => {
    let started = new Date();
    Processo.find({errorsCount: -1}, function (err, processos) {
        if (err) {
            res.send(err);
        } else {
            let invalidos = 0;
            async.each(processos, (processo, next) => {
                let errors = getErrorsProcesso(processo._doc);
                if (errors.length > 0) {
                    invalidos++;
                } 
                Processo.updateOne({_id: processo._id},{$set:{"errorsCount": errors.length}}, (err, p)=> {
                    if(err){
                        console.log(err)
                        res.json({ message: "Não foi possível validar os processos " });
                    }
                    else {
                        next();
                    }
                });                
            }, (err) => {
                if (err) {
                    res.json({ message: "Não foi possível validar os processos " });
                }
                else {
                    let ended = new Date()
                    res.json({ razao: `${invalidos} inconsistentes de ${processos.length}`, time: (ended - started)/1000 });
                }
            });
        }
    }).limit(1000);
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
    Processo.findOne({ "_id": req.params['numero'] }, function (err, processo) {
        if (err) {
            res.status(500).json({message: 'Não foi possível encontrar o processo '});
        } else {
            if (processo._doc) {
                processo._doc['errors'] = getErrorsProcesso(processo._doc);
            }
            res.json(processo);
        }
    });
});





router.route('/antigo/:numero').get((req, res) => {
    ProcessoAntigo.findOne({ "_id": req.params['numero'] }, function (err, processo) {
        if (err) {
            res.status(500).json({message: 'Não foi possível obter o processo Antigo'})
        } else {
            if(processo){
                if (processo._doc) {
                    processo._doc['errors'] = getErrorsProcesso(processo._doc);
                }
                res.json(processo);
            }
            else {
                res.status(500).json({message: 'Versão anterior não encontrada.'});
            }
        }
    });
});




module.exports = router;