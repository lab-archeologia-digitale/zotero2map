import cacheDatiZotero from "./cache-dati-zotero.json" assert { type: "json" };

const getBiblioLocal = async () => {
  return cacheDatiZotero;
};

export default getBiblioLocal;
