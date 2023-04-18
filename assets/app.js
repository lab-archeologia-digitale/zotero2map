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
  map.addSource("national-park", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-121.353637, 40.584978],
                [-121.284551, 40.584758],
                [-121.275349, 40.541646],
                [-121.246768, 40.541017],
                [-121.251343, 40.423383],
                [-121.32687, 40.423768],
                [-121.360619, 40.43479],
                [-121.363694, 40.409124],
                [-121.439713, 40.409197],
                [-121.439711, 40.423791],
                [-121.572133, 40.423548],
                [-121.577415, 40.550766],
                [-121.539486, 40.558107],
                [-121.520284, 40.572459],
                [-121.487219, 40.550822],
                [-121.446951, 40.56319],
                [-121.370644, 40.563267],
                [-121.353637, 40.584978],
              ],
            ],
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-121.415061, 40.506229],
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-121.505184, 40.488084],
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-121.354465, 40.488737],
          },
        },
      ],
    },
  });

  map.addLayer({
    id: "park-boundary",
    type: "fill",
    source: "national-park",
    paint: {
      "fill-color": "#888888",
      "fill-opacity": 0.4,
    },
    filter: ["==", "$type", "Polygon"],
  });

  map.addLayer({
    id: "park-volcanoes",
    type: "circle",
    source: "national-park",
    paint: {
      "circle-radius": 6,
      "circle-color": "#B42222",
    },
    filter: ["==", "$type", "Point"],
  });
});
