---
title: "Depanare Erori"
description: "Rezolvarea problemelor frecvente de compilare, permisiuni Git sau porturi de rețea."
order: 6
badge: "Depanare"
---

# Depanare Erori

Iată soluțiile rapide pentru cele mai întâlnite situații:

### Portul 3000 este deja utilizat
Dacă portul `3000` este ocupat de un alt proces:
```bash
npx kill-port 3000
# sau pornește pe un port alternativ:
npm run dev -- -p 3001
```

### Erori de cache Turbopack
Șterge folderul `.next` și recompilează:
```bash
rm -rf .next
npm run build
```
