


const moment = require("moment");
const Domain = require("./Domain");

exports.getErrorsProcesso = (processo) => {
    let errors = [];
    errors.push(...isValidNumeroProcessoDigitoVerificador(processo.dadosBasicos.numero));
    errors.push(...isValidRequiredFields(processo));
    errors.push(...isValidAssuntoMovimento(processo));
    errors.push(...isValidDataAjuizamento(processo));
    // errors.push(...isValidDataHoraMovimentos(processo.movimento));
    errors.push(...isValidDomain('Sigilo', Domain.SIGILOS, +processo.dadosBasicos.nivelSigilo));
    errors.push(...isValidDomain('Tribunais', Domain.TRIBUNAIS, processo.siglaTribunal));
    errors.push(...isValidDomain('Grau', Domain.GRAUS, processo.grau));
    errors.push(...isValidDomain('Classe Processual', Domain.CLASSES_PROCESSUAIS, processo.dadosBasicos.classeProcessual));
    errors.push(...isValidDomain('Instância Orgão Julgador', Domain.INSTANCIAS, processo.dadosBasicos.orgaoJulgador.instancia));
    // errors.push(...isValidDomain('Localidade Dados Básicos', Domain.CODIGOS_IBGE, +processo.dadosBasicos.codigoLocalidade));
    // errors.push(...isValidDomain('Localidade Orgão Julgador', Domain.CODIGOS_IBGE, +processo.dadosBasicos.orgaoJulgador.codigoMunicipioIBGE));


    return errors;
}


exports.hasAnyErrorsProcesso = (processo) => {
    if (isValidNumeroProcessoDigitoVerificador(processo.dadosBasicos.numero).length > 0)
        return true;
    if (isValidRequiredFields(processo).length > 0)
        return true;
    if (isValidAssuntoMovimento(processo).length > 0)
        return true;
    if (isValidDataAjuizamento(processo).length > 0)
        return true;    
    if (isValidDomain('Sigilo', Domain.SIGILOS, +processo.dadosBasicos.nivelSigilo).length > 0)
        return true;
    if (isValidDomain('Tribunais', Domain.TRIBUNAIS, processo.siglaTribunal).length > 0)
        return true;
    if (isValidDomain('Grau', Domain.GRAUS, processo.grau).length > 0)
        return true;
    if (isValidDomain('Classe Processual', Domain.CLASSES_PROCESSUAIS, processo.dadosBasicos.classeProcessual).length > 0)
        return true;
    if (isValidDomain('Instância Orgão Julgador', Domain.INSTANCIAS, processo.dadosBasicos.orgaoJulgador.instancia).length > 0)
        return true;
    // if(isValidDomain('Localidade Dados Básicos', Domain.CODIGOS_IBGE, +processo.dadosBasicos.codigoLocalidade).length > 0) 
    // return true;
    // if(isValidDomain('Localidade Orgão Julgador', Domain.CODIGOS_IBGE, +processo.dadosBasicos.orgaoJulgador.codigoMunicipioIBGE).length > 0) 
    // return true;
    // if(isValidDataHoraMovimentos(processo.movimento).length > 0) 
    // return true;


    return false;
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
    if (typeof date == "string"){
        momentDate = moment(date, "YYYYMMDDHHmm");
    }
    else{
        momentDate = moment(date);
    }
    return momentDate.year() == processo.dadosBasicos.numero.substr(9, 4) ? [] : [{ severity: 'danger', name: 'Ano de Ajuizamento não condiz com número do processo.' }]

}


const isValidDomain = (nome, domain, search) => {
    if (typeof search == 'string')
        search = search.toUpperCase();
    if (!domain.includes(search))
        return [{ severity: 'warning', name: `${nome} Fora do domínio` }];
    return [];

}


const isValidRequiredFields = (processo) => {
    let errors = []
    let requiredFields = ['grau', 'siglaTribunal', 'millisInsercao', 'movimento'];
    for (let f of requiredFields) {
        if (processo[f] == undefined) {
            errors.push({ severity: 'danger', name: `${f} está nulo/vazio` })
        }
    }

    let requiredFieldsDadosBasicos = ['dataAjuizamento', 'numero', 'classeProcessual', 'nivelSigilo', 'codigoLocalidade', 'assunto'];
    for (let f of requiredFieldsDadosBasicos) {
        if (processo.dadosBasicos[f] == undefined) {
            errors.push({ severity: 'danger', name: `Dados Básicos ${f} está nulo/vazio` })
        }
    }

    return errors;
}

const isValidAssuntoMovimento = (processo) => {
    let errors = []
    if (processo.dadosBasicos.assunto != undefined && processo.dadosBasicos.assunto.length == 0) {
        errors.push({ severity: 'danger', name: 'Nenhum assunto no processo' })
    }
    if (processo.movimento != undefined && processo.movimento.length == 0) {
        errors.push({ severity: 'danger', name: 'Nenhum movimento no processo' })
    }
    return errors;
}

const isValidDataHoraMovimentos = (movimentos) => {
    if (movimentos == null || movimentos.length == 0)
        return [];
    let movimentosCopy = [...movimentos]
    movimentosCopy.sort((a, b) => (a.dataHora > b.dataHora) ? -1 : 1);
    for (let i = 0; i < movimentosCopy.length; i++) {
        if (movimentosCopy[i].dataHora != movimentos[i].dataHora) {
            return [{ severity: 'warning', name: 'Movimentos fora de ordem' }];
        }
    }

    return [];
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
    return digitoVerificadorExtraido === digitoVerificadorCalculado ? [] : [{ severity: 'danger', name: 'Digito verificador não confere.' }];
}