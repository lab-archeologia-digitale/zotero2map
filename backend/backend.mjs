import fs from "fs";
import getBiblio from "./getBiblio.mjs";
import mapBiblio2Onto from "./mapBiblio2Onto.mjs";
// import mapBiblio2Onto2 from "./mapBiblio2Onto2.mjs";

const ontologyPath = "./data/map.geojson";
const ontology = JSON.parse(fs.readFileSync(ontologyPath));

const bibliography = await getBiblio();

const test = mapBiblio2Onto(bibliography, ontology);

fs.writeFileSync("data/mappedBiblio.geojson", JSON.stringify(test, null, 2));