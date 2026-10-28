/**
 * Lógica de gestão de Clientes e Utilizadores.
 * (Atualmente os clientes são lidos indiretamente através das encomendas).
 */
function extrairClientesDasEncomendas(encomendas) {
  const clientes = {};
  encomendas.forEach(enc => {
    const tel = enc.customerSnapshot.telefone;
    if (!clientes[tel]) {
      clientes[tel] = {
        nome: enc.customerSnapshot.nome,
        telefone: tel,
        email: enc.customerSnapshot.email || "N/A",
        numCompras: 0,
        totalGasto: 0
      };
    }
    clientes[tel].numCompras++;
    if (enc.orderStatus !== "cancelada") {
      clientes[tel].totalGasto += (enc.total || enc.subtotal);
    }
  });
  return Object.values(clientes);
}