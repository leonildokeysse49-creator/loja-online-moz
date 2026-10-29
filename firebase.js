/**
 * Inicialização do Firebase
 */
const app = firebase.initializeApp(CONFIG.firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Ativar persistência offline com tratamento de erro seguro
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Isto acontece se já houver abas abertas ou falha de cache.
        console.warn("Aviso: Persistência offline não pôde ser ativada (múltiplas abas abertas).");
    } else if (err.code == 'unimplemented') {
        console.warn("Aviso: O navegador não suporta persistência offline.");
    }
});

console.log("🔥 Firebase ligado com sucesso ao projeto:", CONFIG.firebaseConfig.projectId);