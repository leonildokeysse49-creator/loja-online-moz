document.addEventListener("DOMContentLoaded", () => {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  if (typeof AOS !== "undefined") {
    AOS.init({ once: true, duration: 600, easing: "ease-out-cubic", offset: 60 });
  }

  // HOME
  if (document.getElementById("grelha-categorias") && typeof renderizarCategoriasHome === "function") {
    renderizarCategoriasHome();
  }
  if (document.getElementById("grelha-produtos") && typeof renderizarProdutosDestaque === "function") {
    renderizarProdutosDestaque();
  }

  // CATEGORIAS (Página completa)
  if (document.getElementById("lista-categorias") && typeof renderizarPaginaCategorias === "function") {
    renderizarPaginaCategorias();
  }

  // PRODUTOS (Catálogo)
  if (document.getElementById("grelha-produtos-catalogo") && typeof inicializarCatalogo === "function") {
    inicializarCatalogo();
  }

  // PÁGINA DE PRODUTO
  if (document.getElementById("area-produto") && typeof inicializarPaginaProduto === "function") {
    inicializarPaginaProduto();
  }

  // PESQUISA
  if (document.getElementById("grelha-pesquisa") && typeof inicializarPesquisa === "function") {
    inicializarPesquisa();
  }

  // CARRINHO E CHECKOUT
  if (document.getElementById("lista-carrinho") && typeof renderizarCarrinho === "function") {
    renderizarCarrinho();
  }
  if (typeof atualizarBadgeCarrinho === "function") {
    atualizarBadgeCarrinho();
  }
  if (document.getElementById("form-checkout") && typeof inicializarCheckout === "function") {
    inicializarCheckout();
  }

  // ÁREA DO CLIENTE
  if (typeof inicializarLogin === "function") inicializarLogin();
  if (typeof inicializarRegisto === "function") inicializarRegisto();
  if (typeof inicializarPerfil === "function") inicializarPerfil();
  if (typeof inicializarMinhasEncomendas === "function") inicializarMinhasEncomendas();
});