// ==========================================
// AUTENTICAÇÃO DO ADMIN (FIREBASE)
// ==========================================

// Verifica se o utilizador logado é o admin oficial
async function protegerAdmin() {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
      // Verifica se o utilizador existe e se o e-mail é o do admin
      if (user && user.email === "admin@loja.co.mz") {
        resolve();
      } else {
        // Se não for o admin, redireciona para o login
        const isSubpasta = window.location.pathname.split("/admin/")[1]?.includes("/");
        window.location.href = isSubpasta ? "../login.html" : "login.html";
        reject("Acesso negado");
      }
    });
  });
}

// Termina a sessão no Firebase e redireciona
function terminarSessaoAdmin() {
  auth.signOut().then(() => {
    window.location.href = "../login.html";
  });
}

function renderizarSidebarAdmin() {
  const alvo = document.getElementById("admin-sidebar");
  if (!alvo) return;

  const path = window.location.pathname;
  let ativo = "";

  if (path.includes("dashboard")) ativo = "dashboard";
  if (path.includes("vendas/")) ativo = "encomendas";
  if (path.includes("catalogo/produtos") || path.includes("catalogo/novo-produto") || path.includes("catalogo/editar-produto")) ativo = "produtos";
  if (path.includes("catalogo/categorias") || path.includes("catalogo/nova-categoria") || path.includes("catalogo/editar-categoria") || path.includes("catalogo/subcategorias")) ativo = "categorias";
  if (path.includes("stock/")) ativo = "stock";
  if (path.includes("entregas/")) ativo = "entregas";
  if (path.includes("clientes/")) ativo = "clientes";
  if (path.includes("utilizadores/")) ativo = "utilizadores";
  if (path.includes("relatorios/")) ativo = "relatorios";
  if (path.includes("configuracoes/")) ativo = "config";
  if (path.includes("suporte/")) ativo = "suporte";

  const isSubpasta = path.split("/admin/")[1]?.includes("/");
  const caminhoBase = isSubpasta ? "../" : "";
  const linkLoja = isSubpasta ? "../../index.html" : "../index.html";

  const links = [
    { cat: "Principal", href: "dashboard.html", icone: "fa-chart-line", label: "Dashboard", id: "dashboard" },
    { cat: "Vendas", href: "vendas/encomendas.html", icone: "fa-shopping-bag", label: "Encomendas", id: "encomendas" },
    { cat: "Catálogo", href: "catalogo/produtos.html", icone: "fa-box", label: "Produtos", id: "produtos" },
    { cat: "Catálogo", href: "catalogo/categorias.html", icone: "fa-tags", label: "Categorias", id: "categorias" },
    { cat: "Logística", href: "stock/index.html", icone: "fa-warehouse", label: "Stock", id: "stock" },
    { cat: "Logística", href: "entregas/index.html", icone: "fa-truck-fast", label: "Entregas", id: "entregas" },
    { cat: "Utilizadores", href: "clientes/index.html", icone: "fa-users", label: "Clientes", id: "clientes" },
    { cat: "Utilizadores", href: "utilizadores/index.html", icone: "fa-user-shield", label: "Utilizadores", id: "utilizadores" },
    { cat: "Sistema", href: "relatorios/index.html", icone: "fa-file-invoice", label: "Relatórios", id: "relatorios" },
    { cat: "Sistema", href: "configuracoes/geral.html", icone: "fa-gear", label: "Configurações", id: "config" },
    { cat: "Sistema", href: "suporte/index.html", icone: "fa-headset", label: "Suporte", id: "suporte" }
  ];

  let html = `<a href="${caminhoBase}dashboard.html" class="brand"><i class="fa-solid fa-bag-shopping"></i> Admin</a><div class="admin-nav">`;
  let catAtual = "";
  
  links.forEach(l => {
    if (l.cat !== catAtual) { catAtual = l.cat; html += `<div class="admin-nav-cat">${catAtual}</div>`; }
    let isActive = ativo === l.id;
    html += `<a href="${caminhoBase}${l.href}" class="${isActive ? "active" : ""}"><i class="fa-solid ${l.icone}"></i> ${l.label}</a>`;
  });

  html += `
      <div class="mt-4 pt-3 border-top border-secondary border-opacity-25">
        <a href="${linkLoja}" target="_blank"><i class="fa-solid fa-globe"></i> Ver Loja</a>
        <a href="#" onclick="event.preventDefault(); terminarSessaoAdmin();" class="text-danger"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sair</a>
      </div>
    </div>`;
  alvo.innerHTML = html;
}

// MOTOR CENTRAL
async function inicializarAdmin() {
  console.log("🔄 A verificar permissões de Admin...");
  
  try {
    // Espera o Firebase confirmar se o utilizador está logado e é o admin
    await protegerAdmin(); 
    console.log("✅ Acesso autorizado. A carregar interface...");
  } catch (e) {
    return; // Para a execução se não for admin
  }

  renderizarSidebarAdmin();
  
  const path = window.location.pathname;
  const content = document.querySelector(".admin-content");

  if (path.includes("dashboard.html")) inicializarDashboard();
  else if (path.includes("vendas/encomendas.html")) inicializarAdminEncomendas();
  else if (path.includes("vendas/detalhes-encomenda.html")) inicializarAdminDetalhesEncomenda();
  else if (path.includes("catalogo/produtos.html")) inicializarAdminProdutos();
  else if (path.includes("catalogo/novo-produto.html")) inicializarNovoProduto();
  else if (path.includes("catalogo/editar-produto.html")) inicializarEditarProduto();
  else if (path.includes("catalogo/categorias.html")) inicializarAdminCategorias();
  else if (path.includes("catalogo/subcategorias.html")) inicializarSubcategorias();
  else if (path.includes("catalogo/editar-categoria.html")) inicializarEditarCategoria();
  else if (path.includes("catalogo/nova-categoria.html")) { /* Formulário já no HTML */ }
  else if (path.includes("stock/index.html")) inicializarAdminStock();
  else if (path.includes("entregas/index.html")) inicializarAdminEntregas();
  else if (path.includes("clientes/index.html")) inicializarAdminClientes();
  else if (path.includes("utilizadores/index.html")) inicializarAdminUtilizadores();
  else if (path.includes("configuracoes/geral.html")) inicializarAdminConfigGeral();
  else {
    if (content && !content.hasChildNodes()) {
      content.innerHTML = `<div class="d-flex align-items-center justify-content-center" style="min-height: 60vh;"><div class="text-center"><i class="fa-solid fa-person-digging text-muted mb-3" style="font-size: 4rem;"></i><h2 class="fw-bold">Módulo em Construção</h2></div></div>`;
    }
  }
}

window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    inicializarAdmin();
  }
});

// ==========================================
// PRODUTOS
// ==========================================
async function carregarCategoriasSelect() {
  const select = document.getElementById("prod-categoria");
  if (!select) return;
  try {
    const snapshot = await db.collection("categories").get();
    select.innerHTML = '<option value="">Selecione uma categoria...</option>';
    snapshot.forEach(doc => { 
      select.innerHTML += `<option value="${doc.id}">${doc.data().nome}</option>`; 
    });
  } catch (err) { console.error("Erro ao carregar categorias:", err); }
}

function toggleTipoImagem() {
  const tipo = document.querySelector('input[name="tipo-imagem"]:checked').value;
  if (tipo === "url") {
    document.getElementById("div-imagem-url").style.display = "block";
    document.getElementById("div-imagem-upload").style.display = "none";
  } else {
    document.getElementById("div-imagem-url").style.display = "none";
    document.getElementById("div-imagem-upload").style.display = "block";
  }
}

async function processarImagem() {
  const tipo = document.querySelector('input[name="tipo-imagem"]:checked').value;
  if (tipo === "url") {
    return document.getElementById("prod-imagem-url").value.trim();
  } else {
    const file = document.getElementById("prod-imagem-file").files[0];
    if (!file) {
      const urlAtual = document.getElementById("prod-imagem-url").value.trim();
      if (urlAtual) return urlAtual;
      throw new Error("Seleciona uma imagem para upload.");
    }
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child('produtos/' + Date.now() + '_' + file.name).put(file);
    await uploadTask;
    return await uploadTask.snapshot.ref.getDownloadURL();
  }
}

function inicializarNovoProduto() {
  carregarCategoriasSelect();
  const urlInput = document.getElementById("prod-imagem-url");
  if (urlInput) urlInput.value = "";
}

async function salvarNovoProduto(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A guardar...';
  try {
    const urlImagem = await processarImagem();
    await db.collection("products").add({
      nome: document.getElementById("prod-nome").value.trim(),
      preco: parseFloat(document.getElementById("prod-preco").value),
      precoAntigo: document.getElementById("prod-precoAntigo").value ? parseFloat(document.getElementById("prod-precoAntigo").value) : null,
      categoriaId: document.getElementById("prod-categoria").value,
      stock: parseInt(document.getElementById("prod-stock").value),
      descricao: document.getElementById("prod-descricao").value.trim(),
      imagem: urlImagem,
      ativo: document.getElementById("prod-ativo").checked,
      destaque: document.getElementById("prod-destaque").checked,
      novo: document.getElementById("prod-novo").checked,
      createdAt: new Date().toISOString()
    });
    alert("Produto criado!"); window.location.href = "produtos.html";
  } catch (err) { alert(err.message || "Erro ao criar."); btn.disabled = false; }
}

async function inicializarEditarProduto() {
  console.log("A carregar dados para edição...");
  await carregarCategoriasSelect();
  
  const id = obterParametro("id");
  if (!id) return window.location.href = "produtos.html";
  
  try {
    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists) return alert("Produto não encontrado.");
    const p = doc.data();
    
    document.getElementById("prod-id").value = id;
    document.getElementById("prod-nome").value = p.nome;
    document.getElementById("prod-preco").value = p.preco;
    document.getElementById("prod-precoAntigo").value = p.precoAntigo || "";
    document.getElementById("prod-stock").value = p.stock;
    document.getElementById("prod-descricao").value = p.descricao || "";
    document.getElementById("prod-imagem-url").value = p.imagem || "";
    document.getElementById("prod-categoria").value = p.categoriaId;
    
    document.getElementById("radio-url").checked = true;
    toggleTipoImagem();
    
    document.getElementById("prod-ativo").checked = p.ativo !== false;
    document.getElementById("prod-destaque").checked = p.destaque === true;
    document.getElementById("prod-novo").checked = p.novo === true;
  } catch (err) { console.error("Erro ao carregar produto:", err); }
}

async function atualizarProduto(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = 'A atualizar...';
  try {
    const id = document.getElementById("prod-id").value;
    const urlImagem = await processarImagem();
    
    await db.collection("products").doc(id).update({
      nome: document.getElementById("prod-nome").value.trim(),
      preco: parseFloat(document.getElementById("prod-preco").value),
      precoAntigo: document.getElementById("prod-precoAntigo").value ? parseFloat(document.getElementById("prod-precoAntigo").value) : null,
      categoriaId: document.getElementById("prod-categoria").value,
      stock: parseInt(document.getElementById("prod-stock").value),
      descricao: document.getElementById("prod-descricao").value.trim(),
      imagem: urlImagem,
      ativo: document.getElementById("prod-ativo").checked,
      destaque: document.getElementById("prod-destaque").checked,
      novo: document.getElementById("prod-novo").checked,
      updatedAt: new Date().toISOString()
    });
    alert("Produto atualizado!"); window.location.href = "produtos.html";
  } catch (err) { alert(err.message || "Erro ao atualizar."); btn.disabled = false; }
}

async function inicializarAdminProdutos() {
  const tbody = document.getElementById("tabela-produtos");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='4' class='text-center py-4'>A carregar produtos...</td></tr>";

  try {
    const snapshot = await db.collection("products").get();
    tbody.innerHTML = "";

    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='4' class='text-center text-muted py-4'>Nenhum produto registado.</td></tr>";
      return;
    }

    snapshot.forEach(doc => {
      const p = doc.data();
      tbody.innerHTML += `
        <tr>
          <td><div class="d-flex gap-3 align-items-center"><img src="${p.imagem || 'https://via.placeholder.com/40'}" width="40" height="40" class="rounded object-fit-cover"><div><div class="fw-bold">${p.nome}</div><small>${p.categoriaId}</small></div></div></td>
          <td>${formatarMZN(p.preco)}</td>
          <td><span class="badge bg-${p.stock > 0 ? "success" : "danger"}">${p.stock} un.</span></td>
          <td class="text-end">
            <a href="editar-produto.html?id=${doc.id}" class="btn btn-sm btn-outline-warning" title="Editar"><i class="fa-solid fa-pen"></i></a>
            <button class="btn btn-sm btn-outline-danger" onclick="apagarProduto('${doc.id}')" title="Apagar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`;
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Erro: ${err.message}</td></tr>`;
  }
}

async function apagarProduto(id) {
  if (!confirm("Tens a certeza que queres apagar este produto?")) return;
  try {
    await db.collection("products").doc(id).delete();
    alert("Produto apagado!");
    window.location.reload();
  } catch (err) { alert("Erro ao apagar."); }
}

// ==========================================
// CATEGORIAS E SUBCATEGORIAS
// ==========================================
async function inicializarAdminCategorias() {
  const tbody = document.getElementById("tabela-categorias");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='4' class='text-center py-4'>A carregar...</td></tr>";
  try {
    const snapshot = await db.collection("categories").get();
    tbody.innerHTML = "";
    snapshot.forEach(doc => {
      const c = doc.data();
      tbody.innerHTML += `
        <tr>
          <td><i class="fa-solid ${c.icone} me-2"></i> <strong>${c.nome}</strong></td>
          <td><span class="badge bg-secondary">${doc.id}</span></td>
          <td>${c.subcategorias ? c.subcategorias.length : 0}</td>
          <td class="text-end">
            <a href="subcategorias.html?cat=${doc.id}" class="btn btn-sm btn-outline-primary" title="Ver"><i class="fa-solid fa-eye"></i></a>
            <a href="editar-categoria.html?id=${doc.id}" class="btn btn-sm btn-outline-warning" title="Editar"><i class="fa-solid fa-pen"></i></a>
            <button class="btn btn-sm btn-outline-danger" onclick="apagarCategoria('${doc.id}')" title="Apagar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`;
    });
  } catch (err) { tbody.innerHTML = "<tr><td colspan='4' class='text-danger text-center'>Erro ao carregar.</td></tr>"; }
}

async function salvarNovaCategoria(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A guardar...';
  try {
    const novaCategoria = {
      nome: document.getElementById("cat-nome").value.trim(),
      icone: document.getElementById("cat-icone").value.trim() || "fa-tags",
      descricao: document.getElementById("cat-descricao").value.trim(),
      subcategorias: [],
      createdAt: new Date().toISOString()
    };
    const id = slugificar(novaCategoria.nome);
    await db.collection("categories").doc(id).set(novaCategoria);
    alert("Categoria criada com sucesso!"); window.location.href = "categorias.html";
  } catch (err) { alert("Erro ao criar."); btn.disabled = false; }
}

async function inicializarEditarCategoria() {
  const id = obterParametro("id");
  if (!id) return window.location.href = "categorias.html";
  try {
    const doc = await db.collection("categories").doc(id).get();
    if (!doc.exists) return alert("Categoria não encontrada.");
    const c = doc.data();
    document.getElementById("cat-id").value = id;
    document.getElementById("cat-nome").value = c.nome;
    document.getElementById("cat-icone").value = c.icone;
    document.getElementById("cat-descricao").value = c.descricao || "";
  } catch (err) { console.error(err); }
}

async function salvarEdicaoCategoria(e) {
  e.preventDefault();
  const id = document.getElementById("cat-id").value;
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = 'A atualizar...';
  try {
    await db.collection("categories").doc(id).update({
      nome: document.getElementById("cat-nome").value.trim(),
      icone: document.getElementById("cat-icone").value.trim(),
      descricao: document.getElementById("cat-descricao").value.trim(),
      updatedAt: new Date().toISOString()
    });
    alert("Categoria atualizada!"); window.location.href = "categorias.html";
  } catch (err) { alert("Erro ao atualizar."); btn.disabled = false; }
}

async function apagarCategoria(id) {
  if (!confirm("Tens a certeza que queres apagar esta categoria?")) return;
  try {
    await db.collection("categories").doc(id).delete();
    alert("Categoria apagada!"); window.location.reload();
  } catch (err) { alert("Erro ao apagar."); }
}

async function inicializarSubcategorias() {
  const catId = obterParametro("cat");
  if (!catId) return window.location.href = "categorias.html";

  const doc = await db.collection("categories").doc(catId).get();
  if (!doc.exists) return alert("Categoria não encontrada.");
  const cat = doc.data();
  
  document.getElementById("titulo-categoria").textContent = "Subcategorias de: " + cat.nome;
  document.getElementById("cat-id-hidden").value = catId;

  const renderizarLista = (subcats) => {
    const tbody = document.getElementById("tabela-subcategorias");
    if (!subcats || subcats.length === 0) {
      tbody.innerHTML = "<tr><td colspan='2' class='text-center text-muted'>Nenhuma subcategoria.</td></tr>";
      return;
    }
    tbody.innerHTML = subcats.map((sub, index) => `
      <tr>
        <td>${sub}</td>
        <td class="text-end"><button class="btn btn-sm btn-outline-danger" onclick="apagarSubcategoria('${catId}', ${index})"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `).join("");
  };

  renderizarLista(cat.subcategorias);
}

async function adicionarSubcategoria(e) {
  e.preventDefault();
  const catId = document.getElementById("cat-id-hidden").value;
  const novaSub = document.getElementById("nova-sub-nome").value.trim();
  if (!novaSub) return;

  try {
    const doc = await db.collection("categories").doc(catId).get();
    let subs = doc.data().subcategorias || [];
    if (!subs.includes(novaSub)) {
      subs.push(novaSub);
      await db.collection("categories").doc(catId).update({ subcategorias: subs });
      document.getElementById("nova-sub-nome").value = "";
      window.location.reload();
    } else {
      alert("Esta subcategoria já existe.");
    }
  } catch (err) { alert("Erro ao adicionar."); }
}

async function apagarSubcategoria(catId, index) {
  if (!confirm("Apagar esta subcategoria?")) return;
  try {
    const doc = await db.collection("categories").doc(catId).get();
    let subs = doc.data().subcategorias || [];
    subs.splice(index, 1);
    await db.collection("categories").doc(catId).update({ subcategorias: subs });
    window.location.reload();
  } catch (err) { alert("Erro ao apagar."); }
}

// ==========================================
// DASHBOARD, ENCOMENDAS, STOCK, ENTREGAS, CLIENTES, CONFIG...
// ==========================================
async function inicializarDashboard() {
  const content = document.querySelector(".admin-content");
  if (!content || !document.getElementById("stat-total-encomendas")) return;
  try {
    const snapshot = await db.collection("orders").get();
    let enc = [];
    snapshot.forEach(doc => enc.push(doc.data()));
    const pendentes = enc.filter(e => e.orderStatus !== "entregue" && e.orderStatus !== "cancelada").length;
    let receita = 0;
    enc.forEach(e => { if (e.paymentStatus === "pago" && e.orderStatus !== "cancelada") receita += e.total || e.subtotal; });
    document.getElementById("stat-total-encomendas").textContent = enc.length;
    document.getElementById("stat-pendentes").textContent = pendentes;
    document.getElementById("stat-receita").textContent = formatarMZN(receita);
    const tbody = document.getElementById("ultimas-encomendas");
    if (tbody) {
      tbody.innerHTML = enc.slice(-5).reverse().map(e => {
        const st = STATUS_LABEL[e.orderStatus] || { texto: e.orderStatus, cor: "secondary" };
        return `<tr><td><strong>${e.orderNumber}</strong></td><td>${e.customerSnapshot.nome}</td><td>${e.total ? formatarMZN(e.total) : "Aguarda"}</td><td><span class="badge bg-${st.cor}">${st.texto}</span></td></tr>`;
      }).join("");
    }
  } catch (err) { console.error(err); }
}

async function inicializarAdminEncomendas() {
  const tbody = document.getElementById("tabela-encomendas");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">A carregar...</td></tr>`;
  try {
    const snapshot = await db.collection("orders").get();
    if (snapshot.empty) { tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Sem encomendas.</td></tr>`; return; }
    tbody.innerHTML = "";
    snapshot.forEach(doc => {
      const e = doc.data();
      const st = STATUS_LABEL[e.orderStatus] || { texto: e.orderStatus, cor: "secondary" };
      let acao = `<a href="detalhes-encomenda.html?num=${e.orderNumber}" class="btn btn-sm btn-outline-primary">Detalhes</a>`;
      if (e.orderStatus === "aguardando_custo_entrega") acao = `<button class="btn btn-sm btn-warning fw-bold" onclick="abrirModalCusto('${e.orderNumber}')"><i class="fa-solid fa-truck-fast"></i> Definir Entrega</button>`;
      else if (e.orderStatus === "aguardando_aceitacao_total") acao = `<span class="badge bg-info text-dark">Aguarda cliente</span>`;
      tbody.innerHTML += `<tr><td><strong>${e.orderNumber}</strong><br><small>${new Date(e.createdAt).toLocaleDateString("pt-MZ")}</small></td><td>${e.customerSnapshot.nome}</td><td>${e.total ? formatarMZN(e.total) : "Pendente"}</td><td><span class="badge bg-${st.cor}">${st.texto}</span></td><td class="text-end">${acao}</td></tr>`;
    });
  } catch (err) { tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Erro.</td></tr>`; }
}

async function inicializarAdminDetalhesEncomenda() {
  const num = obterParametro("num");
  const content = document.querySelector(".admin-content");
  if (!num || !content) return;
  content.innerHTML = "<p class='text-center py-5'>A carregar detalhes...</p>";
  const enc = await obterEncomendaPorNumero(num);
  if (!enc) return content.innerHTML = "<div class='alert alert-danger'>Encomenda não encontrada.</div>";

  const st = STATUS_LABEL[enc.orderStatus] || { texto: enc.orderStatus, cor: "secondary" };
  content.innerHTML = `
    <div class="card border-0 shadow-sm rounded-4 p-4" style="max-width: 800px;">
      <div class="d-flex justify-content-between border-bottom pb-3 mb-4">
        <div><h3 class="fw-bold mb-0">${enc.orderNumber}</h3><small class="text-muted">${new Date(enc.createdAt).toLocaleString("pt-MZ")}</small></div>
        <span class="badge bg-${st.cor} fs-6 align-self-start">${st.texto}</span>
      </div>
      <div class="row mb-4">
        <div class="col-md-6">
          <h6 class="fw-bold text-muted">Cliente</h6>
          <p class="mb-1"><strong>${enc.customerSnapshot.nome}</strong></p>
          <p class="mb-1">${enc.customerSnapshot.telefone}</p>
          <p class="mb-1">${enc.customerSnapshot.endereco}, ${enc.customerSnapshot.cidade}</p>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold text-muted">Financeiro</h6>
          <p class="mb-1">Subtotal: ${formatarMZN(enc.subtotal)}</p>
          <p class="mb-1">Entrega: ${enc.deliveryFee ? formatarMZN(enc.deliveryFee) : 'Por definir'}</p>
          <p class="mb-1 fw-bold text-primary">Total: ${enc.total ? formatarMZN(enc.total) : 'Aguarda'}</p>
        </div>
      </div>
      <h6 class="fw-bold text-muted mb-2">Artigos</h6>
      <ul class="list-group mb-4">
        ${enc.itemsSnapshot.map(i => `<li class="list-group-item d-flex justify-content-between">${i.quantidade}x ${i.nome} <span>${formatarMZN(i.subtotal)}</span></li>`).join("")}
      </ul>
      
      <h6 class="fw-bold text-muted mb-2">Ações (Alterar Estado)</h6>
      <div class="d-flex gap-2 flex-wrap">
        ${enc.orderStatus === 'confirmada' ? `<button class="btn btn-warning" onclick="alterarEstado('${num}', 'em_preparacao', 'Encomenda em preparação')">Marcar em Preparação</button>` : ''}
        ${enc.orderStatus === 'em_preparacao' ? `<button class="btn btn-info text-white" onclick="alterarEstado('${num}', 'despachada', 'Encomenda despachada/em entrega')">Marcar como Despachada</button>` : ''}
        ${enc.orderStatus === 'despachada' ? `<button class="btn btn-success" onclick="alterarEstado('${num}', 'entregue', 'Encomenda entregue ao cliente')">Marcar como Entregue</button>` : ''}
      </div>
      <hr class="my-4">
      <a href="encomendas.html" class="btn btn-outline-secondary align-self-start"><i class="fa-solid fa-arrow-left"></i> Voltar</a>
    </div>
  `;
}

async function alterarEstado(num, novoEstado, nota) {
  if (!confirm("Tens a certeza que queres alterar o estado?")) return;
  await atualizarEncomenda(num, { orderStatus: novoEstado }, nota);
  alert("Estado atualizado!");
  window.location.reload();
}

function abrirModalCusto(num) {
  document.getElementById("modal-custo-num").textContent = num;
  document.getElementById("modal-custo-input").value = "";
  new bootstrap.Modal(document.getElementById("modal-custo-entrega")).show();
}

async function confirmarCustoEntrega() {
  const num = document.getElementById("modal-custo-num").textContent;
  const valor = parseFloat(document.getElementById("modal-custo-input").value);
  if (isNaN(valor) || valor < 0) return alert("Valor inválido.");
  const enc = await obterEncomendaPorNumero(num);
  if (!enc) return alert("Erro.");
  await atualizarEncomenda(num, { deliveryFee: valor, total: enc.subtotal + valor, orderStatus: STATUS_ENC.AGUARDANDO_ACEITE }, `Admin definiu entrega: ${formatarMZN(valor)}`);
  alert("Custo definido!"); window.location.reload();
}

async function inicializarAdminStock() {
  const tbody = document.getElementById("tabela-stock");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='6' class='text-center py-4'>A carregar...</td></tr>";
  try {
    const snapshot = await db.collection("products").get();
    tbody.innerHTML = "";
    snapshot.forEach(doc => {
      const p = doc.data();
      tbody.innerHTML += `<tr><td>${p.nome}</td><td><span class="badge bg-secondary">${p.categoriaId}</span></td><td>${p.stock} un.</td><td>0 un.</td><td class="text-success fw-bold">${p.stock} un.</td><td class="text-end"><button class="btn btn-sm btn-primary" onclick="adicionarStock('${doc.id}', ${p.stock})"><i class="fa-solid fa-plus"></i> Entrada</button></td></tr>`;
    });
  } catch (err) { tbody.innerHTML = "<tr><td colspan='6' class='text-danger text-center'>Erro.</td></tr>"; }
}

async function adicionarStock(produtoId, stockAtual) {
  const qtd = prompt("Quantas unidades queres adicionar ao stock?");
  if (!qtd || isNaN(qtd) || parseInt(qtd) <= 0) return;
  
  const novaQtd = stockAtual + parseInt(qtd);
  try {
    await db.collection("products").doc(produtoId).update({ stock: novaQtd });
    alert("Stock atualizado com sucesso!");
    window.location.reload();
  } catch (err) { alert("Erro ao atualizar stock."); }
}

async function inicializarAdminEntregas() {
  const tbody = document.getElementById("tabela-entregas");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">A carregar...</td></tr>`;
  try {
    const snapshot = await db.collection("orders").get();
    let encs = [];
    snapshot.forEach(doc => { if (["confirmada", "em_preparacao", "despachada"].includes(doc.data().orderStatus)) encs.push(doc.data()); });
    if (encs.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Sem entregas pendentes.</td></tr>`; return; }
    tbody.innerHTML = encs.map(e => `<tr><td><strong>${e.orderNumber}</strong></td><td>${e.customerSnapshot.nome}</td><td>${e.customerSnapshot.endereco}</td><td><span class="badge bg-info">${e.orderStatus}</span></td><td class="text-end"><button class="btn btn-sm btn-primary">Atribuir</button></td></tr>`).join("");
  } catch (err) { console.error("Erro entregas:", err); tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Erro.</td></tr>`; }
}

async function inicializarAdminClientes() {
  const tbody = document.getElementById("tabela-clientes");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">A carregar...</td></tr>`;
  try {
    const snapshot = await db.collection("orders").get();
    const clis = {};
    snapshot.forEach(doc => {
      const enc = doc.data();
      const tel = enc.customerSnapshot.telefone;
      if (!clis[tel]) clis[tel] = { nome: enc.customerSnapshot.nome, tel: tel, n: 0, total: 0 };
      clis[tel].n++;
      if (enc.orderStatus !== "cancelada") clis[tel].total += (enc.total || enc.subtotal);
    });
    const clientes = Object.values(clis);
    tbody.innerHTML = clientes.length ? clientes.map(c => `<tr><td>${c.nome}</td><td>${c.tel}</td><td>${c.n}</td><td class="fw-bold text-success">${formatarMZN(c.total)}</td></tr>`).join("") : `<tr><td colspan="4" class="text-center text-muted">Sem clientes.</td></tr>`;
  } catch (err) { console.error("Erro clientes:", err); tbody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Erro.</td></tr>`; }
}

async function inicializarAdminUtilizadores() {
  const tbody = document.getElementById("tabela-utilizadores");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='5' class='text-center py-4'>A carregar utilizadores...</td></tr>";

  try {
    const snapshot = await db.collection("users").get();
    tbody.innerHTML = "";
    
    if (snapshot.empty) {
      tbody.innerHTML = `
        <tr>
          <td><strong>Administrador Master</strong></td>
          <td>admin@loja.co.mz</td>
          <td><span class="badge bg-primary">Admin</span></td>
          <td><span class="badge bg-success">Ativo</span></td>
          <td class="text-end"><button class="btn btn-sm btn-light border" disabled><i class="fa-solid fa-lock"></i></button></td>
        </tr>`;
      return;
    }

    snapshot.forEach(doc => {
      const u = doc.data();
      const roleLabel = {
        admin: "Admin",
        gestor_catalogo: "Catálogo",
        gestor_stock: "Stock",
        operador: "Operador",
        entregador: "Estafeta"
      }[u.role] || u.role;

      tbody.innerHTML += `
        <tr>
          <td><strong>${u.nome}</strong></td>
          <td>${u.email}</td>
          <td><span class="badge bg-primary">${roleLabel}</span></td>
          <td><span class="badge bg-success">Ativo</span></td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" onclick="apagarFuncionario('${doc.id}')" title="Apagar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`;
    });
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='5' class='text-danger text-center'>Erro ao carregar utilizadores.</td></tr>";
  }
}

async function criarFuncionario(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A criar...';

  const nome = document.getElementById("func-nome").value.trim();
  const email = document.getElementById("func-email").value.trim();
  const telefone = document.getElementById("func-telefone").value.trim();
  const role = document.getElementById("func-role").value;
  const pass = document.getElementById("func-pass").value;

  try {
    const secondaryApp = firebase.initializeApp(CONFIG.firebaseConfig, "Secondary");
    const secondaryAuth = secondaryApp.auth();

    const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, pass);
    const newUserId = userCredential.user.uid;

    await db.collection("users").doc(newUserId).set({
      nome: nome,
      email: email,
      telefone: telefone,
      role: role,
      status: "ativo",
      criadoEm: new Date().toISOString()
    });

    await secondaryApp.delete();

    alert("Funcionário criado com sucesso!");
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Erro ao criar funcionário: " + err.message);
    btn.disabled = false; btn.innerHTML = 'Criar Conta de Funcionário';
  }
}

async function apagarFuncionario(id) {
  if (!confirm("Tens a certeza que queres apagar este funcionário?")) return;
  try {
    await db.collection("users").doc(id).delete();
    alert("Funcionário apagado!");
    window.location.reload();
  } catch (err) { alert("Erro ao apagar."); }
}

// ==========================================
// CONFIGURAÇÕES GERAIS (INCLUI DATA DE FIM DA PROMOÇÃO)
// ==========================================
async function inicializarAdminConfigGeral() {
  const form = document.getElementById("form-config-geral");
  if (!form) return;
  
  try {
    const doc = await db.collection("settings").doc("geral").get();
    if (doc.exists) {
      const d = doc.data();
      if(document.getElementById("conf-nome")) document.getElementById("conf-nome").value = d.nome || "";
      if(document.getElementById("conf-telefone")) document.getElementById("conf-telefone").value = d.telefone || "";
      if(document.getElementById("conf-email")) document.getElementById("conf-email").value = d.email || "";
      if(document.getElementById("conf-reserva")) document.getElementById("conf-reserva").value = d.reserva || 15;
      
      // LÊ A DATA DA PROMOÇÃO E CONVERTE PARA O INPUT
      if(document.getElementById("conf-promo-fim") && d.promoEndDate) {
        const date = new Date(d.promoEndDate);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        document.getElementById("conf-promo-fim").value = date.toISOString().slice(0, 16);
      }
    }
  } catch (err) { console.error("Erro ao ler configs", err); }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    let promoEndDate = null;
    const inputData = document.getElementById("conf-promo-fim").value;
    if (inputData) {
      promoEndDate = new Date(inputData).toISOString();
    }

    try {
      await db.collection("settings").doc("geral").set({
        nome: document.getElementById("conf-nome").value,
        telefone: document.getElementById("conf-telefone").value,
        email: document.getElementById("conf-email").value,
        reserva: parseInt(document.getElementById("conf-reserva").value),
        promoEndDate: promoEndDate,
        updatedAt: new Date().toISOString()
      });
      alert("Configurações guardadas com sucesso!");
    } catch (err) { alert("Erro ao guardar."); }
    btn.disabled = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarAdmin();
  const formNovoFunc = document.getElementById("form-novo-funcionario");
  if (formNovoFunc) formNovoFunc.addEventListener("submit", criarFuncionario);
});