// Include the Ontology
import ontology from "../data/ontology.json" assert { type: "json" };

const results =  {};

const addBiblioResult = (tag, zoteroItem) => {
  let added = 0;

  if (!ontology.voc.hasOwnProperty(tag)){
    console.log(`Missing key ${tag} from Ontology`);
    return added;
  }

  if (!results.hasOwnProperty(tag)){
    results[tag] = ontology.voc[tag];
    results[tag].biblio = [];
  }

  const formattedItem = {
    "id": zoteroItem.key,
    "title": zoteroItem.title,
    "author_date":zoteroItem.creators.map(e => e.lastName).join(", ") + '. ' + zoteroItem.date
  }
  added++;
  results[tag].biblio.push(formattedItem);

  if(ontology.voc[tag].hasOwnProperty("broader")){
    addBiblioResult(ontology.voc[tag].broader, zoteroItem);
  }
  return added;
};

const parseBiblio = (biblioRawData) => {

  biblioRawData.forEach(bibItem => {

    let found = false;
    if (bibItem.tags.length === 0){
      console.log(`Attenzione: ${bibItem.key} non ha alcun tag.`);
      return results;
    }
    bibItem.tags.forEach( tagObj => {
      const tag = tagObj.tag;
      if (ontology.voc.hasOwnProperty(tag)){
        found = true;
        addBiblioResult(tag, bibItem)
      }
    });
    if (found === false){
      // TODO: Riporta da qualche fare che ho un elemento bibliografico senza dati geografici
      console.log(`Attenzione: ${bibItem.key} non ha alcun tag geografico valido. I suoi tag sono ${bibItem.tags.map(t => t.tag).join(", ")}`);
      return results;
    }
  });

  if (Object.keys(results).length > 0){
    console.log(`results is empty! No match found!`)
  }

  return results;
}

export default parseBiblio;
