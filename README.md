# zotero2map
A [LAD](https://lad.uniroma1.it) project to make a webGIS out of your [Zotero](zotero.org/) bibliograpfy.

## Roadmap

### Backend

Per avviare il backend:
```js
node backend/backend.mjs
```

oppure 

```js
npm run backend
```

### Frontend
- [x] Prima bozza grafica
- [ ] Implementare il filtro dei marker in base alla ricerca dell'utente
  - [ ] Implemenatre la ricerca di testo libero dell'utente che va a guaradre in autore/i, titolo, altro?
  - [ ] Implementare un menu a tendina nidificato che usa tutti i tag disponibili