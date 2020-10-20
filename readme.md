# SOBRE

Este é um backend, desenvolvido em NODE.JS, utilizando express.js
O banco de dados é MONGO DB, conectando no mongo atlas.
As configurações de Conexão podem ser alteradas no arquivo de envirotment (.env)


## Banco
Os arquivos que foram utilizados para uma amostra da base estão em: mini-base-processos.zip.


O script python para importá-los segue no importador.py.

**A base atualmente já está populada e validada.**


## Validação da BASE
Para validar a base foi feito um endpoint que valida de 3 em 3 mil processos, este apenas possui uma rota direita.
A validação é somente feita nos arquivos que foram marcados para validar, ou seja processos que possuem: errorsCount = -1 ou errorsCount = null.
Para marcar todos, execute no mongo:
```
 db.processos.update({errorsCount: null}, {errorsCount: -1}, {multi: true})
```

conexão via mongo shell
```
mongo "mongodb+srv://hackaton.5yjsd.gcp.mongodb.net/valijud" --username hackaton
``` 
Senha: hackaton

(Não se esqueça de popular a base antes.)


```'http://<INSIRAHOSTAKI>:<8080>/api/processos/validar'```


# Como Rodar
```bash
npm install

npm start
```

# Endpoints

## Processos
**GET /api/processos**

Lista os processos de forma paginada, necessário passar os query params de page e limit.

**POST /api/processos**

Cria ou insere processos na base. Caso este já exista, uma cópia dele é salva em uma outra collection do mongo.


**GET /api/processos/validar**

Valida 3 mil procesos que estejam com errorsCount = -1 ou nulo. Retorna quantos processos estão inconsistentes.

**GET /api/processos/invalidos**

Retorna lista de processos que foram analisados e considerados incosistentes, necessário passar os query params de page e limit.


**GET /api/processos/antigo/:id**

Retorna o processo de ID(do mongo) do parametro 


**GET /api/processos/numero/:id**

Retorna o processo anterior a alteração de ID(do mongo) do parametro 


**GET /api/processos/numero/:id**

Retorna o processo anterior a alteração de ID(do mongo) do parametro 

## Dashboard

**GET /api/dashboard/kpis**

Lista os 3 principais KPIS



**GET /api/dashboard/graficos/||grau ou classe ou instancia||**

Monta um dos 3 gráficos agrupadores


# Validação

As validações estarão em utils/Validator.js

Nele se encontra as validações que são feitas para levar ao front-end e também validar na base.


# Importação

Foram importados 1 arquivo json de cada tribunal de cada região. O script python permite a importação de todos, no entanto limitamos a 400mb por conta de armazenamento e fins demonstrativos.

Basta rodar o script python na raiz que tiverem os arquivos JSON