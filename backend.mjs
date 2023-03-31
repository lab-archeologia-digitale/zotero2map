import getBiblio from './backend/getBiblio.mjs';
import parseBiblio from './backend/parseBiblio.mjs';
import makeGeoJson from './backend/makeGeoJson.mjs';

const rawBiblioData = await getBiblio();
const parsedBiblioData = parseBiblio(rawBiblioData)
makeGeoJson('frontend.geojson', parsedBiblioData);