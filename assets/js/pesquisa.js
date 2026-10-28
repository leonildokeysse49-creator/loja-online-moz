function normalizar(t) {
  return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function executarPesquisa() {
  const campo = document.getElementById("campo-pesquisa");
  const termo = (campo?.value || obterParametro("q") || "").trim();
  if (campo) campo.value = termo;

  const info = document.getElementById("pesquisa-info");
  const grelha = document.getElementById("grelha-pesquisa");
  const vazio = document.getElementById("estado-vazio-pesquisa");

  if (!termo) {
    if (info) info.textContent = "Escreve o nome de um produto para começar.";
    if (grelha) grelha.innerHTML = "";
    if (vazio) vazio.style.display = "none";
    return;
  }

  if (grelha) grelha.innerHTML = "<p class='text-center w-100 py-4'>A pesquisar no Firebase...</p>";
  if (vazio) vazio.style.display = "none";

  try {
    // 1. Carrega as categorias primeiro para os cartões ficarem bonitos
    const catSnap = await db.collection("categories").get();
    CACHE_CATEGORIAS = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Vai buscar os produtos
    const snapshot = await db.collection("products").get();
    const t = normalizar(termo);
    let resultados = [];

    snapshot.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      if (p.ativo && normalizar(p.nome).includes(t)) {
        resultados.push(p);
      }
    });

    if (info) info.innerHTML = `Resultados para <strong>"${termo}"</strong> — ${resultados.length} encontrado(s).`;

    if (resultados.length === 0) {
      if (grelha) grelha.innerHTML = "";
      if (vazio) vazio.style.display = "block";
    } else {
      if (grelha) grelha.innerHTML = resultados.map((p, i) => cardProdutoHTML(p, i * 40)).join("");
    }
  } catch (err) {
    if (grelha) grelha.innerHTML = "<p class='text-danger text-center w-100'>Erro ao ligar ao Firebase.</p>";
  }
}

function inicializarPesquisa() {
  if (!document.getElementById("grelha-pesquisa")) return;
  const q = obterParametro("q");
  const campo = document.getElementById("campo-pesquisa");
  if (q && campo) campo.value = q;
  executarPesquisa();
}