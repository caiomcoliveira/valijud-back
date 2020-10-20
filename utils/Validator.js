


const moment = require("moment");
const Domain = require("./Domain");

exports.getErrorsProcesso = (processo) => {
    let errors = [];
    errors.push(...isValidNumeroProcessoDigitoVerificador(processo.dadosBasicos.numero)); // digito verificar do processo
    errors.push(...isValidRequiredFields(processo)); // verificar dados obrigatorios
    errors.push(...isValidAssuntoMovimento(processo)); // verificar se tem assunto e/ou movimento
    errors.push(...isValidDataAjuizamento(processo)); // ano da data ajuizamento bate com processo
    errors.push(...isValidDataHoraMovimentos(processo.movimento)); // movimento em ordem descrecente de data
    errors.push(...isValidBaixaJulgamento(processo));
    errors.push(...isValidDomain('Sigilo', Domain.SIGILOS, +processo.dadosBasicos.nivelSigilo));
    errors.push(...isValidDomain('Tribunais', Domain.TRIBUNAIS, processo.siglaTribunal));
    errors.push(...isValidDomain('Grau', Domain.GRAUS, processo.grau));
    errors.push(...isValidDomain('Classe Processual', Domain.CLASSES_PROCESSUAIS, processo.dadosBasicos.classeProcessual));
    errors.push(...isValidDomain('Instância Orgão Julgador', Domain.INSTANCIAS, processo.dadosBasicos.orgaoJulgador.instancia));
    // errors.push(...isValidDomain('Localidade Dados Básicos', Domain.CODIGOS_IBGE, +processo.dadosBasicos.codigoLocalidade));
    errors.push(...isValidDomain('Localidade Orgão Julgador', Domain.CODIGOS_IBGE, +processo.dadosBasicos.orgaoJulgador.codigoMunicipioIBGE));


    return errors;
}





const isValidBaixaJulgamento = (processo) => {
    if (!processo.movimento)
        return [];
    let movimentosCopy = [...processo.movimento]
    movimentosCopy.sort((a, b) => (a.dataHora > b.dataHora) ? -1 : 1);
    let codigosMovimentos = movimentosCopy.map(mov => {
        if (mov.movimentoNacional) {
            return mov.movimentoNacional.codigoNacional
        }
        if (mov.movimentoLocal) {
            return mov.movimentoLocal.codigoPaiNacional
        }
    }
    );
    let baixaIndex = codigosMovimentos.indexOf(Domain.BAIXA_DEFINITIVA);
    if (baixaIndex != -1 && baixaIndex == codigosMovimentos.length - 1) {
        return [{ severity: 'danger', name: 'Processo Baixado sem Julgamento' }]
    }
    if (baixaIndex != -1) {
        if (!Domain.JULGAMENTOS.includes(codigosMovimentos[baixaIndex + 1])) {
            return [{ severity: 'danger', name: 'Processo Baixado sem Julgamento' }]
        }
    }
    return []
}

const isValidDataAjuizamento = (processo) => {
    let date = processo.dadosBasicos.dataAjuizamento;
    let momentDate = null;
    if (typeof date == "string") {
        momentDate = moment(date, "YYYYMMDDHHmm");
    }
    else {
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