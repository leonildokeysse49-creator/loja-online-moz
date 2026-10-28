const CHAVE_CARRINHO = "loja_carrinho";

function lerCarrinho() { return lerLocal(CHAVE_CARRINHO, []); }
function guardarCarrinho(itens) { guardarLocal(CHAVE_CARRINHO, itens); atualizarBadgeCarrinho(); }

function adicionarAoCarrinho(produtoId, quantidade = 1) {
  const itens = lerCarrinho();
  const ex = itens.find(i => i.produtoId === produtoId);
  if (ex) ex.quantidade += quantidade;
  else itens.push({ produtoId, quantidade });
  guardarCarrinho(itens);
}

function removerDoCarrinho(produtoId) {
  guardarCarrinho(lerCarrinho().filter(i => i.produtoId !== produtoId));
  if (typeof renderizarCarrinho === "function") renderizarCarrinho();
}

function alterarQuantidade(produtoId, delta) {
  const itens = lerCarrinho();
  const item = itens.find(i => i.produtoId === produtoId);
  if (!item) return;
  item.quantidade = Math.max(1, item.quantidade + delta);
  guardarCarrinho(itens);
  if (typeof renderizarCarrinho === "function") renderizarCarrinho();
}

function definirQuantidade(produtoId, qtd) {
  const itens = lerCarrinho();
  const item = itens.find(i => i.produtoId === produtoId);
  if (!item) return;
  item.quantidade = Math.max(1, parseInt(qtd) || 1);
  guardarCarrinho(itens);
  if (typeof renderizarCarrinho === "function") renderizarCarrinho();
}

function contarItensCarrinho() {
  return lerCarrinho().reduce((s, i) => s + i.quantidade, 0);
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById("carrinho-badge");
  if (badge) badge.textContent = contarItensCarrinho();
}

// Função assíncrona para buscar os dados reais do produto ao Firebase
async function obterDadosCarrinho() {
  const itens = lerCarrinho();
  let listaFinal = [];
  let subtotal = 0;
  let numItens = 0;

  for (const item of itens) {
    try {
      const doc = await db.collection("products").doc(item.produtoId).get();
      if (doc.exists) {
        const p = { id: doc.id, ...doc.data() };
        p.quantidade = item.quantidade;
        p.subtotal = p.preco * item.quantidade;
        listaFinal.push(p);
        subtotal += p.subtotal;
        numItens += item.quantidade;
      }
    } catch (e) {
      console.error("Erro ao ler produto do carrinho:", e);
    }
  }
  return { listaFinal, subtotal, numItens };
}

async function renderizarCarrinho() {
  const alvo = document.getElementById("lista-carrinho");
  const resumo = document.getElementById("resumo-carrinho");
  if (!alvo) return;

  const itens = lerCarrinho();
  if (itens.length === 0) {
    alvo.innerHTML = `
      <div class="estado-vazio">
        <i class="fa-solid fa-cart-shopping"></i>
        <h3>O teu carrinho está vazio</h3>
        <p>Explora os produtos e adiciona ao carrinho.</p>
        <a href="produtos.html" class="btn btn-primary mt-2">Ver produtos</a>
      </div>`;
    if (resumo) resumo.style.display = "none";
    return;
  }

  alvo.innerHTML = `<p class="text-center py-4">A carregar o teu carrinho...</p>`;
  
  const { listaFinal, subtotal, numItens } = await obterDadosCarrinho();

  if (listaFinal.length === 0) {
    alvo.innerHTML = `<p class="text-center text-danger">Os produtos no teu carrinho já não existem.</p>`;
    return;
  }

  alvo.innerHTML = `<div class="card-carrinho">${
    listaFinal.map(p => `
      <div class="cart-item">
        <a href="produto.html?id=${p.id}" class="cart-item-img">
          <img src="${p.imagem}" alt="${p.nome}">
        </a>
        <div class="cart-item-info">
          <a href="produto.html?id=${p.id}" class="text-decoration-none">
            <h4>${p.nome}</h4>
          </a>
          <small class="text-muted">${formatarMZN(p.preco)} / unidade</small>
          <div class="d-flex align-items-center gap-2 mt-2 flex-wrap">
            <div class="qty-control">
              <button onclick="alterarQuantidade('${p.id}', -1)"><i class="fa-solid fa-minus"></i></button>
              <input type="number" value="${p.quantidade}" min="1" max="${p.stock}" onchange="definirQuantidade('${p.id}', this.value)">
              <button onclick="alterarQuantidade('${p.id}', 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <button class="btn btn-sm btn-link text-danger text-decoration-none" onclick="removerDoCarrinho('${p.id}')">
              <i class="fa-solid fa-trash-can me-1"></i> Remover
            </button>
          </div>
        </div>
        <div class="cart-item-total">${formatarMZN(p.subtotal)}</div>
      </div>
    `).join("")
  }</div>`;

  if (resumo) {
    resumo.style.display = "block";
    resumo.innerHTML = `
      <div class="resumo-card">
        <h3>Resumo</h3>
        <div class="resumo-linha">
          <span>Subtotal (${numItens} ${numItens === 1 ? "item" : "itens"})</span>
          <strong>${formatarMZN(subtotal)}</strong>
        </div>
        <div class="resumo-linha">
          <span>Custo de entrega</span>
          <span class="text-muted small">Definido pela loja</span>
        </div>
        <hr>
        <div class="resumo-linha total">
          <span>Total parcial</span>
          <strong>${formatarMZN(subtotal)}</strong>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-lg w-100 mt-3">
          <i class="fa-solid fa-lock me-2"></i> Finalizar compra
        </a>
        <a href="produtos.html" class="btn btn-outline-secondary w-100 mt-2">
          Continuar a comprar
        </a>
        <div class="alerta-info-carrinho mt-3">
          <i class="fa-solid fa-circle-info"></i>
          <span>O custo de entrega será definido pela loja e terá de ser aceite por ti antes da confirmação final.</span>
        </div>
      </div>`;
  }
}