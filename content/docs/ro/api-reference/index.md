---
title: "Referință API"
description: "Specificații complete pentru API-ul REST și endpoint-urile de revalidare Wildfire."
order: 3
badge: "REST"
---

# Referință API

Documentația tehnică a endpoint-urilor REST oferite de platforma **Wildfire Docs**.

## Endpoint-uri Principale

### Căutare Globală
```http
GET /api/search?q={query}&locale={en|ro}
```
Returnează rezultatele indexate și fragmentele de text corespunzătoare termenului căutat în limba selectată.

### Revalidare On-Demand
```http
POST /api/revalidate
Content-Type: application/json
x-webhook-secret: <SECRET_KEY>

{
  "slug": "getting-started/installation",
  "locale": "ro"
}
```
Revalidează pagina statică instantaneu fără a recompila întregul proiect.
