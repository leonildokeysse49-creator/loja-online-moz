/**
 * Camada de encomendas ligada ao Firebase Firestore.
 */

const STATUS_ENC = {
  AGUARDANDO_CUSTO: "aguardando_custo_entrega",
  AGUARDANDO_ACEITE: "aguardando_aceitacao_total",
  CONFIRMADA: "confirmada",
  EM_PREPARACAO: "em_preparacao",
  DESPACHADA: "despachada",
  ENTREGUE: "entregue",
  CANCELADA: "cancelada"
};

const STATUS_LABEL = {
  aguardando_custo_entrega: { texto: "Aguardando custo de entrega", cor: "warning", icone: "fa-clock" },
  aguardando_aceitacao_total: { texto: "Aguardando aceitação", cor: "info", icone: "fa-hand-paper" },
  confirmada: { texto: "Confirmada", cor: "primary", icone: "fa-check" },
  em_preparacao: { texto: "Em preparação", cor: "info", icone: "fa-box" },
  despachada: { texto: "Em entrega", cor: "info", icone: "fa-truck-fast" },
  entregue: { texto: "Entregue", cor: "success", icone: "fa-check-double" },
  cancelada: { texto: "Cancelada", cor: "danger", icone: "fa-xmark" }
};

const PAGAMENTO_LABEL = {
  pendente: { texto: "Pendente", cor: "warning" },
  pago: { texto: "Pago", cor: "success" },
  falhado: { texto: "Falhado", cor: "danger" },
  reembolso_pendente: { texto: "Reembolso pendente", cor: "warning" },
  reembolsado: { texto: "Reembolsado", cor: "success" }
};

const ENTREGA_LABEL = {
  pendente: { texto: "Pendente", cor: "secondary" },
  em_transito: { texto: "Em trânsito", cor: "info" },
  entregue: { texto: "Entregue", cor: "success" },
  falhada: { texto: "Falhada", cor: "danger" }
};

function gerarNumeroEncomenda() {
  const ano = new Date().getFullYear();
  return "LOJA-" + ano + "-" + Math.floor(100000 + Math.random() * 900000);
}

function gerarCodigoSecreto() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// GRAVAR NO FIREBASE (COM VALIDAÇÃO E TRANSAÇÃO DE STOCK)
async function criarEncomendaFirebase(dados) {
  let num = gerarNumeroEncomenda();
  const codigo = gerarCodigoSecreto();
  const agora = new Date().toISOString();

  const encomenda = {
    orderNumber: num,
    secretCode: codigo,
    createdAt: agora,
    updatedAt: agora,
    customerSnapshot: dados.customerSnapshot,
    itemsSnapshot: dados.itemsSnapshot,
    subtotal: dados.subtotal,
    deliveryFee: null,
    total: null,
    currency: "MZN",
    orderStatus: STATUS_ENC.AGUARDANDO_CUSTO,
    paymentStatus: "pendente",
    deliveryStatus: "pendente",
    paymentMethod: dados.paymentMethod,
    deliveryFeeAcceptedAt: null,
    history: [{ status: STATUS_ENC.AGUARDANDO_CUSTO, at: agora, note: "Encomenda criada pelo cliente" }]
  };

  try {
    // Inicia a transação atómica (ou tudo corre bem, ou nada é gravado)
    await db.runTransaction(async (transaction) => {
      
      // 1. Verificar o stock real de cada produto antes de avançar
      for (const item of dados.itemsSnapshot) {
        const produtoRef = db.collection("products").doc(item.produtoId);
        const produtoDoc = await transaction.get(produtoRef);

        if (!produtoDoc.exists) {
          throw new Error(`O produto ${item.nome} já não se encontra disponível.`);
        }

        const stockAtual = produtoDoc.data().stock || 0;
        if (stockAtual < item.quantidade) {
          throw new Error(`Stock insuficiente para ${item.nome}. Restam apenas ${stockAtual} unidades.`);
        }

        // 2. Subtrair o stock de forma segura
        transaction.update(produtoRef, {
          stock: firebase.firestore.FieldValue.increment(-item.quantidade)
        });
      }

      // 3. Se todos os produtos tiverem stock suficiente, cria a encomenda
      const orderRef = db.collection("orders").doc(num);
      transaction.set(orderRef, encomenda);
    });

    // Se a transação for bem-sucedida, retorna a encomenda
    return encomenda;

  } catch (error) {
    console.error("Erro ao gravar encomenda:", error);
    
    // Mostra ao utilizador o motivo exato do erro
    if (error.message.includes("Stock insuficiente") || error.message.includes("já não se encontra")) {
      alert("⚠️ " + error.message);
    } else {
      alert("Ocorreu um erro ao processar a encomenda. Tenta novamente.");
    }
    return null;
  }
}

// LER DO FIREBASE
async function obterEncomendaPorNumero(num) {
  try {
    const doc = await db.collection("orders").doc(num).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar encomenda:", error);
    return null;
  }
}

// ATUALIZAR NO FIREBASE
async function atualizarEncomenda(num, updates, note) {
  try {
    const docRef = db.collection("orders").doc(num);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const data = doc.data();
    const newHistory = data.history || [];
    if (note) {
      newHistory.push({ status: updates.orderStatus || data.orderStatus, at: new Date().toISOString(), note });
    }

    await docRef.update({
      ...updates,
      history: newHistory,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar encomenda:", error);
    return false;
  }
}

function validarCodigo(encomenda, codigo) {
  if (!encomenda || !codigo) return false;
  return encomenda.secretCode.toUpperCase() === codigo.toUpperCase().trim();
}

// ACOMPANHAMENTO (Async)
async function inicializarAcompanhamento() {
  const form = document.getElementById("form-acompanhar");
  if (!form) return;

  const num = obterParametro("num");
  const code = obterParametro("code");
  if (num) document.getElementById("acomp-numero").value = num;
  if (code) document.getElementById("acomp-codigo").value = code;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const numero = document.getElementById("acomp-numero").value.trim();
    const codigo = document.getElementById("acomp-codigo").value.trim();
    const erro = document.getElementById("acomp-erro");
    if (erro) erro.textContent = "A procurar encomenda...";

    const encomenda = await obterEncomendaPorNumero(numero);
    if (!encomenda || !validarCodigo(encomenda, codigo)) {
      if (erro) erro.textContent = "Encomenda não encontrada ou código secreto inválido.";
      return;
    }
    if (erro) erro.textContent = "";
    renderizarDetalhesEncomenda(encomenda);
  });

  if (num && code) {
    const encomenda = await obterEncomendaPorNumero(num);
    if (encomenda && validarCodigo(encomenda, code)) {
      renderizarDetalhesEncomenda(encomenda);
    }
  }
}

function renderizarDetalhesEncomenda(encomenda) {
  const formArea = document.getElementById("area-form-acompanhar");
  if (formArea) formArea.style.display = "none";
  const area = document.getElementById("area-detalhes-encomenda");
  if (!area) return;
  area.style.display = "block";

  const s = STATUS_LABEL[encomenda.orderStatus] || { texto: encomenda.orderStatus, cor: "secondary", icone: "fa-circle-info" };
  const p = PAGAMENTO_LABEL[encomenda.paymentStatus] || { texto: encomenda.paymentStatus, cor: "secondary" };
  const d = ENTREGA_LABEL[encomenda.deliveryStatus] || { texto: encomenda.deliveryStatus, cor: "secondary" };

  const timeline = (encomenda.history || []).map(h => {
    const sl = STATUS_LABEL[h.status] || { texto: h.status, icone: "fa-circle" };
    return `
      <div class="timeline-item">
        <div class="timeline-icon"><i class="fa-solid ${sl.icone}"></i></div>
        <div class="timeline-content">
          <strong>${sl.texto}</strong>
          <div class="small text-muted">${new Date(h.at).toLocaleString("pt-MZ")}</div>
          ${h.note ? `<div class="small">${h.note}</div>` : ""}
        </div>
      </div>`;
  }).join("");

  const itemsHTML = encomenda.itemsSnapshot.map(i => `
    <div class="checkout-item">
      <div class="flex-grow-1">
        <div class="small fw-semibold">${i.nome}</div>
        <div class="small text-muted">Qtd: ${i.quantidade} × ${formatarMZN(i.preco)}</div>
      </div>
      <div class="small fw-bold">${formatarMZN(i.subtotal)}</div>
    </div>
  `).join("");

  let acaoHTML = "";
  if (encomenda.orderStatus === STATUS_ENC.AGUARDANDO_CUSTO) {
    acaoHTML = `<div class="alerta alerta-aviso"><i class="fa-solid fa-clock me-1"></i> <strong>A aguardar definição do custo de entrega pela loja.</strong></div>`;
  } else if (encomenda.orderStatus === STATUS_ENC.AGUARDANDO_ACEITE) {
    acaoHTML = `
      <div class="alerta alerta-info">
        <i class="fa-solid fa-hand-paper me-1"></i>
        <strong>Custo de entrega: ${formatarMZN(encomenda.deliveryFee)} — Total: ${formatarMZN(encomenda.total)}</strong>
        <div class="mt-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-primary" onclick="aceitarTotal('${encomenda.orderNumber}')"><i class="fa-solid fa-check me-1"></i> Aceitar total</button>
          <button class="btn btn-sm btn-outline-danger" onclick="cancelarEncomenda('${encomenda.orderNumber}')"><i class="fa-solid fa-xmark me-1"></i> Cancelar</button>
        </div>
      </div>`;
  } else if ([STATUS_ENC.CONFIRMADA, STATUS_ENC.EM_PREPARACAO].includes(encomenda.orderStatus)) {
    acaoHTML = `<div class="alerta alerta-sucesso"><i class="fa-solid fa-check me-1"></i> Encomenda confirmada. A loja está a preparar o pedido.</div>`;
  } else if (encomenda.orderStatus === STATUS_ENC.CANCELADA) {
    acaoHTML = `<div class="alerta alerta-erro"><i class="fa-solid fa-xmark me-1"></i> Encomenda cancelada.</div>`;
  }

  area.innerHTML = `
    <div class="detalhes-encomenda">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div><h2 class="mb-1">Encomenda ${encomenda.orderNumber}</h2><div class="text-muted small">Criada em ${new Date(encomenda.createdAt).toLocaleString("pt-MZ")}</div></div>
        <span class="badge bg-${s.cor} fs-6"><i class="fa-solid ${s.icone} me-1"></i>${s.texto}</span>
      </div>
      ${acaoHTML}
      <div class="row g-4 mt-2">
        <div class="col-lg-7">
          <div class="card-box"><h4><i class="fa-solid fa-list me-2"></i>Artigos</h4>${itemsHTML}<hr>
            <div class="resumo-linha"><span>Subtotal</span><strong>${formatarMZN(encomenda.subtotal)}</strong></div>
            <div class="resumo-linha"><span>Custo de entrega</span><strong>${encomenda.deliveryFee ? formatarMZN(encomenda.deliveryFee) : '<em class="text-muted">Por definir</em>'}</strong></div>
            <div class="resumo-linha total"><span>Total</span><strong>${encomenda.total ? formatarMZN(encomenda.total) : '<em class="text-muted">Aguarda custo</em>'}</strong></div>
          </div>
          <div class="card-box mt-4"><h4><i class="fa-solid fa-clock-rotate-left me-2"></i>Histórico</h4><div class="timeline">${timeline}</div></div>
        </div>
        <div class="col-lg-5">
          <div class="card-box"><h4><i class="fa-solid fa-truck-fast me-2"></i>Entrega</h4><div class="small">
              <div class="mb-2"><strong>${encomenda.customerSnapshot.nome}</strong></div>
              <div class="mb-1">${encomenda.customerSnapshot.telefone}</div>
              <div class="mb-1">${encomenda.customerSnapshot.endereco}</div>
              <div class="mb-1">${encomenda.customerSnapshot.cidade}</div>
          </div><hr><div class="d-flex justify-content-between"><span class="text-muted small">Estado da entrega</span><span class="badge bg-${d.cor}">${d.texto}</span></div></div>
          <div class="card-box mt-3"><h4><i class="fa-solid fa-credit-card me-2"></i>Pagamento</h4><div class="d-flex justify-content-between"><span class="text-muted small">Estado</span><span class="badge bg-${p.cor}">${p.texto}</span></div></div>
        </div>
      </div>
    </div>
  `;
}

async function aceitarTotal(orderNumber) {
  await atualizarEncomenda(orderNumber, { orderStatus: STATUS_ENC.CONFIRMADA, deliveryFeeAcceptedAt: new Date().toISOString() }, "Cliente aceitou o total");
  const enc = await obterEncomendaPorNumero(orderNumber);
  renderizarDetalhesEncomenda(enc);
}

async function cancelarEncomenda(orderNumber) {
  if (!confirm("Tens a certeza que queres cancelar esta encomenda?")) return;
  const enc = await obterEncomendaPorNumero(orderNumber);
  if (!enc) return;
  
  const updates = { orderStatus: STATUS_ENC.CANCELADA };
  if (enc.paymentStatus === "pago") updates.paymentStatus = "reembolso_pendente";
  
  await atualizarEncomenda(orderNumber, updates, "Cancelada pelo cliente");
  const encAtualizada = await obterEncomendaPorNumero(orderNumber);
  renderizarDetalhesEncomenda(encAtualizada);
}

async function inicializarCancelamento() {
  const form = document.getElementById("form-cancelamento");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const numero = document.getElementById("canc-numero").value.trim();
    const codigo = document.getElementById("canc-codigo").value.trim();
    const motivo = document.getElementById("canc-motivo").value.trim();
    const erro = document.getElementById("canc-erro");
    if (erro) erro.textContent = "A processar...";

    const enc = await obterEncomendaPorNumero(numero);
    if (!enc || !validarCodigo(enc, codigo)) {
      if (erro) erro.textContent = "Encomenda não encontrada ou código secreto inválido.";
      return;
    }

    const bloqueado = [STATUS_ENC.EM_PREPARACAO, STATUS_ENC.DESPACHADA, STATUS_ENC.ENTREGUE, STATUS_ENC.CANCELADA].includes(enc.orderStatus);
    if (bloqueado) {
      if (erro) erro.textContent = "Esta encomenda já não pode ser cancelada automaticamente.";
      return;
    }

    if (!confirm("Tens a certeza que queres cancelar a encomenda " + numero + "?")) return;

    const updates = { orderStatus: STATUS_ENC.CANCELADA };
    if (enc.paymentStatus === "pago") updates.paymentStatus = "reembolso_pendente";
    await atualizarEncomenda(numero, updates, "Cancelada pelo cliente. Motivo: " + (motivo || "não indicado"));

    document.getElementById("area-form-cancelamento").style.display = "none";
    const area = document.getElementById("area-sucesso-cancelamento");
    area.style.display = "block";
    area.innerHTML = `
      <div class="text-center py-5">
        <div class="mb-3" style="font-size:3rem;color:var(--brand-azul)"><i class="fa-solid fa-circle-check"></i></div>
        <h2>Encomenda cancelada</h2>
        <p class="text-muted">A encomenda <strong>${numero}</strong> foi cancelada com sucesso.</p>
        <div class="mt-4"><a href="index.html" class="btn btn-primary">Voltar ao início</a></div>
      </div>
    `;
  });
}