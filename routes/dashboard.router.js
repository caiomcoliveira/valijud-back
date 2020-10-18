const express = require('express');
const Processo = require('../models/processos');
const ProcessoAntigo = require('../models/ProcessoAntigo');
const { count } = require('../models/processos');

const router = express.Router();



const buildChartOptions = (chartData, chartTitle) => {
    return {
        series: [{
            name: 'Nº de Processos',
            data: chartData.map((c) => c.count)
        }],
        chart: {
            height: 350,
            type: 'bar',
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
                endingShape: 'rounded'
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 2
        },

        grid: {
            row: {
                colors: ['#fff', '#f2f2f2']
            }
        },
        xaxis: {
            labels: {
                rotate: -25,
                rotateAlways: true,

            },
            categories: chartData.map((c) => c._id),
            tickPlacement: 'on'
        },
        yaxis: {
            title: {
                text: chartTitle,
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "horizontal",
                shadeIntensity: 0.25,
                gradientToColors: undefined,
                inverseColors: true,
                opacityFrom: 0.85,
                opacityTo: 0.85,
                stops: [50, 0, 100]
            },
        }
    };
}

router.route('/kpis').get(async (req, res) => {
    let stats = [];
    pCount = await Processo.countDocuments({});
    stats.push({ icon: 'paper-add', label: 'Processo Cadastrados', value: pCount });

    pCountInValid = await Processo.countDocuments({ $or: [{ errorsCount: { $gte: 1 } }, { errorsCount: null }]});
    stats.push({ icon: 'paper-times', label: 'Processos Inconsistentes', value: pCountInValid });

    pCountValid = pCount - pCountInValid;
    stats.push({ icon: 'paper-check', label: 'Processos Validados', value: pCountValid });


    res.json(stats);
});

router.route('/graficos/grau').get(async (req, res) => {
    let countData = await Processo.aggregate([{ "$group": { _id: { $toUpper: "$grau" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    res.json(buildChartOptions(countData, 'Processos pro Grau'));
});

router.route('/graficos/classe').get(async (req, res) => {
    let countData = await Processo.aggregate([{ "$group": { _id: "$dadosBasicos.classeProcessual", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    outros = countData.splice(14, countData.length);
    let countOutros = { _id: 'Outros', count: 0 };
    outros.forEach(o => {
        countOutros.count += o.count;
    })
    countData = countData.splice(0, 13);
    res.json(buildChartOptions([...countData, countOutros], 'Processos pro Classe'));
});

router.route('/graficos/instancia').get(async (req, res) => {
    let countData = await Processo.aggregate([{ "$group": { _id: { $toUpper: "$dadosBasicos.orgaoJulgador.instancia" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    res.json(buildChartOptions(countData, 'Processos pro Instância'));
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
                data: pCount.map(p => p.count).slice(0, 20)
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
            categories: pCount.map(p => p._id).slice(0, 20)
        },
    };

    res.json(chartOptions);
});






module.exports = router;