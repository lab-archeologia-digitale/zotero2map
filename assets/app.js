var map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json", // stylesheet location
  center: [19.935146, 41.280761], // starting position [lng, lat]
  zoom: 5, // starting zoom
});

// CONTROLLER
map.addControl(new maplibregl.NavigationControl());

//AGGIUNGO DATI

map.on("load", function () {
  map.addSource("Zoterobook", {
    type: "geojson",
    // Use a URL for the value for the `data` property.
    data: "../data/mappedBiblio.geojson",
  });

  //ADD MULTIPLE GEOMETRIES FROM ONE GEOJSON SOURCE
  map.addLayer({
    id: "bookArea",
    type: "fill",
    source: "Zoterobook",
    paint: {
      "fill-color": "#888888",
      "fill-opacity": 0.4,
    },
    filter: ["==", "$type", "Polygon"],
  });

  //ADD MULTIPLE GEOMETRIES FROM ONE GEOJSON SOURCE
  map.addLayer({
    id: "bookPoint",
    type: "circle",
    source: "Zoterobook",
    paint: {
      "circle-color": "red",
      "circle-radius": 4,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
    filter: ["==", "$type", "Point"],
  });
});

// CREA ELEMENTO POPUP
const popup = new maplibregl.Popup({
  closeButton: false,
});

// COMPILA I POPUP CONTROLLANDO L'OVERLAPPING TRA ELEMENTI SOVRAPPOSTI CON VISUALIZZAZIONE MOUSEMOVE
map.on("mousemove", function (e) {
  // ELEMENTI PUNTUALI
  var pointFeatures = map.queryRenderedFeatures(e.point, {
    layers: ["bookPoint"],
  });
  // var pointFeatures = map.queryRenderedFeatures(e.point, { layers: ['bookPoint', 'altrolayer'] });
  if (pointFeatures.length > 0) {
    var feature = pointFeatures[0];
    // Populate the popup and set its coordinates
    popup
      .setLngLat(feature.geometry.coordinates)
      .setHTML(`${feature.properties.name} (${feature.properties.broader} ) `)
      .addTo(map);

    return;
  }

  // ELEMENTI AREALI
  // var polygonFeatures = map.queryRenderedFeatures(e.point, { layers: ['bookArea', 'altrolayer'] });
  var polygonFeatures = map.queryRenderedFeatures(e.point, {
    layers: ["bookArea"],
  });
  if (!polygonFeatures.length) {
    return;
  }

  var feature = polygonFeatures[0];

  // Populate the popup and set its coordinates
  popup
    .setLngLat(map.unproject(e.point))
    .setHTML(
      polygonFeatures
        .map(function (feature) {
          return feature.properties.name;
        })
        .join(", ")
    )
    .addTo(map);
});

map.on("mouseenter", "bookArea", () => {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "bookArea", () => {
  map.getCanvas().style.cursor = "";
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on("mouseenter", "bookPoint", () => {
  map.getCanvas().style.cursor = "pointer";
});

// Change it back to a pointer when it leaves.
map.on("mouseleave", "bookPoint", () => {
  map.getCanvas().style.cursor = "";
});

const filterEl = document.getElementById("feature-filter");
const listingEl = document.getElementById("feature-listing");

// EVENTI SUL CLICK DELL'ELEMENTO
map.on("click", function (e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ["bookPoint", "bookArea"],
  });
  const empty = document.createElement("p");
  // Clear any existing listings
  listingEl.innerHTML = "";
  if (features.length) {
    for (const feature of features) {
      const biblio = feature.properties.biblio;
      var parsed = JSON.parse(biblio);
      let biblioTitolo = [];
      parsed.forEach((e) => {
        let libro = e.title + " (" + e.author_date + ")";
        biblioTitolo.push(libro);
      });

      const itemLink = document.createElement("div");
      const titoloTag =
        '<i class="fa-solid fa-book"></i> <b>' +
        feature.properties.name +
        "</b><br>";
      itemLink.innerHTML = titoloTag;

      const label =
        '<i class="fa-solid fa-book"></i> <b>' +
        feature.properties.name +
        '</b><br><ul id="paginated-list" aria-live="polite"><li>' +
        biblioTitolo.join("<li>");
      itemLink.innerHTML = label;
      listingEl.appendChild(itemLink);
    }
    // Show the filter input
    filterEl.parentNode.style.display = "block";
  }
});
