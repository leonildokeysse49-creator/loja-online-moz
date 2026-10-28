/**
 * Sistema de notificações (Toasts).
 */
function mostrarNotificacao(mensagem, tipo = "sucesso") {
  // Cria o contentor se não existir
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const bgClass = tipo === "sucesso" ? "bg-success" : (tipo === "erro" ? "bg-danger" : "bg-primary");
  const icone = tipo === "sucesso" ? "fa-check-circle" : (tipo === "erro" ? "fa-circle-xmark" : "fa-info-circle");

  const toastHTML = `
    <div class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fa-solid ${icone} me-2"></i> ${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHTML);
  const toastElement = container.lastElementChild;
  const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
  toast.show();

  // Remove do DOM após esconder
  toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}