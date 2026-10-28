/**
 * Funções de validação de dados.
 */
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarTelefone(tel) {
  // Formato moçambicano: 84/85/82/86/87 + 7 dígitos
  const re = /^(8[2-7])[0-9]{7}$/;
  return re.test(tel.replace(/\s/g, ''));
}

function validarCampoObrigatorio(valor) {
  return valor && valor.trim().length > 0;
}