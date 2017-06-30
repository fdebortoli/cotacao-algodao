import { create } from 'rung-sdk';
import { OneOf, Double } from 'rung-sdk/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import { path, lt, gt, pipe, cond, equals, contains, __, T, concat } from 'ramda';
import { JSDOM } from 'jsdom';

const request = promisifyAgent(agent, Bluebird);

function render(card_titulo, col1_tit, col1_val, col2_tit, col2_val) {

    return (
		<div style="width:165px; height:125px; box-sizing: border-box; padding: 1px; overflow: hidden; position: absolute; margin: -12px 0 0 -10px; ">

			<div style="width:100%; height:20px; background-color: rgba(255,255,255,0.5); position: relative; z-index:1; ">
				<div style="background: url('http://www.pbanimado.com.br/rung/icon.png') no-repeat center center; background-size: 100%; width:50px; height: 50px; position: absolute; z-index:2; margin: -10px 0 0 54px; border: 3px solid #FFF; -webkit-border-radius: 50%; -moz-border-radius: 50%; border-radius: 50%;"></div>
			</div>

			<div style="font-size:11px; width:96%; line-height: 1.3; text-align: center; padding: 30px 2% 0; ">
				<p style="margin:0; padding: 0; ">{card_titulo}</p>
				<p style="margin:0; padding: 0; ">{col1_tit}: {col1_val}</p>
				<p style="margin:0; padding: 0; ">{col2_tit}: <strong style="text-decoration: underline; ">{col2_val}</strong></p>
			</div>
		</div>
	);


}

function nodeListToArray(dom) {
    return Array.prototype.slice.call(dom, 0);
}

function returnSelector(type, row, cell) {
	const selector = '#content .middle .tables .cotacao:nth-child(1) .table-content table ';
	const selectorTable = type == 'title'
		? `thead > tr > th:nth-child(${cell})`
		: `tbody > tr:nth-child(${row}) > td:nth-child(${cell})`;
	return selector + selectorTable;
}

function main(context, done) {

	const { fonte, condicao, valor } = context.params;

	// variáveis padrão
	var fonte_titulo = '';
	var fonte_link = 'https://www.noticiasagricolas.com.br/cotacoes/algodao/';
	var fonte_data = '#content .middle .tables .cotacao:nth-child(1) .info .fechamento';

	// selector padrão
	var selector = '#content .middle .tables .cotacao:nth-child(1) .table-content table ';

	// variáveis das colunas de busca
	var coluna1_titulo = returnSelector('titulo', '', '1');
	var coluna1_result = returnSelector('result', '1', '1');

	var coluna2_titulo = returnSelector('titulo', '', '2');
	var coluna2_result = returnSelector('result', '1', '2');

	var coluna3_titulo = returnSelector('titulo', '', '3');
	var coluna3_result = returnSelector('result', '1', '3');

	var coluna4_titulo = returnSelector('titulo', '', '4');
	var coluna4_result = returnSelector('result', '1', '4');

	// definindo os valores padrão de exibição
	var fonte_coluna_tit 	= coluna1_titulo;
	var fonte_coluna_res 	= coluna1_result;

	var fonte_preco_tit 	= coluna2_titulo;
	var fonte_preco_res 	= coluna2_result;

	var fonte_variacao_tit 	= coluna3_titulo;
	var fonte_variacao_res 	= coluna3_result;

	// definindo o link de conexão
	const server = pipe(
		cond([
			[equals('Indicador Cepea/Esalq'), () => 'algodao-indicador-cepea-esalq-a-prazo'],
			[equals('Bolsa de Nova Iorque'), () => 'algodao-bolsa-de-nova-iorque-nybot'],
			[contains(__, ['IMEA/Alto Garças', 'IMEA/Campo Novo do Parecis', 'IMEA/Campo Verde', 'IMEA/Diamantino', 'IMEA/Itiquira', 'IMEA/Nova Mutum', 'IMEA/Rondonópolis', 'IMEA/Sorriso']), () => 'algodao-imea'],
			[contains(__, ['Pluma/Sorriso MT', 'Pluma/Oeste da Bahia', 'Pluma/Estado de São Paulo (IEA)']), () => 'algodo-em-pluma-ao-produtor'],
			[contains(__, ['Caroço/Sorriso MT', 'Caroço/Oeste da Bahia']), () => 'caroco-de-algodo'],
			[contains(__, ['Caroço/Biomercado BA', 'Caroço/Biomercado GO', 'Caroço/Biomercado MG', 'Caroço/Biomercado MS', 'Caroço/Biomercado MT', 'Caroço/Biomercado SP', 'Caroço/Biomercado PI']), () => 'caroco-de-algodao-indicadores-de-precos-medios'],
			[equals('Índice Cotlook A'), () => 'indice-cotlook'],
			[T, () => '']
		]),
		concat(fonte_link)
	)(fonte);

	// definindo os valores padrão
	switch (fonte) {

    	case 'Indicador Cepea/Esalq':
    		fonte_titulo		= 'Indicador Cepea/Esalq';
    		break;

    	case 'Bolsa de Nova Iorque':
    		fonte_titulo		= 'Bolsa de Nova Iorque';
			fonte_preco_tit = coluna3_titulo;
			fonte_preco_res = coluna3_result;
			fonte_variacao_tit = coluna4_titulo;
			fonte_variacao_res = coluna4_result;
    		break;

		case 'IMEA/Alto Garças':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
			break;

		case 'IMEA/Campo Novo do Parecis':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'IMEA/Campo Verde':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'IMEA/Diamantino':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'IMEA/Itiquira':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'IMEA/Nova Mutum':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'IMEA/Rondonópolis':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;

		case 'IMEA/Sorriso':
			fonte_titulo		= 'Instituto IMEA - MT';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
			break;

		case 'Pluma/Sorriso MT':
			fonte_titulo		= 'Algodão em Pluma';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
			break;

		case 'Pluma/Oeste da Bahia':
			fonte_titulo		= 'Algodão em Pluma';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Pluma/Estado de São Paulo':
			fonte_titulo		= 'Algodão em Pluma';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Caroço/Sorriso MT':
			fonte_titulo		= 'Caroço de algodão';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
			break;

		case 'Caroço/Oeste da Bahia':
			fonte_titulo		= 'Caroço de algodão';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Caroço/Biomercado BA':
			fonte_titulo		= 'Caroço de algodão - Biomercado';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
			break;

		case 'Caroço/Biomercado GO':
			fonte_titulo		= 'Caroço de algodão - Biomercado';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Caroço/Biomercado MG':
			fonte_titulo		= 'Caroço de algodão - Biomercado';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Caroço/Biomercado MS':
			fonte_titulo		= 'Caroço de algodão - Biomercado';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Caroço/Biomercado MT':
			fonte_titulo		= 'Caroço de algodão - Biomercado';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Caroço/Biomercado SP':
			fonte_titulo		= 'Caroço de algodão - Biomercado';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'Caroço/Biomercado PI':
			fonte_titulo		= 'Caroço de algodão - Biomercado';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;

		case 'Índice Cotlook A':
			fonte_titulo		= 'Índice Cotlook A';
			fonte_preco_tit 	= coluna1_titulo;
			fonte_preco_res 	= coluna1_result;
			fonte_variacao_tit 	= coluna2_titulo;
			fonte_variacao_res 	= coluna2_result;
			break;

	}

	// Obter todo o HTML do site em modo texto
	return request.get(server).then(({ text }) => {

		// Virtualizar o DOM do texto
		const { window } = new JSDOM(text);

		// Converter os dados da tabela para uma lista
		const retorno_data 			= window.document.querySelector(fonte_data).innerHTML;
		const retorno_coluna_tit 	= window.document.querySelector(fonte_coluna_tit).innerHTML;
		const retorno_coluna_res 	= window.document.querySelector(fonte_coluna_res).innerHTML;
		const retorno_preco_tit 	= window.document.querySelector(fonte_preco_tit).innerHTML;
		const retorno_preco_res 	= window.document.querySelector(fonte_preco_res).innerHTML;
		const retorno_variacao_tit 	= window.document.querySelector(fonte_variacao_tit).innerHTML;
		const retorno_variacao_res 	= window.document.querySelector(fonte_variacao_res).innerHTML;

		// arrumando o valor que vem do HTML
		var valorHTML = parseFloat(retorno_preco_res.replace(',', '.'));

		// arrumando o valor que é digitado
		var valorFormatado = valor.toFixed(2);

		// CASOS ESPECIAIS
		if(retorno_coluna_tit == "Data" || fonte == 'Índice Cotlook A'){
			var linha2 = "";
		}else{
			var linha2 = retorno_coluna_tit + ": " + retorno_coluna_res + "\n";
		}

		// formatando comentario
		var comentario = "Algodão " + fonte_titulo + "<hr><br><br>" + retorno_data + "<br>" + linha2 + retorno_preco_tit + ": " + retorno_preco_res + "<br>" + retorno_variacao_tit + ": " + retorno_variacao_res;

		// verificação de maior OU menor
		if ((condicao == 'maior' && valorHTML > valor) || (condicao == 'menor' && valorHTML < valor)) {

			done({
				alerts: {
					[`algodao${fonte_titulo}`] : {
						title: fonte_titulo,
						content: render(fonte_titulo, retorno_coluna_tit, retorno_coluna_res, retorno_preco_tit, retorno_preco_res),
						comment: comentario
					}
				}
			});

		} else {

			done({ alerts: {} });

		}
	})
	.catch(() => done({ alerts: {} }));

}

const lista_fontes = [

	'Indicador Cepea/Esalq',
	'Bolsa de Nova Iorque',
	'IMEA/Alto Garças',
	'IMEA/Campo Novo do Parecis',
	'IMEA/Campo Verde',
	'IMEA/Diamantino',
	'IMEA/Itiquira',
	'IMEA/Nova Mutum',
	'IMEA/Rondonópolis',
	'IMEA/Sorriso',
	'Pluma/Sorriso MT',
	'Pluma/Oeste da Bahia',
	'Pluma/Estado de São Paulo',
	'Caroço/Sorriso MT',
	'Caroço/Oeste da Bahia',
	'Caroço/Biomercado BA',
	'Caroço/Biomercado GO',
	'Caroço/Biomercado MG',
	'Caroço/Biomercado MS',
	'Caroço/Biomercado MT',
	'Caroço/Biomercado SP',
	'Caroço/Biomercado PI',
	'Índice Cotlook A'

];

const params = {
    fonte: {
        description: _('Informe a sigla da fonte que você deseja ser informado: '),
        type: OneOf(lista_fontes),
		required: true
    },
	condicao: {
		description: _('Informe a condição (maior, menor): '),
		type: OneOf(['maior', 'menor']),
		default: 'maior'
	},
	valor: {
		description: _('Informe o valor em reais para verificação: '),
		type: Double,
		required: true
	}
};

export default create(main, {
    params,
    primaryKey: true,
    title: _("Cotação Algodão"),
    description: _("Acompanhe a cotação do algodão em diversas praças."),
	preview: render('Instituto IMEA - MT', 'Praça', 'Rondonópolis', 'Preço Compra (R$/@)', '86,37')
});