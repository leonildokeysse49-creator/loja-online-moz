document.addEventListener("DOMContentLoaded", () => {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  if (typeof AOS !== "undefined") {
    AOS.init({ once: true, duration: 600, easing: "ease-out-cubic", offset: 60 });
  }

  // Lógica da Navbar Dinâmica
  document.addEventListener("authReady", atualizarNavbarUtilizador);
  setTimeout(atualizarNavbarUtilizador, 500);

  // LOJA PÚBLICA
  if (document.getElementById("grelha-categorias") && typeof renderizarCategoriasHome === "function") renderizarCategoriasHome();
  if (document.getElementById("grelha-produtos") && typeof renderizarProdutosDestaque === "function") renderizarProdutosDestaque();
  if (document.getElementById("lista-categorias") && typeof renderizarPaginaCategorias === "function") renderizarPaginaCategorias();
  if (document.getElementById("grelha-produtos-catalogo") && typeof inicializarCatalogo === "function") inicializarCatalogo();
  if (document.getElementById("area-produto") && typeof inicializarPaginaProduto === "function") inicializarPaginaProduto();
  if (document.getElementById("grelha-pesquisa") && typeof inicializarPesquisa === "function") inicializarPesquisa();
  
  // CARRINHO E CHECKOUT
  if (document.getElementById("lista-carrinho") && typeof renderizarCarrinho === "function") renderizarCarrinho();
  if (typeof atualizarBadgeCarrinho === "function") atualizarBadgeCarrinho();
  if (document.getElementById("form-checkout") && typeof inicializarCheckout === "function") inicializarCheckout();
  if (typeof inicializarAcompanhamento === "function") inicializarAcompanhamento();
  if (typeof inicializarCancelamento === "function") inicializarCancelamento();
});

function atualizarNavbarUtilizador() {
  const area = document.getElementById("navbar-user-area");
  if (!area) return;

  const isSubpasta = window.location.pathname.includes("/conta/") || window.location.pathname.includes("/admin/");
  const prefixo = isSubpasta ? "../" : "";
  const prefixoConta = isSubpasta ? "" : "conta/";
  const prefixoAdmin = isSubpasta ? "../admin/" : "admin/";

  if (typeof utilizadorLogado !== "undefined" && utilizadorLogado !== null) {
    // ALTERAÇÃO AQUI: Mostra "Admin" se for o admin, senão o primeiro nome
    let nomeExibir = utilizadorLogado.nome ? utilizadorLogado.nome.split(" ")[0] : "Cliente";
    const isAdmin = utilizadorLogado.email === "admin@loja.co.mz";
    
    if (isAdmin) nomeExibir = "Admin";

    let adminLink = isAdmin ? `<li><a class="dropdown-item text-primary fw-bold" href="${prefixoAdmin}dashboard.html"><i class="fa-solid fa-shield-halved me-2"></i>Painel Admin</a></li>` : "";

    area.innerHTML = `
      <div class="dropdown">
        <!-- Removido o "btn-icon" para ficar mais compacto -->
        <button class="btn btn-outline-secondary btn-sm dropdown-toggle px-3 rounded-pill" type="button" data-bs-toggle="dropdown">
          <i class="fa-solid fa-user-check me-1"></i> <span class="d-none d-lg-inline">Olá, ${nomeExibir}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li><a class="dropdown-item" href="${prefixoConta}perfil.html"><i class="fa-regular fa-user me-2"></i>Meu Perfil</a></li>
          <li><a class="dropdown-item" href="${prefixoConta}encomendas.html"><i class="fa-solid fa-box me-2"></i>Minhas Encomendas</a></li>
          ${adminLink}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); auth.signOut().then(() => window.location.href='${prefixo}index.html');"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i>Sair</a></li>
        </ul>
      </div>
    `;
  } else {
    area.innerHTML = `
      <a href="${prefixoConta}login.html" class="btn btn-outline-secondary btn-icon">
        <i class="fa-regular fa-user"></i> <span class="d-none d-lg-inline ms-1">Entrar</span>
      </a>
    `;
  }
}