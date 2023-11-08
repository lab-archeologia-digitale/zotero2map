//import bookData from "./mappedBiblio.geojson" assert { type: "json" };

// MODIFICA PER FIREFOX CON XMLHttpRequest
let bookData;

// Crea una nuova richiesta XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open("GET", "data/mappedBiblio.geojson", true);

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // ASSEGNA ALLA VARIABILE IL CONTENUTO DEL JSON
    bookData = JSON.parse(xhr.responseText);
  }
};

xhr.send();

// INIZIO CONFIGURAZIONE MAPPA

var map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json", // stylesheet location
  center: [19.935146, 41.280761], // starting position [lng, lat]
  zoom: 5, // starting zoom
});

// CONTROLLER
map.addControl(new maplibregl.NavigationControl(), "bottom-right");

// CREA ELEMENTO POPUP
const popup = new maplibregl.Popup({
  closeButton: false,
});

// LISTA ELEMENTI
const listingEl = document.getElementById("feature-listing");

// FILTRI
const layerIDs = []; // Will contain a list used to filter against.
const filterInput = document.getElementById("filter-input");

// SEZIONE AGGIUNGI LAYER
map.on("load", function () {
  map.addSource("Zoterobook", {
    type: "geojson",
    // Use a URL for the value for the `data` property.
    data: bookData,
  });

  // Funzione per pulire il nome del layer
  function cleanLayerName(name) {
    // Rimuovi caratteri speciali e spazi
    return name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  }

  // CICLIO PER OGNI ELEMENTO VOC DEL GEOJSON CREA IL LAYER VISIBILE

  bookData.features.forEach(function (feature) {
    const name = feature.properties["name"];
    const cleanedName = cleanLayerName(name);
    const layerID = cleanedName;
    const geometryType = feature.geometry.type; // Dichiarare geometryType qui

    // Aggiungi un layer per nome VOC se non è stato già aggiunto.
    if (!map.getLayer(layerID)) {
      // CONTROLLA LA GEOMETRIA SE E' PUNTO O POLIGONO
      const layerType = geometryType === "Point" ? "circle" : "fill"; // Scegli il tipo di layer in base al tipo di geometria

      // CAMBIA LA GRAFICA IN FUNZIONE DELLA GEOMETRIA
      let layerPaint; // Definire l'oggetto paint in base al tipo di geometria
      if (geometryType === "Point") {
        layerPaint = {
          "circle-color": "red",
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        };
      } else if (geometryType === "Polygon") {
        layerPaint = {
          "fill-color": "#888888",
          "fill-opacity": 0.4,
          "fill-outline-color": "white",
        };
      }

      // AGGIUNGE IL LAYER ALLA MAPPA

      map.addLayer({
        id: layerID,
        type: layerType, // Utilizza "circle" o "fill" in base al tipo di geometria
        source: "Zoterobook",
        paint: layerPaint,
        filter: ["all", ["==", "name", name], ["==", "$type", geometryType]], // FILTRA PER NOME E GEOMETRIA
      });

      layerIDs.push(layerID);

      // Aggiungi un event listener per mostrare i risultati sulla sidebar di sinistra
      map.on("click", layerID, (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties["name"];
        const altLabel = e.features[0].properties["altLabel"];
        const broader = e.features[0].properties["broader"];
        const biblio = e.features[0].properties["biblio"];
        var parsed = JSON.parse(biblio);
        const empty = document.createElement("p");
        // Clear any existing listings
        listingEl.innerHTML = "";

        // Costruisce la descrizione e include biblio se c'è
        let description = `
          <h3>Location: ${name}</h3>
          <p>Aternatives names: ${altLabel}</p>
          <p>Broader: ${broader}</p>
        `;

        if (parsed) {
          description += "<h4>Bibliography:</h4>";
          description += "<ul>";

          for (const biblioItem of parsed) {
            const biblioTitle = biblioItem["title"];
            const biblioTag = biblioItem["tag"];
            const biblioAuthorDate = biblioItem["author_date"];

            description += `<li><b>Title:</b> ${biblioTitle}</li>`;
            description += `<li><b>Tag:</b> ${biblioTag}</li>`;
            description += `<li><b>Author:</b> ${biblioAuthorDate}</li><hr>`;
          }

          description += "</ul>";
        }

        // creo il div nella sidebar
        const itemLink = document.createElement("div");
        // aggiungo la descrizione
        itemLink.innerHTML = description;
        // appendo la descrizione nella sidebar
        listingEl.appendChild(itemLink);

        // Imposta il contenuto anche in un popup basandosi sulle coordinate coordinate.
        // popup.setLngLat(coordinates).setHTML(description).addTo(map);
      });

      // fine on click
    }
  });

  // SEZIONE RICERCA

  // aggiunge un event listener al campo input e salva il valore nella costante value

  filterInput.addEventListener("keyup", (e) => {
    // Valore da cercare (in minuscolo)
    const value = e.target.value.trim().toLowerCase();

    // per ogni features che sono in bookdata

    bookData.features.forEach((feature) => {
      // Converte tutte le proprietà della feature in minuscolo per rendere la ricerca case-insensitive.
      const properties = Object.values(feature.properties)
        .filter((property) => typeof property === "string")
        .map((property) => property.toLowerCase());

      // Verifica se il valore cercato è presente in una qualsiasi delle proprietà della feature.
      let isMatch = properties.some((property) => property.includes(value));

      // Ottieni il layerID associato a questa feature.
      const name = feature.properties["name"];
      const cleanedName = cleanLayerName(name);
      const layerID = cleanedName;

      // Estendi la ricerca alle proprietà "title," "tag," e "author_date" dell'oggetto "biblio"
      const biblio = feature.properties["biblio"];
      if (biblio && Array.isArray(biblio)) {
        for (const biblioItem of biblio) {
          const biblioTitle = biblioItem["title"];
          const biblioTag = biblioItem["tag"];
          const biblioAuthorDate = biblioItem["author_date"];

          const biblioProperties = [biblioTitle, biblioTag, biblioAuthorDate];
          for (const property of biblioProperties) {
            if (typeof property === "string") {
              if (property.toLowerCase().includes(value)) {
                isMatch = true;
                break;
              }
            }
            if (Array.isArray(property)) {
              const propertiesLowerCase = property.map((prop) =>
                typeof prop === "string" ? prop.toLowerCase() : prop
              );
              if (propertiesLowerCase.some((prop) => prop.includes(value))) {
                isMatch = true;
                break;
              }
            }
          }

          if (isMatch) {
            break;
          }
        }
      }

      // Imposta la visibilità del layer in base alla corrispondenza.
      map.setLayoutProperty(
        layerID,
        "visibility",
        isMatch ? "visible" : "none"
      );
    });
  });

  // fine onload
});
