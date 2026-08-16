---
title: "Integrare GitHub"
description: "Sincronizare completă a metadatelor Git, autorilor, avatarurilor și butoanelor de editare a paginii."
order: 1
badge: "GitOps"
---

# Integrare GitHub

Fiecare articol din **Wildfire Docs** este conectat direct la istoricul Git.

## Metadate Extrase Automat

- **Autor & Avatar**: Extras din semnătura commit-ului (`@iannC69`).
- **Data Ultimei Modificări**: Calculată din timestamp-ul Git în timp real.
- **Hash Commit**: Identificator scurt cu legătură directă către depozitul GitHub.
- **Buton Edit Page**: Permite colaboratorilor să deschidă fișierul direct în editorul GitHub pentru pull request-uri rapide.

```bash
# Sincronizare manuală
git add .
git commit -m "docs: actualizare ghiduri"
git push origin main
```
