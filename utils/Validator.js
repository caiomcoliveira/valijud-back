


const moment = require("moment");
const Domain = require("./Domain");

exports.isValidProcesso = (processo) => {
    let errors = [];
    // errors.push(...isValidNumeroProcessoDigitoVerificador(processo.dadosBasicos.numero));
    // errors.push(...isValidRequiredFields(processo));
    // errors.push(...isValidDataHoraMovimentos(processo.movimento));
    errors.push(...isValidDataAjuizamento(processo));
    // // fazer validacao serventia
    errors.push(...isValidDomain('Sigilo', Domain.SIGILOS, +processo.dadosBasicos.nivelSigilo));
    errors.push(...isValidDomain('Tribunais', Domain.TRIBUNAIS, processo.siglaTribunal));
    errors.push(...isValidDomain('Grau', Domain.GRAUS, processo.grau));
    errors.push(...isValidDomain('Classe Processual', Domain.CLASSES_PROCESSUAIS, processo.dadosBasicos.classeProcessual));
    errors.push(...isValidDomain('Localidade Dados Básicos', Domain.CODIGOS_IBGE, +processo.dadosBasicos.codigoLocalidade));
    errors.push(...isValidDomain('Localidade Orgão Julgador', Domain.CODIGOS_IBGE, +processo.dadosBasicos.orgaoJulgador.codigoMunicipioIBGE));
    errors.push(...isValidDomain('Instância Orgão Julgador', Domain.INSTANCIAS, processo.dadosBasicos.orgaoJulgador.instancia));


    return errors;
}

const binarySearch = (arr, x, start, end) => {
    if (start > end) return false;
    let mid = Math.floor((start + end) / 2);
    if (arr[mid] === x) return true;
    if (arr[mid] > x)
        return recursiveFunction(arr, x, start, mid - 1);
    else
        return recursiveFunction(arr, x, mid + 1, end);
}


const isValidDataAjuizamento = (processo) => {
    let date = processo.dadosBasicos.dataAjuizamento;
    let momentDate = null;
    if(typeof date == "string")
        momentDate = moment(date, "YYYYMMDDHHmm");
    else
        momentDate = moment(date);
    return momentDate.year() == processo.dadosBasicos.numero.substr(9,4) ? [] : [{severity: 'danger', name: 'Ano de Ajuizamento não condiz com número do processo.'}]
    
}


const isValidDomain = (nome, domain, search) => {
    if(!domain.includes(search))
        return[{severity: 'warning', name: `${nome} Fora do domínio`}];
    return [];
    
}


const isValidRequiredFields = (processo) => {
    let errors = []
    let requiredFields = ['grau', 'siglaTribunal', 'millisInsercao'];
    for (let f of requiredFields) {
        if (processo[f] == undefined){
            errors.push({severity: 'danger', name: `${f} está nulo`})
        }
    }
    
    let requiredFieldsDadosBasicos = ['dataAjuizamento', 'numero', 'classeProcessual', 'nivelSigilo', 'codigoLocalidade'];
    for (let f of requiredFieldsDadosBasicos) {
        if (processo.dadosBasicos[f] == undefined){
            errors.push({severity: 'danger', name: `Dados Básicos ${f} está nulo`})
        }
    }
    return errors;
}


const isValidDataHoraMovimentos = (movimentos) => {
    let ascValid = true;
    let descValid = true;
    if (movimentos == null)
        return true;
    let movimentosCopy = [...movimentos]
    movimentosCopy.sort((a, b) => (a.dataHora > b.dataHora) ? 1 : -1);
    for (let i = 0; i < movimentosCopy.length; i++) {
        if (movimentosCopy[i].dataHora != movimentos[i].dataHora){
            ascValid = false;
        }
    }
    movimentosCopy.reverse();
    for (let i = 0; i < movimentosCopy.length; i++) {
        if (movimentosCopy[i].dataHora != movimentos[i].dataHora){
            descValid = false;
        }
    }
    return ascValid || descValid ? [] : [{severity: 'warning', name: 'Movimentos fora de ordem'}];
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
    return digitoVerificadorExtraido === digitoVerificadorCalculado ? [] : [{severity: 'danger', name: 'Digito verificador não confere.'}];
}