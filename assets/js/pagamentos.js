/**
 * Lógica de pagamentos.
 */
const METODOS_PAGAMENTO = {
  mpesa: { nome: "M-Pesa", icone: "fa-mobile-screen" },
  emola: { nome: "e-Mola", icone: "fa-mobile-screen" },
  entrega: { nome: "Na entrega", icone: "fa-hand-holding-dollar" }
};

function obterNomeMetodo(id) {
  return METODOS_PAGAMENTO[id] ? METODOS_PAGAMENTO[id].nome : id;
}

// No futuro: Função para chamar a API da M-Pesa
function iniciarPagamentoMpesa(telefone, valor, referencia) {
  console.log(`A iniciar pagamento M-Pesa de ${valor} MZN para o número ${telefone}...`);
  // Aqui entrará a integração com a API (ex: PaySuite, Mpesa API)
}