const express = require('express');
const Processo = require('../models/processos');
const ProcessoAntigo = require('../models/ProcessoAntigo');

const router = express.Router();



router.route('cards').get(async (req, res) => {
    let stats = [];
    pCount = await Processo.countDocuments({});
    stats.push({ icon: 'paper', label: 'Processo Cadastrados', value: pCount });

    pCountValid = await Processo.countDocuments({ valid: true });
    stats.push({ icon: 'paper', label: 'Processo Validados', value: pCountValid });

    pCountInValid = pCount - pCountValid
    stats.push({ icon: 'paper', label: 'Processo Inválidos', value: pCountInValid });

    res.json(stats);
});


router.route('/graficos/processos-por-tribunal').get(async (req, res) => {
    let pCount = await Processo.aggregate([{ "$group": { _id: "$siglaTribunal", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    let chartOptions = {
        plotOptions: {
            bar: {
                horizontal: false,
                startingShape: 'flat',
                endingShape: 'flat',
                columnWidth: '50%',
                barHeight: '50%',
                distributed: false,
                rangeBarOverlap: true,
                rangeBarGroupRows: false,
                dataLabels: {
                    position: 'top',
                    maxItems: 100,
                    hideOverflowingLabels: true,
                    orientation: 'horizontal'
                }
            }
        },
        series: [
            {
                name: "Nº Processos",
                data: pCount.map(p=>p.count).slice(0,20)
            }
        ],
        chart: {
            zoom: {
                enabled: true,
                type: 'x',  
                autoScaleYaxis: true,  
                zoomedArea: {
                  fill: {
                    color: '#90CAF9',
                    opacity: 0.4
                  },
                  stroke: {
                    color: '#0D47A1',
                    opacity: 0.4,
                    width: 1
                  }
                }
            },
            height: 350,
            type: "bar"
        },
        title: {
            text: "Processos Por Tribunais"
        },
        xaxis: {
            tickPlacement: 'on',
            categories: pCount.map(p=>p._id).slice(0,20)
        },       
    };

    res.json(chartOptions);
});






module.exports = router;