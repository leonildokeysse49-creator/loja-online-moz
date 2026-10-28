async function renderizarCheckout() {
  const alvo = document.getElementById("resumo-checkout");
  if (!alvo) return;

  const itens = lerCarrinho();
  if (itens.length === 0) {
    window.location.href = "carrinho.html";
    return;
  }

  alvo.innerHTML = `<p class="text-center py-4">A carregar resumo...</p>`;
  
  const { listaFinal, subtotal, numItens } = await obterDadosCarrinho();

  alvo.innerHTML = `
    <div class="resumo-card">
      <h3>Resumo do pedido</h3>
      <div class="checkout-itens">
        ${listaFinal.map(p => `
            <div class="checkout-item">
              <img src="${p.imagem}" alt="${p.nome}">
              <div class="flex-grow-1">
                <div class="small fw-semibold">${p.nome}</div>
                <div class="small text-muted">Qtd: ${p.quantidade}</div>
              </div>
              <div class="small fw-bold">${formatarMZN(p.subtotal)}</div>
            </div>`).join("")}
      </div>
      <hr>
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
      <div class="alerta-info-carrinho mt-3">
        <i class="fa-solid fa-circle-info"></i>
        <span>Após criar a encomenda, a loja define o custo de entrega. Vais poder aceitar ou cancelar.</span>
      </div>
    </div>
  `;

  renderizarMetodosPagamento();
}

function renderizarMetodosPagamento() {
  const alvo = document.getElementById("metodos-pagamento");
  if (!alvo) return;

  const metodos = [
    { id: "mpesa", titulo: "M-Pesa", desc: "Verificação manual pela loja", icone: "fa-mobile-screen-button" },
    { id: "emola", titulo: "e-Mola", desc: "Verificação manual pela loja", icone: "fa-mobile-screen-button" },
    { id: "entrega", titulo: "Pagamento na entrega", desc: "Paga em dinheiro ao receber", icone: "fa-hand-holding-dollar" }
  ];

  alvo.innerHTML = metodos.map((m, i) => `
    <label class="metodo-pagamento">
      <input type="radio" name="pagamento" value="${m.id}" ${i === 0 ? "checked" : ""}>
      <div class="metodo-pagamento-card">
        <i class="fa-solid ${m.icone}"></i>
        <div>
          <strong>${m.titulo}</strong>
          <small>${m.desc}</small>
        </div>
      </div>
    </label>
  `).join("");
}

function validarCheckout() {
  const obrigatorios = [
    { id: "cli-nome", msg: "Nome é obrigatório" },
    { id: "cli-telefone", msg: "Telefone é obrigatório" },
    { id: "cli-endereco", msg: "Endereço é obrigatório" },
    { id: "cli-cidade", msg: "Cidade é obrigatória" }
  ];

  let valido = true;
  obrigatorios.forEach(c => {
    const el = document.getElementById(c.id);
    if (!el) return;
    const erro = document.getElementById(c.id + "-erro");
    if (!el.value.trim()) {
      el.classList.add("is-invalid");
      if (erro) erro.textContent = c.msg;
      valido = false;
    } else {
      el.classList.remove("is-invalid");
      if (erro) erro.textContent = "";
    }
  });

  const termos = document.getElementById("aceito-termos");
  if (termos && !termos.checked) {
    const erro = document.getElementById("termos-erro");
    if (erro) erro.textContent = "Deves aceitar os termos";
    valido = false;
  }

  return valido;
}

async function submeterCheckout(e) {
  e.preventDefault();

  if (!validarCheckout()) {
    document.querySelector(".is-invalid")?.focus();
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> A criar encomenda...';
  }

  const { listaFinal, subtotal } = await obterDadosCarrinho();
  const paymentMethod = document.querySelector('input[name="pagamento"]:checked')?.value || "entrega";

  const customerSnapshot = {
    nome: document.getElementById("cli-nome").value.trim(),
    telefone: document.getElementById("cli-telefone").value.trim(),
    email: document.getElementById("cli-email").value.trim() || null,
    endereco: document.getElementById("cli-endereco").value.trim(),
    cidade: document.getElementById("cli-cidade").value.trim(),
    referencia: document.getElementById("cli-referencia").value.trim() || null,
    notas: document.getElementById("cli-notas").value.trim() || null
  };

  const itemsSnapshot = listaFinal.map(p => ({
    produtoId: p.id,
    nome: p.nome,
    preco: p.preco,
    quantidade: p.quantidade,
    subtotal: p.subtotal
  }));

  const encomenda = await criarEncomendaFirebase({ customerSnapshot, itemsSnapshot, subtotal, paymentMethod });
  
  if (encomenda) {
    guardarCarrinho([]);
    mostrarConfirmacao(encomenda);
  } else {
    alert("Erro ao criar a encomenda. Tenta novamente.");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check me-2"></i> Criar encomenda';
    }
  }
}

function mostrarConfirmacao(encomenda) {
  const modalEl = document.getElementById("modal-confirmacao");
  document.getElementById("conf-numero").textContent = encomenda.orderNumber;
  document.getElementById("conf-codigo").textContent = encomenda.secretCode;
  document.getElementById("conf-total").textContent = formatarMZN(encomenda.subtotal);
  document.getElementById("link-acompanhar").href =
    "acompanhar-encomenda.html?num=" + encodeURIComponent(encomenda.orderNumber) +
    "&code=" + encodeURIComponent(encomenda.secretCode);

  const bsModal = new bootstrap.Modal(modalEl, { backdrop: "static", keyboard: false });
  bsModal.show();
}

function inicializarCheckout() {
  const form = document.getElementById("form-checkout");
  if (!form) return;
  renderizarCheckout();
  form.addEventListener("submit", submeterCheckout);

  form.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => {
      el.classList.remove("is-invalid");
      const erro = document.getElementById(el.id + "-erro");
      if (erro) erro.textContent = "";
    });
  });

  // NOVO: Preencher automaticamente os dados do cliente se ele estiver logado
  if (typeof utilizadorLogado !== "undefined" && utilizadorLogado !== null) {
    if (document.getElementById("cli-nome")) document.getElementById("cli-nome").value = utilizadorLogado.nome || "";
    if (document.getElementById("cli-email")) document.getElementById("cli-email").value = utilizadorLogado.email || "";
    if (document.getElementById("cli-telefone")) document.getElementById("cli-telefone").value = utilizadorLogado.telefone || "";
  }
}