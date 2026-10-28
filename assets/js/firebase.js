/**
 * Inicialização do Firebase
 */
const app = firebase.initializeApp(CONFIG.firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Ativar persistência offline (opcional, mas bom para redes lentas)
db.enablePersistence().catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log("Persistência falhou: múltiplas abas abertas.");
    } else if (err.code == 'unimplemented') {
        console.log("O navegador não suporta persistência offline.");
    }
});

console.log("🔥 Firebase ligado com sucesso ao projeto:", CONFIG.firebaseConfig.projectId);