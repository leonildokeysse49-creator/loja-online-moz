/* =========================================================
   VARIÁVEIS GLOBAIS (CACHE DO FIREBASE)
   ========================================================= */
let CACHE_CATEGORIAS = [];
let CACHE_PRODUTOS = [];

/* =========================================================
   HELPERS
   ========================================================= */
function categoriaDe(produto) {
  return CACHE_CATEGORIAS.find(c => c.id === produto.categoriaId);
}

function cardProdutoHTML(produto, delay = 0) {
  const cat = categoriaDe(produto);
  const badge = produto.novo
    ? '<span class="prod-badge">Novo</span>'
    : (produto.destaque ? '<span class="prod-badge" style="background:#2563eb">Destaque</span>' : "");
  const stockTexto = produto.stock === 0
    ? `<span class="prod-stock low"><i class="fa-solid fa-circle-xmark me-1"></i>Esgotado</span>`
    : produto.stock <= 5
      ? `<span class="prod-stock low"><i class="fa-solid fa-triangle-exclamation me-1"></i>Últimas ${produto.stock}</span>`
      : `<span class="prod-stock"><i class="fa-solid fa-check me-1 text-success"></i>Em stock</span>`;

  return `
    <div class="col-6 col-md-4 col-lg-3" data-aos="fade-up" data-aos-delay="${delay}">
      <div class="prod-card">
        <div class="prod-img-wrap">
          ${badge}
          <button class="prod-wish" onclick="event.preventDefault()"><i class="fa-regular fa-heart"></i></button>
          <a href="produto.html?id=${encodeURIComponent(produto.id)}">
            <img src="${produto.imagem}" class="w-100 h-100 object-fit-cover" alt="${produto.nome}" loading="lazy" />
          </a>
        </div>
        <div class="prod-body">
          <span class="prod-cat">${cat ? cat.nome : ""}</span>
          <a href="produto.html?id=${encodeURIComponent(produto.id)}" class="text-decoration-none">
            <h5 class="prod-name">${produto.nome}</h5>
          </a>
          ${stockTexto}
          <div class="prod-price">${formatarMZN(produto.preco)}</div>
          <button class="btn btn-primary btn-add-cart w-100" ${produto.stock === 0 ? "disabled" : ""}
            onclick="adicionarAoCarrinho('${produto.id}', 1); this.innerHTML='<i class=&quot;fa-solid fa-check me-1&quot;></i> Adicionado'">
            <i class="fa-solid fa-cart-plus me-1"></i> ${produto.stock === 0 ? "Esgotado" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* =========================================================
   HOMEPAGE — DESTAQUES (LÊ DO FIREBASE)
   ========================================================= */
async function renderizarProdutosDestaque() {
  const alvo = document.getElementById("grelha-produtos");
  if (!alvo) return;

  try {
    const catSnap = await db.collection("categories").get();
    CACHE_CATEGORIAS = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const prodSnap = await db.collection("products").where("destaque", "==", true).get();
    
    alvo.innerHTML = "";
    if (prodSnap.empty) {
      alvo.innerHTML = "<p class='text-center w-100'>Sem produtos em destaque.</p>";
      return;
    }

    let i = 0;
    prodSnap.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      if (p.ativo) {
        alvo.innerHTML += cardProdutoHTML(p, i * 50);
        i++;
      }
    });

    if (typeof AOS !== "undefined") AOS.refresh();
  } catch (error) {
    console.error("Erro ao carregar destaques:", error);
    alvo.innerHTML = "<p class='text-danger text-center w-100'>Erro ao ligar ao Firebase.</p>";
  }
}

/* =========================================================
   CATÁLOGO — FILTROS + ORDENAÇÃO (LÊ DO FIREBASE)
   ========================================================= */
const EstadoCatalogo = {
  categoria: null,
  subcategoria: null,
  precoMin: null,
  precoMax: null,
  apenasStock: false,
  apenasNovos: false,
  apenasPromo: false,
  ordenar: "relevancia"
};

function renderizarFiltroCategorias() {
  const alvo = document.getElementById("filtro-categorias");
  if (!alvo) return;
  
  alvo.innerHTML = `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="cat-filtro" id="cat-todas" value="" ${!EstadoCatalogo.categoria ? "checked" : ""}>
      <label class="form-check-label" for="cat-todas">Todas as categorias</label>
    </div>
    ${CACHE_CATEGORIAS.map(c => `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="cat-filtro" id="cat-${c.id}" value="${c.id}" ${EstadoCatalogo.categoria === c.id ? "checked" : ""}>
        <label class="form-check-label" for="cat-${c.id}">
          <i class="fa-solid ${c.icone} me-1 text-muted"></i>${c.nome}
        </label>
      </div>
    `).join("")}
  `;
  
  alvo.querySelectorAll('input[name="cat-filtro"]').forEach(inp => {
    inp.addEventListener("change", () => {
      EstadoCatalogo.categoria = inp.value || null;
      EstadoCatalogo.subcategoria = null;
      aplicarCatalogo();
    });
  });
}

function aplicarCatalogo() {
  let lista = CACHE_PRODUTOS.filter(p => p.ativo);

  if (EstadoCatalogo.categoria) {
    lista = lista.filter(p => p.categoriaId === EstadoCatalogo.categoria);
  }
  if (EstadoCatalogo.subcategoria) {
    lista = lista.filter(p => p.subcategoria === EstadoCatalogo.subcategoria);
  }
  if (EstadoCatalogo.precoMin !== null) {
    lista = lista.filter(p => p.preco >= EstadoCatalogo.precoMin);
  }
  if (EstadoCatalogo.precoMax !== null) {
    lista = lista.filter(p => p.preco <= EstadoCatalogo.precoMax);
  }
  if (EstadoCatalogo.apenasStock) {
    lista = lista.filter(p => p.stock > 0);
  }
  if (EstadoCatalogo.apenasNovos) {
    lista = lista.filter(p => p.novo);
  }
  if (EstadoCatalogo.apenasPromo) {
    lista = lista.filter(p => p.precoAntigo && p.precoAntigo > p.preco);
  }

  switch (EstadoCatalogo.ordenar) {
    case "preco-asc": lista.sort((a, b) => a.preco - b.preco); break;
    case "preco-desc": lista.sort((a, b) => b.preco - a.preco); break;
    case "novos": lista.sort((a, b) => (b.novo ? 1 : 0) - (a.novo ? 1 : 0)); break;
    case "nome": lista.sort((a, b) => a.nome.localeCompare(b.nome)); break;
    default: lista.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
  }

  const grelha = document.getElementById("grelha-produtos-catalogo");
  const total = document.getElementById("total-resultados");
  const vazio = document.getElementById("estado-vazio-catalogo");

  if (total) total.textContent = lista.length;
  console.log("🛒 Produtos a desenhar no ecrã:", lista.length);

  if (lista.length === 0) {
    if (grelha) grelha.innerHTML = "";
    if (vazio) vazio.style.display = "block";
    return;
  }
  if (vazio) vazio.style.display = "none";
  
  if (grelha) {
    grelha.innerHTML = lista.map((p, i) => cardProdutoHTML(p, 0)).join(""); // Forçamos o delay a 0 para não haver bugs de invisibilidade
  }

  const crumb = document.getElementById("crumb-categoria");
  if (crumb) {
    const cat = CACHE_CATEGORIAS.find(c => c.id === EstadoCatalogo.categoria);
    crumb.textContent = cat ? (EstadoCatalogo.subcategoria || cat.nome) : "Produtos";
  }

  // OBRIGA as animações a correrem após o HTML ser injetado
  if (typeof AOS !== "undefined") {
    setTimeout(() => { AOS.refresh(); }, 100);
  }
}

function ligarEventosCatalogo() {
  const selOrdenar = document.getElementById("ordenar");
  if (selOrdenar) {
    selOrdenar.addEventListener("change", e => {
      EstadoCatalogo.ordenar = e.target.value;
      aplicarCatalogo();
    });
  }

  const btnPreco = document.getElementById("btn-aplicar-preco");
  if (btnPreco) {
    btnPreco.addEventListener("click", () => {
      const min = parseFloat(document.getElementById("preco-min").value);
      const max = parseFloat(document.getElementById("preco-max").value);
      EstadoCatalogo.precoMin = isNaN(min) ? null : min;
      EstadoCatalogo.precoMax = isNaN(max) ? null : max;
      aplicarCatalogo();
    });
  }

  const checkStock = document.getElementById("filtro-stock");
  if (checkStock) checkStock.addEventListener("change", e => { EstadoCatalogo.apenasStock = e.target.checked; aplicarCatalogo(); });
  const checkNovo = document.getElementById("filtro-novo");
  if (checkNovo) checkNovo.addEventListener("change", e => { EstadoCatalogo.apenasNovos = e.target.checked; aplicarCatalogo(); });
  const checkPromo = document.getElementById("filtro-promo");
  if (checkPromo) checkPromo.addEventListener("change", e => { EstadoCatalogo.apenasPromo = e.target.checked; aplicarCatalogo(); });

  const btnLimpar = document.getElementById("btn-limpar-filtros");
  if (btnLimpar) btnLimpar.addEventListener("click", () => {
    EstadoCatalogo.categoria = null;
    EstadoCatalogo.subcategoria = null;
    EstadoCatalogo.precoMin = null;
    EstadoCatalogo.precoMax = null;
    EstadoCatalogo.apenasStock = false;
    EstadoCatalogo.apenasNovos = false;
    EstadoCatalogo.apenasPromo = false;
    EstadoCatalogo.ordenar = "relevancia";

    const min = document.getElementById("preco-min"); if (min) min.value = "";
    const max = document.getElementById("preco-max"); if (max) max.value = "";
    const chk1 = document.getElementById("filtro-stock"); if (chk1) chk1.checked = false;
    const chk2 = document.getElementById("filtro-novo"); if (chk2) chk2.checked = false;
    const chk3 = document.getElementById("filtro-promo"); if (chk3) chk3.checked = false;
    const sel = document.getElementById("ordenar"); if (sel) sel.value = "relevancia";

    renderizarFiltroCategorias();
    aplicarCatalogo();
  });
}

async function inicializarCatalogo() {
  if (!document.getElementById("grelha-produtos-catalogo")) return;
  
  const grelha = document.getElementById("grelha-produtos-catalogo");
  if (grelha) grelha.innerHTML = "<p class='text-center w-100 py-5'>A carregar catálogo...</p>";

  try {
    const [catSnap, prodSnap] = await Promise.all([
      db.collection("categories").get(),
      db.collection("products").get()
    ]);

    CACHE_CATEGORIAS = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    CACHE_PRODUTOS = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("📦 Total de produtos lidos do Firebase:", CACHE_PRODUTOS.length);

    EstadoCatalogo.categoria = obterParametro("categoria");
    EstadoCatalogo.subcategoria = obterParametro("sub");

    renderizarFiltroCategorias();
    ligarEventosCatalogo();
    aplicarCatalogo();
  } catch (error) {
    console.error("Erro no catálogo:", error);
    if (grelha) grelha.innerHTML = "<p class='text-danger text-center w-100'>Erro ao ligar ao Firebase.</p>";
  }
}

/* =========================================================
   PÁGINA DO PRODUTO (LÊ DO FIREBASE)
   ========================================================= */
async function inicializarPaginaProduto() {
  const area = document.getElementById("area-produto");
  if (!area) return;

  area.innerHTML = "<div class='col-12 text-center py-5'><h3>A carregar produto...</h3></div>";

  const id = obterParametro("id");

  try {
    const doc = await db.collection("products").doc(id).get();
    
    if (!doc.exists) {
      area.innerHTML = `
        <div class="col-12">
          <div class="estado-vazio">
            <i class="fa-solid fa-box-open"></i>
            <h3>Produto não encontrado</h3>
            <a href="produtos.html" class="btn btn-primary mt-3">Ver catálogo</a>
          </div>
        </div>
      `;
      return;
    }

    const produto = { id: doc.id, ...doc.data() };

    const [catDoc, relSnap] = await Promise.all([
      db.collection("categories").doc(produto.categoriaId).get(),
      db.collection("products").where("categoriaId", "==", produto.categoriaId).get()
    ]);

    const cat = catDoc.exists ? catDoc.data() : { nome: "Geral", id: "geral", icone: "fa-box" };
    cat.id = produto.categoriaId;
    CACHE_CATEGORIAS = [cat];

    const crumb = document.getElementById("crumb-produto");
    if (crumb) {
      crumb.innerHTML = `
        <li class="breadcrumb-item"><a href="index.html">Início</a></li>
        <li class="breadcrumb-item"><a href="produtos.html">Produtos</a></li>
        <li class="breadcrumb-item"><a href="produtos.html?categoria=${produto.categoriaId}">${cat.nome}</a></li>
        <li class="breadcrumb-item active">${produto.nome}</li>
      `;
    }

    const precoAntigo = produto.precoAntigo && produto.precoAntigo > produto.preco
      ? `<span class="produto-preco-antigo">${formatarMZN(produto.precoAntigo)}</span>
         <span class="produto-desconto-badge">-${Math.round((1 - produto.preco / produto.precoAntigo) * 100)}%</span>`
      : "";

    let stockHTML = "";
    if (produto.stock === 0) {
      stockHTML = `<div class="produto-stock-alerta esgotado"><i class="fa-solid fa-circle-xmark"></i> Esgotado</div>`;
    } else if (produto.stock <= 5) {
      stockHTML = `<div class="produto-stock-alerta baixo"><i class="fa-solid fa-triangle-exclamation"></i> Apenas ${produto.stock} unidades disponíveis</div>`;
    } else {
      stockHTML = `<div class="produto-stock-alerta ok"><i class="fa-solid fa-circle-check"></i> Em stock (${produto.stock} disponíveis)</div>`;
    }

    const variantesHTML = (produto.variantes || []).map(v => `
      <div class="variante-bloco" data-tipo="${v.tipo}">
        <label>${v.tipo}:</label>
        <div class="variante-opcoes">
          ${v.opcoes.map((op, i) => `
            <button type="button" class="variante-opcao ${i === 0 ? "ativa" : ""}" data-valor="${op}">${op}</button>
          `).join("")}
        </div>
      </div>
    `).join("");

    const galeria = produto.galeria && produto.galeria.length > 0 ? produto.galeria : [produto.imagem];

    area.innerHTML = `
      <div class="col-lg-6" data-aos="fade-right">
        <div class="produto-galeria-principal">
          <img id="img-principal" src="${galeria[0]}" alt="${produto.nome}" class="w-100 h-100 object-fit-cover" />
        </div>
        <div class="produto-galeria-thumbs" id="thumbs-galeria">
          ${galeria.map((img, i) => `
            <button class="${i === 0 ? "ativo" : ""}" data-img="${img}">
              <img src="${img}" alt="" />
            </button>
          `).join("")}
        </div>
      </div>

      <div class="col-lg-6 produto-info" data-aos="fade-left">
        <a href="produtos.html?categoria=${produto.categoriaId}" class="produto-categoria-link">
          <i class="fa-solid ${cat.icone} me-1"></i>${cat.nome}
        </a>
        <h1>${produto.nome}</h1>

        <div class="produto-preco-wrap">
          <span class="produto-preco">${formatarMZN(produto.preco)}</span>
          ${precoAntigo}
        </div>

        ${stockHTML}
        <p class="produto-descricao">${produto.descricao || ''}</p>
        ${variantesHTML}

        <div class="d-flex align-items-center gap-3 mt-3">
          <span class="fw-semibold small text-muted">Quantidade:</span>
          <div class="qty-control">
            <button type="button" id="qty-menos"><i class="fa-solid fa-minus"></i></button>
            <input type="number" id="qty-input" value="1" min="1" max="${produto.stock}" />
            <button type="button" id="qty-mais"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>

        <div class="produto-acoes">
          <button class="btn btn-primary btn-lg" id="btn-adicionar" ${produto.stock === 0 ? "disabled" : ""}>
            <i class="fa-solid fa-cart-plus me-2"></i> Adicionar ao carrinho
          </button>
          <a href="https://wa.me/258853217149?text=${encodeURIComponent('Olá, tenho interesse no produto: ' + produto.nome)}"
             target="_blank" rel="noopener" class="btn btn-outline-success btn-lg">
            <i class="fa-brands fa-whatsapp me-2"></i> Perguntar
          </a>
        </div>

        <div class="produto-meta">
          <div><i class="fa-solid fa-phone"></i> Apoio: <a href="tel:+258853217149">853 217 149</a></div>
          <div><i class="fa-solid fa-envelope"></i> <a href="mailto:Leonildokeysse49@gmail.com">Leonildikeysse49@gmail.com</a></div>
          <div><i class="fa-solid fa-truck-fast"></i> Custo de entrega definido antes de confirmares</div>
          <div><i class="fa-solid fa-mobile-screen-button"></i> M-Pesa, e-Mola ou pagamento na entrega</div>
        </div>
      </div>
    `;

    document.querySelectorAll("#thumbs-galeria button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#thumbs-galeria button").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        document.getElementById("img-principal").src = btn.dataset.img;
      });
    });

    document.querySelectorAll(".variante-opcoes").forEach(grupo => {
      grupo.querySelectorAll(".variante-opcao").forEach(op => {
        op.addEventListener("click", () => {
          grupo.querySelectorAll(".variante-opcao").forEach(o => o.classList.remove("ativa"));
          op.classList.add("ativa");
        });
      });
    });

    const qty = document.getElementById("qty-input");
    document.getElementById("qty-menos").addEventListener("click", () => qty.value = Math.max(1, parseInt(qty.value) - 1));
    document.getElementById("qty-mais").addEventListener("click", () => qty.value = Math.min(produto.stock, parseInt(qty.value) + 1));

    const btnAdd = document.getElementById("btn-adicionar");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => {
        adicionarAoCarrinho(produto.id, parseInt(qty.value) || 1);
        btnAdd.innerHTML = '<i class="fa-solid fa-check me-2"></i> Adicionado!';
        setTimeout(() => btnAdd.innerHTML = '<i class="fa-solid fa-cart-plus me-2"></i> Adicionar ao carrinho', 1500);
      });
    }

    const relAlvo = document.getElementById("grelha-relacionados");
    if (relAlvo) {
      const relDocs = relSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.ativo && p.id !== produto.id).slice(0, 4);
      relAlvo.innerHTML = relDocs.length
        ? relDocs.map((p, i) => cardProdutoHTML(p, i * 50)).join("")
        : '<div class="col-12 text-muted">Sem produtos relacionados.</div>';
    }

    if (typeof AOS !== "undefined") AOS.refresh();

  } catch (error) {
    console.error("Erro no produto:", error);
    area.innerHTML = `<div class='col-12 text-center text-danger py-5'><h3>Erro ao carregar o produto.</h3><p>Verifica a consola (F12).</p></div>`;
  }
}