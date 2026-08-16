---
title: "Configurare Webhooks"
description: "Automatizarea actualizărilor de documentație folosind webhook-uri GitHub."
order: 2
badge: "Automatizare"
---

# Configurare Webhooks

Conectează depozitul GitHub pentru a revalida paginile automat la fiecare `git push`.

## Pași de Configurare pe GitHub

1. Accesează **Settings > Webhooks > Add webhook** în depozitul tău.
2. Setează **Payload URL** la: `https://domeniul-tau.com/api/revalidate`.
3. Alege `application/json` ca **Content type**.
4. Introdu cheia secretă definită în variabila de mediu `REVALIDATION_SECRET`.
5. Selectează evenimentul **Just the push event** și salvează.
