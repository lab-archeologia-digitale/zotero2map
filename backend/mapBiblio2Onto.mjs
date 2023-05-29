/**
 *
 * @param {Array} features: Array of ontology (GeoJSON) featurtes
 * @returns {Object} Object containing (only) properties of each feature.
 *                   The name property is used as index
 *                    e.g.: { "Chaonia": {"name": "Chaonia", "altLabel": "Kaonia, Caonia", "broader": "Epirus"}, ...
 */
function returnVoc(features) {
  const ret = {};
  for (const item of features) {
    let nome = item.properties.name;
    ret[nome] = item.properties;
    let altLabel = item.properties.altLabel;
    ret[altLabel] = item.properties;
  }
  return ret;
}

/**
 * Prende l'ogetto bibliografia, come scaricato da Zotero
 * e ad ogni item aggiunge una propietà chiamata match, un array di tag del vocabolario
 * @param {Object} biblio item della risposta della libreria Zotero
 * @param {Object} voc voci dell'ontologia
 * @returns {Object} L'oggetto bibliografia come scaricato di Zotero con l'aggiunta di una proprietà chiamata match,
 *                  consistente in un Array di tag del vocabolario
 */
function parseBiblio(biblio, voc) {
  const map = [];
  for (const item of biblio) {
    mapItemByVoc(item, voc);
    map.push(item);
  }
  return map;
}

/**
 * Mappa gli item della bibliografia e confronta con l'ontologia
 * Funzioni da eseguire in ordine:
 * - Estrae i tag dagli item della biblio
 * - updateItemObjWithMatchFromVocProperties se c'è corrispondenza con voc
 * @param {Object} item item della risposta della libreria Zotero
 * @param {Object} voc voci dell'ontologia
 */
function mapItemByVoc(item, voc) {
  const biblioItemTags = item?.tags.length
    ? [...item.tags.map((obj) => obj.tag)]
    : [];
  updateItemObjWithMatchFromVocProperties(item, voc, biblioItemTags);
}

/**
 * Aggiorna gli item di Zotero in base alla risposta
 * crea la prop match se c'è corrispondenza con voc
 * @param {object} item item bibliografico della risposta della libreria Zotero
 * @param {object} voc voci dell'ontologia
 * @param {Array.<string>} biblioItemTags tags degli item di Zotero
 * @returns {void}
 */
function updateItemObjWithMatchFromVocProperties(
  item,
  voc,
  biblioItemTags = []
) {
  if (!Array.isArray(biblioItemTags))
    throw new Error("is required tags array or string");
  const vocTags = Object.keys(voc);
  if (!item.match) item.match = [];
  for (const tag of biblioItemTags) {
    if (vocTags.includes(tag)) {
      // voc[tag]._id = tag;
      item.match.push(voc[tag]);
    }
  }
}

/**
 * Raggruppa tutti i libri per matched tag e crea un file GeoJESON
 * @param {Object} zoteroBiblioMappedWithVoc Bibliografia con proprietà match
 * @param {Object} ontology: Ontologia originale (GeoJSON)
 * @returns {Array}: L'ontologia originale con, per ogni elemento, proprietà biblio, array con bibliografia
 */
function mapBibliography(zoteroBiblioMappedWithVoc, ontology) {
  for (const zoteroItem of zoteroBiblioMappedWithVoc) {
    if (zoteroItem?.match.length) {
      // Loop in `match` property of each Zotero item
      zoteroItem.match.forEach((m) => {
        // Loop each element of the ontlogy
        ontology.features.forEach((mapEl) => {
          // If the match element is the same of the ontology `name` property, add it to the result object
          if (mapEl.properties.name === m.name) {
            if (!mapEl.properties.hasOwnProperty("biblio")) {
              mapEl.properties.biblio = [];
            }
            mapEl.properties.biblio.push({
              key: zoteroItem.key,
              title: zoteroItem.title,
              tag: zoteroItem.tags,
              author_date:
                zoteroItem.creators
                  .map((e) => {
                    if (e.creatorType === "author") {
                      return e.lastName;
                    } else {
                      return false;
                    }
                  })
                  .filter((e) => e)
                  .join(", ") +
                ". " +
                zoteroItem.date,
            });
          }
        });
      });
    }
  }

  return ontology;
}

const mapBiblio2Onto = (bibliography, ontology) => {
  const voc = returnVoc(ontology.features);

  const zoteroBiblioMappedWithVoc = parseBiblio(bibliography, voc).filter(
    (e) => e.match.length > 0
  );

  return mapBibliography(zoteroBiblioMappedWithVoc, ontology);
};

export default mapBiblio2Onto;
