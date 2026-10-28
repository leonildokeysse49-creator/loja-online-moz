const DADOS_DEMO = {
  categorias: [
    {
      id: "moda", nome: "Moda e Vestuário", icone: "fa-shirt",
      descricao: "Roupas, calçado e moda masculina e feminina.",
      subcategorias: ["Camisolas", "Calças", "Sapatilhas", "Vestidos", "Casacos"]
    },
    {
      id: "tecnologia", nome: "Telemóveis e Tecnologia", icone: "fa-mobile-screen-button",
      descricao: "Telemóveis, computadores e electrónica.",
      subcategorias: ["Telemóveis", "Portáteis", "Auscultadores", "Smartwatches", "Acessórios"]
    },
    {
      id: "acessorios", nome: "Acessórios", icone: "fa-watch",
      descricao: "Relógios, malas, óculos e acessórios tecnológicos.",
      subcategorias: ["Relógios", "Malas", "Óculos", "Cintos", "Carteiras"]
    },
    {
      id: "casa", nome: "Casa e Outros", icone: "fa-couch",
      descricao: "Decoração, artigos domésticos e futuras categorias.",
      subcategorias: ["Decoração", "Cozinha", "Iluminação", "Têxteis"]
    }
  ],

  produtos: [
    {
      id: "p01", nome: "T-shirt básica azul", categoriaId: "moda", subcategoria: "Camisolas",
      preco: 450, precoAntigo: 650, imagem: "https://picsum.photos/seed/shirt01/800",
      galeria: ["https://picsum.photos/seed/shirt01/800","https://picsum.photos/seed/shirt01b/800","https://picsum.photos/seed/shirt01c/800"],
      descricao: "T-shirt em algodão 100%, corte regular, confortável para o dia-a-dia.",
      ativo: true, destaque: true, novo: true, stock: 30,
      variantes: [{ tipo: "Tamanho", opcoes: ["S","M","L","XL"] }, { tipo: "Cor", opcoes: ["Azul","Branco","Preto"] }]
    },
    {
      id: "p02", nome: "Ténis urbano branco", categoriaId: "moda", subcategoria: "Sapatilhas",
      preco: 1850, precoAntigo: 2200, imagem: "https://picsum.photos/seed/shoes02/800",
      galeria: ["https://picsum.photos/seed/shoes02/800","https://picsum.photos/seed/shoes02b/800"],
      descricao: "Ténis urbano em pele sintética, sola em borracha, ideal para uso diário.",
      ativo: true, destaque: true, novo: false, stock: 12,
      variantes: [{ tipo: "Tamanho", opcoes: ["39","40","41","42","43"] }]
    },
    {
      id: "p03", nome: "Casaco de inverno", categoriaId: "moda", subcategoria: "Casacos",
      preco: 2990, imagem: "https://picsum.photos/seed/coat03/800",
      galeria: ["https://picsum.photos/seed/coat03/800","https://picsum.photos/seed/coat03b/800"],
      descricao: "Casaco impermeável com forro térmico, perfeito para dias frios.",
      ativo: true, destaque: false, novo: true, stock: 8,
      variantes: [{ tipo: "Tamanho", opcoes: ["M","L","XL"] }]
    },
    {
      id: "p04", nome: "Smartphone 128GB", categoriaId: "tecnologia", subcategoria: "Telemóveis",
      preco: 15990, precoAntigo: 17990, imagem: "https://picsum.photos/seed/phone04/800",
      galeria: ["https://picsum.photos/seed/phone04/800","https://picsum.photos/seed/phone04b/800","https://picsum.photos/seed/phone04c/800"],
      descricao: "Smartphone com 128GB de armazenamento, câmara de 48MP e bateria de longa duração.",
      ativo: true, destaque: true, novo: false, stock: 8,
      variantes: [{ tipo: "Cor", opcoes: ["Preto","Azul","Branco"] }]
    },
    {
      id: "p05", nome: "Fones bluetooth", categoriaId: "tecnologia", subcategoria: "Auscultadores",
      preco: 1290, imagem: "https://picsum.photos/seed/head05/800",
      galeria: ["https://picsum.photos/seed/head05/800","https://picsum.photos/seed/head05b/800"],
      descricao: "Fones sem fios com cancelamento de ruído, até 20h de autonomia.",
      ativo: true, destaque: true, novo: true, stock: 25,
      variantes: [{ tipo: "Cor", opcoes: ["Preto","Branco"] }]
    },
    {
      id: "p06", nome: "Laptop 15\"", categoriaId: "tecnologia", subcategoria: "Portáteis",
      preco: 45990, imagem: "https://picsum.photos/seed/laptop06/800",
      galeria: ["https://picsum.photos/seed/laptop06/800"],
      descricao: "Portátil 15 polegadas com processador rápido, 8GB RAM, 512GB SSD.",
      ativo: true, destaque: false, novo: false, stock: 3,
      variantes: []
    },
    {
      id: "p07", nome: "Smartwatch", categoriaId: "tecnologia", subcategoria: "Smartwatches",
      preco: 3990, imagem: "https://picsum.photos/seed/watch07/800",
      galeria: ["https://picsum.photos/seed/watch07/800","https://picsum.photos/seed/watch07b/800"],
      descricao: "Relógio inteligente com monitor de batimento cardíaco e GPS.",
      ativo: true, destaque: true, novo: true, stock: 14,
      variantes: [{ tipo: "Cor", opcoes: ["Preto","Prateado"] }]
    },
    {
      id: "p08", nome: "Relógio clássico", categoriaId: "acessorios", subcategoria: "Relógios",
      preco: 2990, imagem: "https://picsum.photos/seed/clock08/800",
      galeria: ["https://picsum.photos/seed/clock08/800"],
      descricao: "Relógio de pulso clássico com bracelete em aço.",
      ativo: true, destaque: false, novo: false, stock: 6,
      variantes: []
    },
    {
      id: "p09", nome: "Mala de viagem", categoriaId: "acessorios", subcategoria: "Malas",
      preco: 3490, precoAntigo: 3990, imagem: "https://picsum.photos/seed/bag09/800",
      galeria: ["https://picsum.photos/seed/bag09/800","https://picsum.photos/seed/bag09b/800"],
      descricao: "Mala de cabine com rodas, fecho TSA e interior espaçoso.",
      ativo: true, destaque: true, novo: false, stock: 10,
      variantes: [{ tipo: "Cor", opcoes: ["Preto","Cinza"] }]
    },
    {
      id: "p10", nome: "Óculos de sol", categoriaId: "acessorios", subcategoria: "Óculos",
      preco: 890, imagem: "https://picsum.photos/seed/sun10/800",
      galeria: ["https://picsum.photos/seed/sun10/800"],
      descricao: "Óculos de sol com proteção UV400 e armação leve.",
      ativo: true, destaque: false, novo: true, stock: 20,
      variantes: [{ tipo: "Cor", opcoes: ["Preto","Castanho"] }]
    },
    {
      id: "p11", nome: "Candeeiro de mesa", categoriaId: "casa", subcategoria: "Iluminação",
      preco: 990, imagem: "https://picsum.photos/seed/lamp11/800",
      galeria: ["https://picsum.photos/seed/lamp11/800"],
      descricao: "Candeeiro de mesa em metal, luz regulável.",
      ativo: true, destaque: false, novo: false, stock: 15,
      variantes: []
    },
    {
      id: "p12", nome: "Conjunto de panelas", categoriaId: "casa", subcategoria: "Cozinha",
      preco: 4250, imagem: "https://picsum.photos/seed/pans12/800",
      galeria: ["https://picsum.photos/seed/pans12/800","https://picsum.photos/seed/pans12b/800"],
      descricao: "Conjunto de 5 panelas antiaderentes, compatíveis com indução.",
      ativo: true, destaque: true, novo: true, stock: 4,
      variantes: []
    }
  ]
};