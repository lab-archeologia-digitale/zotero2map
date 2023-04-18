<script>
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
  </script>