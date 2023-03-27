import * as fs from 'fs';
import getBiblio from "./getBiblio.mjs";

const tutti_record_zotero = await getBiblio();

fs.writeFileSync('cache-dati-zotero.json', JSON.stringify(tutti_record_zotero, null, 2));

console.log('Fatto!');