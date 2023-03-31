import fs from 'fs';

const geoJson = {
  "type": "FeatureCollection",
  "features": []
};

const makeGeoJson = (geojsonpath, parsedData) => {
  Object.values(parsedData).forEach(item => {
    geoJson.features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: item.geo
      },
      properties: {
        name: item.prefLabel,
        prefLabel: item.prefLabel,
        altLabel: item.altLabel,
        biblio: item.biblio
      }
    })
  });
  
  fs.writeFileSync(geojsonpath, JSON.stringify(geoJson, null, 2));
};


export default makeGeoJson;