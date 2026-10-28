function renderizarCategoriasHome() {
  const alvo = document.getElementById("grelha-categorias");
  if (!alvo) return;

  db.collection("categories").get().then((snapshot) => {
    alvo.innerHTML = "";
    if (snapshot.empty) {
      alvo.innerHTML = "<p class='text-center w-100'>Sem categorias na base de dados.</p>";
      return;
    }

    let i = 0;
    snapshot.forEach((doc) => {
      const cat = { id: doc.id, ...doc.data() };
      alvo.innerHTML += `
        <div class="col-6 col-md-3" data-aos="fade-up" data-aos-delay="${i * 60}">
          <a class="cat-card" href="produtos.html?categoria=${encodeURIComponent(cat.id)}">
            <div class="cat-icon"><i class="fa-solid ${cat.icone || 'fa-tags'}"></i></div>
            <h5>${cat.nome}</h5>
            <p>${cat.descricao || ""}</p>
          </a>
        </div>
      `;
      i++;
    });
    if (typeof AOS !== "undefined") AOS.refresh();
  }).catch((error) => {
    console.error("Erro ao ler categorias da homepage: ", error);
  });
}

async function renderizarPaginaCategorias() {
  console.log("🔄 A iniciar renderizarPaginaCategorias...");
  
  const alvo = document.getElementById("lista-categorias");
  if (!alvo) {
    console.error("❌ ERRO FATAL: O ID 'lista-categorias' não foi encontrado no HTML!");
    return;
  }

  alvo.innerHTML = "<p class='text-center w-100 py-5'>A carregar categorias do Firebase...</p>";

  try {
    const snapshot = await db.collection("categories").get();
    console.log("📦 Categorias recebidas do Firebase:", snapshot.size);
    
    if (snapshot.empty) {
      console.warn("⚠️ O Firebase está vazio. Não há categorias para mostrar.");
      alvo.innerHTML = "<p class='text-center w-100'>Sem categorias na base de dados.</p>";
      return;
    }

    alvo.innerHTML = "";
    let i = 0;
    
    snapshot.forEach((doc) => {
      const cat = { id: doc.id, ...doc.data() };
      
      let subcatsHTML = "";
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        subcatsHTML = `
          <ul class="cat-block-subcats mt-3">
            ${cat.subcategorias.map(s => `
              <li><a href="produtos.html?categoria=${encodeURIComponent(cat.id)}&sub=${encodeURIComponent(s)}">${s}</a></li>
            `).join("")}
          </ul>
        `;
      }

      alvo.innerHTML += `
        <div class="col-md-6" data-aos="fade-up" data-aos-delay="${i * 80}">
          <div class="cat-block">
            <div class="cat-block-header">
              <div class="cat-block-icon"><i class="fa-solid ${cat.icone || 'fa-tags'}"></i></div>
              <div>
                <h3>${cat.nome}</h3>
                <p>${cat.descricao || "Explora os nossos produtos."}</p>
              </div>
            </div>
            ${subcatsHTML}
            <a href="produtos.html?categoria=${encodeURIComponent(cat.id)}" class="btn btn-outline-primary btn-sm btn-ver-tudo">
              Ver produtos <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
          </div>
        </div>
      `;
      i++;
    });

    if (typeof AOS !== "undefined") AOS.refresh();
    console.log("✅ Categorias renderizadas com sucesso no ecrã!");

  } catch (error) {
    console.error("❌ Erro ao carregar categorias:", error);
    alvo.innerHTML = "<p class='text-danger text-center w-100'>Erro ao ligar ao Firebase. Verifica a consola (F12).</p>";
  }
}