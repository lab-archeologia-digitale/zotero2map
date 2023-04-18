var map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json", // stylesheet location
  center: [12.473681303732805, 41.91713343854614], // starting position [lng, lat]
  zoom: 5, // starting zoom
});

// GEOLOCATION
var geocoder_api = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      let request =
        "https://nominatim.openstreetmap.org/search?q=" +
        config.query +
        "&format=geojson&polygon_geojson=1&addressdetails=1";
      const response = await fetch(request);
      const geojson = await response.json();
      for (let feature of geojson.features) {
        let center = [
          feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
          feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
        ];
        let point = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: center,
          },
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ["place"],
          center: center,
        };
        features.push(point);
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    return {
      features: features,
    };
  },
};
map.addControl(
  new MaplibreGeocoder(geocoder_api, {
    maplibregl: maplibregl,
  })
);

// CONTROLLER
map.addControl(new maplibregl.NavigationControl());

//Add multiple geometries from one GeoJSON source

map.on("load", function () {
  map.addSource("Zoterobook", {
    type: "geojson",
    // Use a URL for the value for the `data` property.
    data: "../data/mappedBiblio.geojson",
  });

  map.addLayer({
    id: "book-boundary",
    type: "fill",
    source: "Zoterobook",
    paint: {
      "fill-color": "#888888",
      "fill-opacity": 0.4,
    },
    filter: ["==", "$type", "Polygon"],
  });

  map.addLayer({
    id: "book-point",
    type: "circle",
    source: "Zoterobook",
    paint: {
      "circle-radius": 6,
      "circle-color": "#B42222",
    },
    filter: ["==", "$type", "Point"],
  });
});
