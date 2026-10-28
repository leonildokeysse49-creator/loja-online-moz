/**
 * Autenticação Real com Firebase Auth e Firestore.
 */

let utilizadorLogado = null;

auth.onAuthStateChanged((user) => {
  if (user) {
    db.collection("users").doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        utilizadorLogado = { uid: user.uid, email: user.email, ...doc.data() };
      } else {
        // Se for o Admin e não tiver documento na base de dados, cria um perfil básico
        const isAdmin = user.email === "admin@loja.co.mz";
        utilizadorLogado = { 
          uid: user.uid, 
          email: user.email, 
          nome: isAdmin ? "Administrador Master" : "Cliente", 
          telefone: "" 
        };
      }
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
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    await db.collection("users").doc(user.uid).set({
      nome: nome,
      email: email,
      telefone: telefone,
      criadoEm: new Date().toISOString()
    });
    return { ok: true };
  } catch (error) {
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
    return { ok: false, erro: "E-mail ou palavra-passe incorretos." };
  }
}

async function terminarSessao() {
  await auth.signOut();
  window.location.href = "login.html"; // Certifica-te que este link está correto para a pasta conta/
}

function protegerPagina() {
  if (utilizadorLogado === null) {
    document.addEventListener("authReady", () => {
      if (!utilizadorLogado) window.location.href = "login.html";
    });
  }
}

async function atualizarUtilizador(dados) {
  if (!utilizadorLogado) return;
  try {
    await db.collection("users").doc(utilizadorLogado.uid).set(dados, { merge: true });
    utilizadorLogado = { ...utilizadorLogado, ...dados };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
  }
}