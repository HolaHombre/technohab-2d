# Notices de licences tierces

TechnoHab est un dépôt public. Tout symbole importé ou adapté depuis une source
externe doit conserver ici sa provenance et sa licence.

## ArchLang

- Source : https://github.com/ChanMeng666/archlang
- Licence : MIT
- Usage TechnoHab actuel : source externe préférée et table de correspondance
  pour les symboles de mobilier (`assets/icon-provenance.data.js`).
- Révision : `ec9f9f771ed1d3154b475322289c88727f79bf60` (v1.36.0), auteur Chan Meng.
- État : 42 symboles de `assets/icons/furniture.svg` sont `adapted` : leur
  géométrie est celle de `fixtureGlyph` (`src/elements/fixtures-glyphs.ts`),
  convertie en SVG, mise à l'échelle du viewBox en cm, sans aplat, en trait
  `currentColor`. Les autres restent des dessins TechnoHab tant que leur fiche
  de provenance n'indique pas `adapted` ou `imported`.

```
MIT License — Copyright (c) 2026 Chan Meng
```
Régénération : `ARCHLANG_DIR=<clone> npm run icons:archlang` (`scripts/archlang-sprite.mts`).
Le texte complet de la licence figure dans le dépôt source (fichier LICENSE).

Si une géométrie ArchLang est reprise, la fiche de l'icône doit préciser au
minimum l'URL source, la révision, l'auteur, la licence et les modifications.
