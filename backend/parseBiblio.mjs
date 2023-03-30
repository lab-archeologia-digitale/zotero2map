// Include the Ontology
import ontology from "../data/ontology.json" assert { type: "json" };
// import getBiblio from "./getBiblio.mjs";
import getBiblio from "./getBiblioLocal.mjs";

// LEGGO LE PROPRIETà CHE STANNO DENTRO LE VOCI PRINCIPALI DELL'ONTOLOGIA
let props = Object.values(ontology.voc);
//console.log(props);

// CICLO SU ARRAY DI TUTTI I LIBRI E CONFRONTO CON L'ARRAY DELLE VOCI PRINCIPALI DELL'ONTOLOGIA
let libri = biblio.map((libro) => {
  // CICLO SU ARRAY DEI TAG
  libro.tags.map((val) => {
    let termini = val.tag;
    console.log(termini);
    // FASE 1 -  SE UN TAG è UGUALE A UN VOC DELL'ONTOLOGIA
    if (ontology.voc.hasOwnProperty(termini)) {
      // console.log(`Termine trovato:${termini}`);
      // AGGIUNGI ALL'OGGETTO LIBRO LA PROPRIETà MATCH CHE SI COPIA TUTTI I VALORI DI QUEL VOC DELL'ONTOLOGIA CHE MATCHA
      libro.match = ontology.voc[termini];
      console.log(libro.match);
      // FASE 2 SE UN TAG NON è IN VOC CERCA DENTRO SKOS BROADER
      // SE C'è CORRISPONDENZA TRA TAG E VALORE DI SKOS BROADER ESTRAE SOLO LA PROPRIETA' GEO E VA A CERCARE IN TUTTI I LIBRI LO STESSO BROADER
    } else {
      props.forEach((prop) => {
        //console.log(prop.broader);
        //  console.log(prop.geo);
        if (prop.broader == termini) {
          console.log(`Termine trovato:${termini}`);
          libro.coords = prop.geo;
          console.log(libro.coords);
        }
      });
    }
  });
});
