import getBiblio from "./backend/getBiblio.mjs";
import fs from "fs";
const ontologyPath = "./data/map.geojson";
const ontology = JSON.parse(fs.readFileSync(ontologyPath));
const elem = ontology.features;

function returnVoc() {
  const exVoc = {};
  for (const item of elem) {
    let nome = item.properties.name;
    exVoc[nome] = item.properties;
  }
  return exVoc;
}

const voc = returnVoc();

let biblio = await getBiblio();

/**
 * Destruttura il tags item property e restituisce un array di tag
 * @param {object} biblio item della risposta della libreria Zotero
 * @param {object} voc voci dell'ontologia
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
  // Funzioni da eseguire in ordine
  // Estrae i tag dagli item della biblio
  // updateItemObjWithCoordinatesFromVocSkosBroader prova ad aggiungere le coordinate se il match è con broader
  // updateItemObjWithMatchFromVocProperties se c'è corrispondenza con voc
 * @param {object} item item della risposta della libreria Zotero
 * @param {object} voc voci dell'ontologia
 */
function mapItemByVoc(item, voc) {
  const tags = extractTags(item);
  updateItemObjWithMatchFromVocProperties(item, voc, tags);
  updateItemObjWithCoordinatesFromVocSkosBroader(item, voc, tags);
}

/**
 * Estrae i tag dalla biblio
 * @param {object} item  item della risposta della libreria Zotero
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

const zoteroBiblioMappedWithVoc = parseBiblio2(biblio, voc);

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

const features = createFeaturesFromMappedLibraryItems(
  zoteroBiblioMappedWithVoc
);

const geo = {
  type: "FeatureCollection",
  features,
};

const geoFeatures = geo.features;

function returnGeo() {
  const featuresGeo = {};
  for (const item of geoFeatures) {
    let nome = item.properties.name;
    featuresGeo[nome] = item.properties;
  }
  return featuresGeo;
}

const feature = returnGeo();

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

console.log(newMap);
const geoJson = returnFinalGeojson(feature, elem);

fs.writeFileSync("./zotero2.geojson", JSON.stringify(geoJson, null, 2), {
  encoding: "utf-8",
});
