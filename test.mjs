import getBiblio from "./getBiblio.mjs"; // live
import getBiblioLocal from "./getBiblioLocal.mjs"; // test

console.log(await getBiblio()); // live
console.log(await getBiblioLocal()); // test