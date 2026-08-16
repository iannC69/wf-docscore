---
title: "Implementare Docker"
description: "Construirea și rularea Wildfire Docs în containere izolate Docker."
order: 5
badge: "Container"
---

# Implementare Docker

Poți rula Wildfire Docs într-un container complet izolat:

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Rulează containerul cu:

```bash
docker build -t wildfire-docs .
docker run -p 3000:3000 wildfire-docs
```
