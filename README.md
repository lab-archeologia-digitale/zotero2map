# zotero2map
A [LAD](https://lad.uniroma1.it) project to make a webGIS out of your [Zotero](zotero.org/) bibliograpfy.

## Roadmap

### Backend

- [x] Creare un modulo `getBiblio.mjs` che prendere tutti (o alcuni) record da una gruppo Zotero
  - [ ] il modulo deve poter operare su più gruppi / librerie
- [ ] Creare un modulo che carica l'ontologia (`ontology.json`) e analizza il risultato di `getBiblio`, crea e salva il (Geo)JSON finale utile al frontend


### Frontend
- [x] Prima bozza grafica
- [ ] Implementare il filtro dei marker in base alla ricerca dell'utente
  - [ ] Implemenatre la ricerca di testo libero dell'utente che va a guaradre in autore/i, titolo, altro?
  - [ ] Implementare un menu a tendina nidificato che usa tutti i tag disponibili