/**
 * Gestão de permissões de acesso (Roles).
 * No futuro, isto vai ler as "Custom Claims" do Firebase Auth.
 */
function isAdmin() {
  const sessao = lerLocal("loja_admin_sessao");
  return sessao !== null;
}

function isCliente() {
  const sessao = lerLocal("loja_sessao");
  return sessao !== null;
}

function exigirAdmin() {
  if (!isAdmin()) {
    window.location.href = "../admin/login.html";
  }
}