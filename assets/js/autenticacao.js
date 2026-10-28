/**
 * Autenticação Real com Firebase Auth e Firestore.
 */

// Variável global para sabermos quem está logado
let utilizadorLogado = null;

// O Firebase avisa-nos sempre que o estado de login muda
auth.onAuthStateChanged((user) => {
  if (user) {
    // Se o utilizador estiver logado, vamos buscar os dados extra (nome, telefone) ao Firestore
    db.collection("users").doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        utilizadorLogado = { uid: user.uid, email: user.email, ...doc.data() };
      } else {
        utilizadorLogado = { uid: user.uid, email: user.email, nome: "Cliente", telefone: "" };
      }
      // Avisa as páginas que o utilizador está pronto
      document.dispatchEvent(new Event("authReady"));
    });
  } else {
    utilizadorLogado = null;
    document.dispatchEvent(new Event("authReady"));
  }
});

function obterUtilizadorAtual() {
  return utilizadorLogado;
}

async function registarUtilizador(nome, email, telefone, password) {
  try {
    // 1. Cria a conta no Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // 2. Guarda os dados extra na coleção "users"
    await db.collection("users").doc(user.uid).set({
      nome: nome,
      email: email,
      telefone: telefone,
      criadoEm: new Date().toISOString()
    });

    return { ok: true };
  } catch (error) {
    console.error("Erro no registo:", error);
    let msg = "Erro ao criar conta.";
    if (error.code === "auth/email-already-in-use") msg = "Este e-mail já está registado.";
    if (error.code === "auth/weak-password") msg = "A palavra-passe deve ter pelo menos 6 caracteres.";
    return { ok: false, erro: msg };
  }
}

async function loginUtilizador(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    return { ok: true };
  } catch (error) {
    console.error("Erro no login:", error);
    return { ok: false, erro: "E-mail ou palavra-passe incorretos." };
  }
}

async function terminarSessao() {
  await auth.signOut();
  window.location.href = "login.html";
}

function protegerPagina() {
  // Se a página for chamada e o Firebase ainda estiver a carregar, esperamos
  if (utilizadorLogado === null) {
    document.addEventListener("authReady", () => {
      if (!utilizadorLogado) window.location.href = "login.html";
    });
  } else {
    return true;
  }
}

async function atualizarUtilizador(dados) {
  if (!utilizadorLogado) return;
  try {
    await db.collection("users").doc(utilizadorLogado.uid).update(dados);
    utilizadorLogado = { ...utilizadorLogado, ...dados };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
  }
}