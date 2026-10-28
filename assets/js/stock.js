/**
 * Lógica de gestão de stock.
 */
async function obterStockProduto(produtoId) {
  try {
    const doc = await db.collection("products").doc(produtoId).get();
    if (doc.exists) {
      return doc.data().stock || 0;
    }
    return 0;
  } catch (error) {
    console.error("Erro ao ler stock:", error);
    return 0;
  }
}

async function atualizarStock(produtoId, novaQuantidade) {
  try {
    await db.collection("products").doc(produtoId).update({
      stock: novaQuantidade
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar stock:", error);
    return false;
  }
}