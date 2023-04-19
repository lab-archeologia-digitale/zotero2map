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
 * - updateItemObjWithCoordinatesFromVocSkosBroader prova ad aggiungere le coordinate se il match è con broader
 * - updateItemObjWithMatchFromVocProperties se c'è corrispondenza con voc
 * @param {Object} item item della risposta della libreria Zotero
 * @param {Object} voc voci dell'ontologia
 */
function mapItemByVoc(item, voc) {
  const tags = item?.tags.length ? [...item.tags.map((obj) => obj.tag)] : [];
  updateItemObjWithMatchFromVocProperties(item, voc, tags);
  updateItemObjWithCoordinatesFromVocSkosBroader(item, voc, tags);
}

/**
 * Aggiorna gli item di Zotero in base alla risposta
 * crea la prop match se c'è corrispondenza con voc
 * @param {object} item item della risposta della libreria Zotero
 * @param {object} voc voci dell'ontologia
 * @param {Array.<string>} tags tags degli item di Zotero
 * @returns {void}
 */
function updateItemObjWithMatchFromVocProperties(item, voc, tags = []) {
  if (!Array.isArray(tags)) throw new Error("is required tags array or string");
  const vocTags = Object.keys(voc);
  if (!item.match) item.match = [];
  for (const tag of tags) {
    if (vocTags.includes(tag)) {
      voc[tag]._id = tag;
      item.match.push(voc[tag]);
    }
  }
}

/**
 * Aggiorna gli item di Zotero in base alla risposta
 * se c'è corrispondenza tra un tag e broader inserisce la proprietà geo
 * @param {object} item item della risposta della libreria Zotero
 * @param {object} voc voci dell'ontologia
 * @param {Array.<string>} tags tags degli item di Zotero
 */
function updateItemObjWithCoordinatesFromVocSkosBroader(item, voc, tags) {
  if (!Array.isArray(tags))
    throw new Error("is required at not empty tags array og string");
  const vocFlatItems = Object.values(voc);
  if (!item.match.length) {
    for (const tag of tags) {
      for (const vocItem of vocFlatItems) {
        if (vocItem.broader === tag) {
          item.coords.push(vocItem.geo);
        }
      }
    }
  }
}

/**
 * Raggruppa tutti i libri per matched tag e crea un file GeoJESON
 * @param {Object} zoteroBiblioMappedWithVoc Bibliografia con proprietà match
 * @param {Object} ontology: Ontologia originale (GeoJSON)
 * @returns {Array}: L'ontologia originale con, per ogni elemento, proprietà biblio, array con bibliografia
 */
// function mapBibliography(zoteroBiblioMappedWithVoc, ontology) {
//   for (const zoteroItem of zoteroBiblioMappedWithVoc) {
//     if (zoteroItem?.match.length) {
//       zoteroItem.match.forEach((m) => {
//         ontology.features.forEach((mapEl) => {
//           if (mapEl.properties.name === m.name) {
//             if (!mapEl.hasOwnProperty("biblio")) {
//               mapEl.properties.biblio = [];
//             }
//             mapEl.properties.biblio.push({
//               key: zoteroItem.key,
//               title: zoteroItem.title,
//               author_date:
//                 zoteroItem.creators
//                   .map((e) => {
//                     if (e.creatorType === "author") {
//                       return e.lastName;
//                     } else {
//                       return false;
//                     }
//                   })
//                   .filter((e) => e)
//                   .join(", ") +
//                 ". " +
//                 zoteroItem.date,
//             });
//           }
//         });
//       });
//     }
//   }

//   return ontology;
// }

function accumulatore(zoteroBiblioMappedWithVoc) {
  const accumulator = {};
  for (const zoteroItem of zoteroBiblioMappedWithVoc) {
    if (zoteroItem?.match.length) {
      const { shortTitle, title, creators } = zoteroItem;
      const { _id: matchedTag } = zoteroItem.match[0];
      const gruppoLibriPerTag = {
        name: matchedTag,
        biblio: [],
      };
      if (!accumulator[matchedTag]) accumulator[matchedTag] = gruppoLibriPerTag;
      accumulator[matchedTag].biblio.push({
        id: matchedTag,
        shortTitle,
        title,
        creators,
      });
    }
  }
  return Object.values(accumulator);
}

function mapBibliography(biblioAggregata, ontology) {
  ontology.features.map((o) => {
    if (!o.properties.biblio) o.properties.biblio = [];
    biblioAggregata.map((a) => {
      if (o.properties.name === a.name) {
        o.properties.biblio.push(a.biblio);
      }
    });
  });

  return ontology;
}

const mapBiblio2Onto2 = (bibliography, ontology) => {
  const voc = returnVoc(ontology.features);

  const zoteroBiblioMappedWithVoc = parseBiblio(bibliography, voc);

  const biblioAggregata = accumulatore(zoteroBiblioMappedWithVoc);

  return mapBibliography(biblioAggregata, ontology);
};

export default mapBiblio2Onto2;
