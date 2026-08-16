---
title: "Componente MDX"
description: "Ghid de utilizare pentru componentele interactive încorporate în fișierele Markdown."
order: 2
badge: "UI / MDX"
---

# Componente MDX Interactive

Poți include elemente dinamice direct în fișierele Markdown:

## 1. Callout-uri

<Callout type="tip" title="Notă Importantă">
Acesta este un apel informativ stilizat cu liquid glass și accente ember.
</Callout>

<Callout type="warning" title="Avertisment">
Asigură-te că rulezi migrările înainte de a aplica modificările în producție.
</Callout>

## 2. Carduri

<CardGrid>
  <Card title="Card Documentație" description="Descriere succintă pentru navigare ușoară." href="/docs/ro" icon="Layers" />
  <Card title="Ghid API" description="Endpoint-uri și exemple de cod." href="/docs/ro/api-reference" icon="Terminal" />
</CardGrid>
