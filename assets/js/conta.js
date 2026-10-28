/**
 * Lógica das páginas da Área do Cliente (Ligada ao Firebase Auth).
 */

function aguardarAutenticacao(callback) {
  if (utilizadorLogado !== null) {
    callback();
  } else {
    document.addEventListener("authReady", callback);
  }
}

function inicializarLogin() {
  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A entrar...';

    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value;
    const erro = document.getElementById("login-erro");
    erro.textContent = "";

    const res = await loginUtilizador(email, pass);
    if (res.ok) {
      // Apenas redireciona. O Admin pode entrar na área de cliente à vontade.
      window.location.href = "perfil.html";
    } else {
      erro.textContent = res.erro;
      btn.disabled = false;
      btn.innerHTML = "Entrar";
    }
  });
}

function inicializarRegisto() {
  const form = document.getElementById("form-registo");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A criar conta...';

    const nome = document.getElementById("reg-nome").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const telefone = document.getElementById("reg-telefone").value.trim();
    const pass = document.getElementById("reg-pass").value;
    const erro = document.getElementById("reg-erro");
    erro.textContent = "";

    if (!nome || !email || !telefone || !pass) {
      erro.textContent = "Preenche todos os campos.";
      btn.disabled = false;
      btn.innerHTML = "Criar conta";
      return;
    }

    if (email === "admin@loja.co.mz") {
      erro.textContent = "Este e-mail está reservado para o Administrador.";
      btn.disabled = false;
      btn.innerHTML = "Criar conta";
      return;
    }

    const res = await registarUtilizador(nome, email, telefone, pass);
    if (res.ok) {
      window.location.href = "perfil.html";
    } else {
      erro.textContent = res.erro;
      btn.disabled = false;
      btn.innerHTML = "Criar conta";
    }
  });
}

function renderizarSidebar(ativo) {
  const alvo = document.getElementById("sidebar-conta");
  if (!alvo || !utilizadorLogado) return;

  // Verifica se o utilizador logado é o admin
  const isAdmin = utilizadorLogado.email === "admin@loja.co.mz";

  const links = [
    { href: "perfil.html", icone: "fa-user", label: "Meu Perfil", id: "perfil" },
    { href: "encomendas.html", icone: "fa-box", label: "Minhas Encomendas", id: "encomendas" },
    { href: "enderecos.html", icone: "fa-location-dot", label: "Endereços", id: "enderecos" },
    { href: "pagamentos.html", icone: "fa-credit-card", label: "Pagamentos", id: "pagamentos" },
    { href: "suporte.html", icone: "fa-headset", label: "Suporte", id: "suporte" }
  ];

  let adminBtnHTML = "";
  if (isAdmin) {
    adminBtnHTML = `
      <li class="mt-2 pt-2 border-top">
        <a href="../admin/dashboard.html" class="text-primary fw-bold">
          <i class="fa-solid fa-shield-halved"></i> Ir para o Painel Admin
        </a>
      </li>
    `;
  }

  alvo.innerHTML = `
    <div class="sidebar-user">
      <div class="sidebar-avatar"><i class="fa-solid ${isAdmin ? 'fa-user-shield' : 'fa-user'}"></i></div>
      <h4>${utilizadorLogado.nome.split(" ")[0]}</h4>
      <p>${utilizadorLogado.email}</p>
    </div>
    <ul class="sidebar-nav">
      ${links.map(l => `<li><a href="${l.href}" class="${ativo === l.id ? "active" : ""}"><i class="fa-solid ${l.icone}"></i> ${l.label}</a></li>`).join("")}
      ${adminBtnHTML}
      <li class="mt-2 border-top pt-2"><a href="#" class="sair-btn" onclick="event.preventDefault(); if(confirm('Terminar sessão?')) terminarSessao();"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sair</a></li>
    </ul>
  `;
}

function inicializarPerfil() {
  aguardarAutenticacao(() => {
    if (!utilizadorLogado) return;
    renderizarSidebar("perfil");
    
    document.getElementById("perf-nome").value = utilizadorLogado.nome;
    document.getElementById("perf-email").value = utilizadorLogado.email;
    document.getElementById("perf-telefone").value = utilizadorLogado.telefone || "";

    document.getElementById("form-perfil").addEventListener("submit", async e => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = "A guardar...";

      await atualizarUtilizador({
        nome: document.getElementById("perf-nome").value.trim(),
        telefone: document.getElementById("perf-telefone").value.trim()
      });
      alert("Perfil atualizado com sucesso!");
      renderizarSidebar("perfil");
      btn.disabled = false;
      btn.innerHTML = "Guardar alterações";
    });
  });
}

async function inicializarMinhasEncomendas() {
  aguardarAutenticacao(async () => {
    if (!utilizadorLogado) return;
    renderizarSidebar("encomendas");
    
    const alvo = document.getElementById("lista-minhas-encomendas");
    alvo.innerHTML = `<p class="text-center py-4">A carregar as tuas encomendas...</p>`;

    try {
      const snapshot = await db.collection("orders").where("customerSnapshot.email", "==", utilizadorLogado.email).get();
      
      if (snapshot.empty) {
        alvo.innerHTML = `<div class="estado-vazio"><i class="fa-solid fa-box-open"></i><h3>Ainda não tens encomendas</h3><a href="../produtos.html" class="btn btn-primary mt-2">Ver produtos</a></div>`;
        return;
      }

      let encomendas = [];
      snapshot.forEach(doc => encomendas.push(doc.data()));
      encomendas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      alvo.innerHTML = encomendas.map(enc => {
        const st = STATUS_LABEL[enc.orderStatus] || { texto: enc.orderStatus, cor: "secondary" };
        const data = new Date(enc.createdAt).toLocaleDateString("pt-MZ");
        return `
          <div class="encomenda-item">
            <div class="encomenda-header">
              <div><div class="encomenda-num">${enc.orderNumber}</div><div class="encomenda-data">${data}</div></div>
              <span class="badge bg-${st.cor}">${st.texto}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted small">${enc.itemsSnapshot.length} artigo(s)</div>
              <div class="encomenda-total">${enc.total ? formatarMZN(enc.total) : "Aguarda custo"}</div>
            </div>
            <div class="mt-3 text-end">
              <a href="detalhes-encomenda.html?num=${enc.orderNumber}&code=${enc.secretCode}" class="btn btn-sm btn-outline-primary">Ver detalhes</a>
            </div>
          </div>`;
      }).join("");
    } catch (err) {
      alvo.innerHTML = `<div class="alert alert-danger">Erro ao carregar.</div>`;
    }
  });
}

function inicializarDetalhesConta() {
  aguardarAutenticacao(async () => {
    if (!utilizadorLogado) return;
    renderizarSidebar("encomendas");
    
    const num = obterParametro("num");
    const code = obterParametro("code");
    const alvo = document.getElementById("detalhes-conta-conteudo");
    
    if (!num || !code) {
      alvo.innerHTML = `<div class="alert alert-danger">Dados da encomenda inválidos.</div>`;
      return;
    }

    const enc = await obterEncomendaPorNumero(num);
    if (!enc || !validarCodigo(enc, code)) {
      alvo.innerHTML = `<div class="alert alert-danger">Encomenda não encontrada ou código inválido.</div>`;
      return;
    }

    alvo.innerHTML = `<div id="area-detalhes-encomenda"></div>`;
    renderizarDetalhesEncomenda(enc);
  });
}

function inicializarEnderecos() { aguardarAutenticacao(() => renderizarSidebar("enderecos")); }
function inicializarPagamentosConta() { aguardarAutenticacao(() => renderizarSidebar("pagamentos")); }
function inicializarSuporteConta() { aguardarAutenticacao(() => renderizarSidebar("suporte")); }