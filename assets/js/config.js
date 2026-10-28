/**
 * Configuração central da loja.
 * Não colocar aqui segredos (chaves de API privadas vão para Cloud Functions).
 */

const CONFIG = {
  loja: {
    nome: "Loja Online",
    slogan: "Compre em Moçambique, com confiança.",
    moeda: "MZN",
    locale: "pt-MZ",
    // Dados de contacto da loja
    telefone: "853 217 149",
    telefoneRaw: "258853217149", // formato internacional sem "+", para wa.me
    whatsapp: "https://wa.me/258853217149",
    email: "Leonildokeysse49@gmail.com",
    endereco: "Maputo, Moçambique",
    horario: "Segunda a sábado, 08h–18h"
  },

  // Chaves reais do projeto loja-online-mz
  firebaseConfig: {
    apiKey: "AIzaSyArFERGKMI5MtIu9v6fp9V18NmFGUABlg0",
    authDomain: "loja-online-mz.firebaseapp.com",
    projectId: "loja-online-mz",
    storageBucket: "loja-online-mz.firebasestorage.app",
    messagingSenderId: "1041397551860",
    appId: "1:1041397551860:web:f4f9f95dab93fb61bb04a1",
    measurementId: "G-8PRTETYSQ4"
  },

  pagamentos: {
    mpesa:   { numero: "POR_DEFINIR", nomeTitular: "POR_DEFINIR", ativo: true },
    emola:   { numero: "POR_DEFINIR", nomeTitular: "POR_DEFINIR", ativo: true },
    entrega: { ativo: true },
    integracaoAutomatica: { ativa: false, provedor: null, endpoint: null }
  },

  regras: {
    reservaStockMinutos: 15,
    limiteTentativasCodigoSecreto: 5,
    validadeCodigoSecretoDias: 30,
    custoEntregaDefinidoPeloAdmin: true,
    permitirCompraConvidado: true,
    permitirPagamentoNaEntrega: true
  },

  // IMPORTANTE: Mudou para false! Agora o site vai tentar ligar ao Firebase.
  modoDemo: false
};

function isFirebaseConfigurado() {
  return CONFIG.firebaseConfig.apiKey !== "POR_DEFINIR";
}

function formatarMZN(valor) {
  return new Intl.NumberFormat(CONFIG.loja.locale, {
    style: "currency",
    currency: CONFIG.loja.moeda,
    minimumFractionDigits: 2
  }).format(valor);
}