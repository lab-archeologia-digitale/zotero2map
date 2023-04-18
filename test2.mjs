import getBiblio from "./backend/getBiblio.mjs";
import fs from "fs";

const ontologyPath = "./data/map.geojson";
const ontology = JSON.parse(fs.readFileSync(ontologyPath));

/**
 * 
 * @param {Array} features: Array of ontology (GeoJSON) featurtes
 * @returns {Object} Object containing (only) properties of each feature.
 *                   The name property is used as index
 *                    e.g.: { "Chaonia": {"name": "Chaonia", "altLabel": "Kaonia, Caonia", "broader": "Epirus"}
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
 * Destruttura il tags item property e restituisce un array di tag
 * @param {Object} biblio item della risposta della libreria Zotero
 * @param {Object} voc voci dell'ontologia
 */
function parseBiblio2(biblio, voc) {
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
  const tags = extractTags(item);
  updateItemObjWithMatchFromVocProperties(item, voc, tags);
  updateItemObjWithCoordinatesFromVocSkosBroader(item, voc, tags);
}

/**
 * Estrae i tag dalla biblio
 * @param {Object} item  item della risposta della libreria Zotero
 */
function extractTags(item) {
  return item?.tags.length ? [...item.tags.map((obj) => obj.tag)] : []; // [{tag: 'pippo' }] -> ['pippo']
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
  if (!Array.isArray(tags)) throw new Error("is required tags array og string");
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
 * Raggruppa i libri per matched tag
 */
function createFeaturesFromMappedLibraryItems(zoteroBiblioMappedWithVoc) {
  const accumulator = {};
  for (const book of zoteroBiblioMappedWithVoc) {
    if (book?.match.length) {
      const { shortTitle, title, creators } = book;

      const { _id: matchedTag, altLabel, geo } = book.match[0];

      const feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: geo,
        },
        properties: {
          name: matchedTag,
          prefLabel: matchedTag,
          altLabel,
          biblio: [],
        },
      };
      if (!accumulator[matchedTag]) accumulator[matchedTag] = feature;

      accumulator[matchedTag].properties.biblio.push({
        id: matchedTag,
        shortTitle,
        title,
        creators,
      });
    }
  }

  return Object.values(accumulator);
}

function returnGeo() {
  const featuresGeo = {};
  for (const item of geoFeatures) {
    let nome = item.properties.name;
    featuresGeo[nome] = item.properties;
  }
  return featuresGeo;
}


function returnFinalGeojson(feature, elem) {
  Object.values(elem).map((o) => {
    if (!o.properties.biblio) o.properties.biblio = [];
    Object.values(feature).map((a) => {
      if (o.properties.name === a.name) {
        o.properties.biblio.push(a.biblio);
      }
    });
  });
}




const voc = returnVoc(ontology.features);

let biblio = await getBiblio();

const zoteroBiblioMappedWithVoc = parseBiblio2(biblio, voc);

const features = createFeaturesFromMappedLibraryItems(zoteroBiblioMappedWithVoc);

const geo = {
  type: "FeatureCollection",
  features,
};

const geoFeatures = geo.features;

const feature = returnGeo();


console.log(newMap);
const geoJson = returnFinalGeojson(feature, ontology.features);

fs.writeFileSync("./zotero2.geojson", JSON.stringify(geoJson, null, 2), {
  encoding: "utf-8",
});