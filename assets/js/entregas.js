/**
 * Lógica de entregas e estafetas.
 */
const ESTADOS_ENTREGA = {
  pendente: "Pendente",
  em_transito: "Em trânsito",
  entregue: "Entregue",
  falhada: "Falhada"
};

function obterLabelEntrega(estado) {
  return ESTADOS_ENTREGA[estado] || estado;
}