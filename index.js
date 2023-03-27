////////////////////////////////////////////////////////////////////
// MODULI
///////////////////////////////////////////////////////////////////
const data = require("./ontologia.json");
const fs = require("fs");
const http = require("http");
const url = require("url");

////////////////////////////////////////////////////////////////////
// PACKAGE
///////////////////////////////////////////////////////////////////
const { default: api } = require("zotero-api-client");
const { maplibregl } = require("maplibre-gl");

////////////////////////////////////////////////////////////////////
// GEOLOCALIZZAZIONE DEI DATI ZOTERO
///////////////////////////////////////////////////////////////////
const getBiblio = async () => {
  // MI COLLEGO ALLA LIBRERIA ZOTERO
  const response = await api().library("group", 336647).items().get();

  // SALVO LA BIBLIOGRAFIA IN UNA VARIABILE ITEMS CHE RESTITUISCE I LIBRI COME UN ARRAY
  const items = response.getData();
  // console.log(items);

  // LEGGO I DATI DELL'ONTOLOGIA
  // console.log(data);
  //let keys = Object.keys(data.voc); // array delle voci principali dell'ontologia
  // console.log(keys);
  // LEGGO LE PROPRIETà CHE STANNO DENTRO LE VOCI PRINCIPALI DELL'ONTOLOGIA
  let props = Object.values(data.voc);
  //console.log(props);

  // CICLO SU ARRAY DI TUTTI I LIBRI E CONFRONTO CON L'ARRAY DELLE VOCI PRINCIPALI DELL'ONTOLOGIA
  let libri = items.map((libro) => {
    // CICLO SU ARRAY DEI TAG
    libro.tags.map((val) => {
      let termini = val.tag;
      // console.log(termini);
      // FASE 1 -  SE UN TAG è UGUALE A UN VOC DELL'ONTOLOGIA
      if (data.voc.hasOwnProperty(termini)) {
        // console.log(`Termine trovato:${termini}`);
        // AGGIUNGI ALL'OGGETTO LIBRO LA PROPRIETà MATCH CHE SI COPIA TUTTI I VALORI DI QUEL VOC DELL'ONTOLOGIA CHE MATCHA
        libro.match = data.voc[termini];
        //console.log(libro.match);
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

  // console.log(libri);

  // SCRIVE IL NUOVO ARRAY SU UN FILE JSON DA DARE IN PASTO ALLA MAPPA CON L'AGGIUNTA DELLA PROPRIETA' COORD PER OGNI LIBRO

  fs.writeFile("./zotero.json", JSON.stringify(libri), "utf-8", (err) => {
    console.log("Il file è stato scritto correttamente");
  });
  return libri;
};
(async () => {
  const x = await getBiblio();
})();

////////////////////////////////////////////////////////////////////
// TEMPLATE
///////////////////////////////////////////////////////////////////

const templateIndex = fs.readFileSync(
  `${__dirname}/templates/index.html`,
  "utf-8"
);

////////////////////////////////////////////////////////////////////
// SERVER
///////////////////////////////////////////////////////////////////

// CREO IL SERVER CON IL ROUTING URL

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // HOMEPAGE
  if (pathname === "/") {
    // scrive nell'heading lo status code
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    res.end(templateIndex);

    // Not founD
  } else {
    // scrive l'header
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "Not-found",
    });
    // risponde con pagina non trovata
    res.end("<h1>Page not found!</h1>");
  }
});

// SI METTE IL SERVER IL ASCOLTO DELLE RICHIESTE DEL CLIENT
server.listen(8080, "127.0.0.1", () => {
  console.log("Il server è attivo sulla porta 8080");
});
