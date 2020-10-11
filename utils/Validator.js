
exports.isValidProcesso = (processoDoc) => {
    let isValid = isValidNumeroProcessoDigitoVerificador(processoDoc._doc.dadosBasicos.numero)
        && isValidDadosBasicos(processoDoc._doc.dadosBasicos)
        && isValidDataHoraMovimentos(processoDoc._doc.movimento)
        && isValidTribunal(processoDoc._doc.siglaTribunal)
        ;
    return isValid;
}



const isValidDadosBasicos = (dadosBasicos) => {
    let isValid = dadosBasicos.dataAjuizamento != undefined
        && dadosBasicos.dataAjuizamento != undefined
        && dadosBasicos.numero != undefined
        && dadosBasicos.dataAjuizamento != undefined
        && dadosBasicos.classeProcessual != undefined
        && dadosBasicos.nivelSigilo != undefined
        && dadosBasicos.codigoLocalidade != undefined
        && !isNaN(dadosBasicos.codigoLocalidade)

    return isValid;
}

const isValidTribunal = (siglaTribunal) => {
    let siglasValidas = ["STF",
        "CNJ", "STJ", "TST", "TSE", "STM", "TJAC",
        "TJAL", "TJAM", "TJAP", "TJBA", "TJCE", "TJDFT",
        "TJES", "TJGO", "TJMA", "TJMG", "TJMS",  "TJMT", "TJPA", "TJPB", "TJPE", "TJPI", "TJPR", "TJRJ", "TJRN", "TJRO", "TJRR", "TJRS", "TJSC", "TJSE", "TJSP", "TJTO", "TRE-AC",
        "TRE-AL", "TRE-AM", "TRE-AP", "TRE-BA", "TRE-CE", "TRE-DF", "TRE-ES", "TRE-GO", "TRE-MA", "TRE-MG", "TRE-MS", "TRE-MT", "TRE-PA", "TRE-PB", "TRE-PE", "TRE-PI", "TRE-PR", "TRE-RJ", "TRE-RN", "TRE-RO", "TRE-RR", "TRE-RS", "TRE-SC", "TRE-SE", "TRE-SP", "TRE-TO", "TRF1",
        "TRF2", "TRF3", "TRF4", "TRF5", "TRT1", "TRT2", "TRT10",
        "TRT11", "TRT12", "TRT13", "TRT14", "TRT15", "TRT16", "TRT17", "TRT18", "TRT19", "TRT20", "TRT21", "TRT22", "TRT23",
        "TJMMS","TJMMG",
    ]
    return siglasValidas.includes(siglaTribunal);
}


const isValidDataHoraMovimentos = (movimentos) => {
    if (movimentos == null)
        return true;
    let movimentosCopy = [...movimentos]
    movimentosCopy.sort((a, b) => (a.dataHora > b.dataHora) ? 1 : -1);
    for (let i = 0; i < movimentosCopy.length; i++) {
        if (movimentosCopy[i].dataHora != movimentos[i].dataHora)
            return false;
    }
    return true;
}

const isValidNumeroProcessoDigitoVerificador = (numeroProcesso) => {
    const bcmod = (x, y) => {
        const take = 5;
        let mod = '';

        do {
            let a = parseInt(mod + x.substr(0, take));
            x = x.substr(take);
            mod = a % y;
        }
        while (x.length);
        return mod;
    };
    if (numeroProcesso.length < 14 || isNaN(numeroProcesso)) {
        return false;
    }
    const digitoVerificadorExtraido = parseInt(numeroProcesso.substr(-13, 2));

    const vara = numeroProcesso.substr(-4, 4);
    const tribunal = numeroProcesso.substr(-6, 2);
    const ramo = numeroProcesso.substr(-7, 1);
    const anoInicio = numeroProcesso.substr(-11, 4);
    const tamanho = numeroProcesso.length - 13;
    const numeroSequencial = numeroProcesso.substr(0, tamanho).padStart(7, '0');
    const digitoVerificadorCalculado = 98 - bcmod((numeroSequencial + anoInicio + ramo + tribunal + vara + '00'), '97');
    return digitoVerificadorExtraido === digitoVerificadorCalculado;
}