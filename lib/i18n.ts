export type Locale = "en" | "ro";

export interface Translations {
  common: {
    searchPlaceholder: string;
    searchKbd: string;
    openMenu: string;
    closeMenu: string;
    backToHome: string;
    allRightsReserved: string;
    developedBy: string;
    loading: string;
    error: string;
  };
  navbar: {
    docsHome: string;
    explorer: string;
    search: string;
    language: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    githubRepo: string;
    layoutStandard: string;
    layoutFocus: string;
    layoutFull: string;
  };
  sidebar: {
    overview: string;
    documentationHub: string;
    navigation: string;
    explorerBadge: string;
    collapseSidebar: string;
    expandSidebar: string;
    productionEdge: string;
    systemStatus: string;
    allSystemsOperational: string;
    categories: {
      gettingStarted: string;
      coreFeatures: string;
      apiReference: string;
    };
  };
  docPage: {
    onThisPage: string;
    readingTime: string;
    minRead: string;
    words: string;
    updatedBy: string;
    postedBy: string;
    editPage: string;
    previousPage: string;
    nextPage: string;
    lastCommit: string;
    englishFallbackNotice: string;
  };
  feedback: {
    wasHelpful: string;
    yes: string;
    no: string;
    thankYou: string;
    feedbackQuestion: string;
    submit: string;
    openGitHubIssue: string;
    suggestEdit: string;
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    searchHint: string;
    quickStartBtn: string;
    recentlyUpdated: string;
    recentlyUpdatedSubtitle: string;
    viewAllChangelogs: string;
    modulesTitle: string;
    modulesSubtitle: string;
  };
  search: {
    title: string;
    placeholder: string;
    noResults: string;
    noResultsHint: string;
    poweredBy: string;
    pressEscToClose: string;
    navigateArrows: string;
    selectEnter: string;
    sections: {
      pages: string;
      headings: string;
    };
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    common: {
      searchPlaceholder: "Search documentation & APIs...",
      searchKbd: "Ctrl K",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      backToHome: "Back to Home",
      allRightsReserved: "All rights reserved.",
      developedBy: "Developed with precision",
      loading: "Loading...",
      error: "An error occurred",
    },
    navbar: {
      docsHome: "Docs Home",
      explorer: "Explorer",
      search: "Search",
      language: "Language",
      theme: "Toggle Theme",
      themeDark: "Dark Mode",
      themeLight: "Light Mode",
      githubRepo: "GitHub Repository",
      layoutStandard: "Standard",
      layoutFocus: "Focus",
      layoutFull: "Full",
    },
    sidebar: {
      overview: "Overview",
      documentationHub: "Documentation Hub",
      navigation: "Navigation",
      explorerBadge: "Explorer",
      collapseSidebar: "Collapse Sidebar (Shortcut: [)",
      expandSidebar: "Expand Sidebar (Shortcut: [)",
      productionEdge: "Production Edge",
      systemStatus: "Wildfire Docs v1.0",
      allSystemsOperational: "All Systems Operational",
      categories: {
        gettingStarted: "Getting Started",
        coreFeatures: "Core Features",
        apiReference: "API Reference",
      },
    },
    docPage: {
      onThisPage: "On this page",
      readingTime: "Reading time",
      minRead: "min read",
      words: "words",
      updatedBy: "Updated by",
      postedBy: "Posted by",
      editPage: "Edit Page",
      previousPage: "Previous",
      nextPage: "Next",
      lastCommit: "Commit",
      englishFallbackNotice: "This page is currently displayed in English because the Romanian translation is in progress.",
    },
    feedback: {
      wasHelpful: "Was this page helpful?",
      yes: "Yes",
      no: "No",
      thankYou: "Thank you for your feedback!",
      feedbackQuestion: "How can we improve this page?",
      submit: "Submit Feedback",
      openGitHubIssue: "Open an issue on GitHub",
      suggestEdit: "Suggest an edit",
    },
    home: {
      heroBadge: "Next-Gen Documentation Engine",
      heroTitle: "Wildfire Documentation",
      heroDesc: "The high-performance documentation platform with live Git synchronization, liquid glass aesthetics, and instant search.",
      searchHint: "Search docs, endpoints, or press",
      quickStartBtn: "Get Started",
      recentlyUpdated: "Recently Updated",
      recentlyUpdatedSubtitle: "Latest revisions, schema modifications, and feature releases.",
      viewAllChangelogs: "View all changelogs",
      modulesTitle: "Documentation Modules",
      modulesSubtitle: "Explore foundational architecture, developer toolkits, and API schemas.",
    },
    search: {
      title: "Search Documentation",
      placeholder: "Search documentation, guides, and APIs...",
      noResults: "No results found for",
      noResultsHint: "Try searching for a different keyword, category, or command.",
      poweredBy: "Wildfire Search",
      pressEscToClose: "to close",
      navigateArrows: "to navigate",
      selectEnter: "to select",
      sections: {
        pages: "Pages",
        headings: "Sections",
      },
    },
  },
  ro: {
    common: {
      searchPlaceholder: "Caută în documentație & API-uri...",
      searchKbd: "Ctrl K",
      openMenu: "Deschide meniul de navigare",
      closeMenu: "Închide meniul de navigare",
      backToHome: "Înapoi la Pagina Principală",
      allRightsReserved: "Toate drepturile rezervate.",
      developedBy: "Dezvoltat cu precizie",
      loading: "Se încarcă...",
      error: "A apărut o eroare",
    },
    navbar: {
      docsHome: "Acasă Documentație",
      explorer: "Explorator",
      search: "Caută",
      language: "Limbă",
      theme: "Schimbă Tema",
      themeDark: "Mod Întunecat",
      themeLight: "Mod Luminos",
      githubRepo: "Depozit GitHub",
      layoutStandard: "Standard",
      layoutFocus: "Focalizare",
      layoutFull: "Complet",
    },
    sidebar: {
      overview: "Prezentare Generală",
      documentationHub: "Hub Documentație",
      navigation: "Navigare",
      explorerBadge: "Explorator",
      collapseSidebar: "Restrânge Bara Laterală (Scurtătură: [)",
      expandSidebar: "Extinde Bara Laterală (Scurtătură: [)",
      productionEdge: "Nod de Producție",
      systemStatus: "Wildfire Docs v1.0",
      allSystemsOperational: "Toate Sistemele Funcționale",
      categories: {
        gettingStarted: "Ghid de Pornire",
        coreFeatures: "Funcționalități Principale",
        apiReference: "Referință API",
      },
    },
    docPage: {
      onThisPage: "Pe această pagină",
      readingTime: "Timp de citire",
      minRead: "min citire",
      words: "cuvinte",
      updatedBy: "Actualizat de",
      postedBy: "Publicat de",
      editPage: "Editează Pagina",
      previousPage: "Anterior",
      nextPage: "Următor",
      lastCommit: "Comit",
      englishFallbackNotice: "Această pagină este afișată în limba engleză deoarece traducerea în limba română este în curs de redactare.",
    },
    feedback: {
      wasHelpful: "A fost utilă această pagină?",
      yes: "Da",
      no: "Nu",
      thankYou: "Îți mulțumim pentru feedback!",
      feedbackQuestion: "Cum putem îmbunătăți această pagină?",
      submit: "Trimite Feedback",
      openGitHubIssue: "Deschide o sesizare pe GitHub",
      suggestEdit: "Sugerează o modificare",
    },
    home: {
      heroBadge: "Motor de Documentație Next-Gen",
      heroTitle: "Documentația Wildfire",
      heroDesc: "Platforma de documentație de înaltă performanță cu sincronizare Git live, design liquid glass și căutare instantanee.",
      searchHint: "Caută documente, endpoint-uri sau apasă",
      quickStartBtn: "Începe Acum",
      recentlyUpdated: "Recent Actualizate",
      recentlyUpdatedSubtitle: "Ultimele revizuiri, modificări de schemă și actualizări de funcționalități.",
      viewAllChangelogs: "Vezi toate modificările",
      modulesTitle: "Module de Documentație",
      modulesSubtitle: "Explorează arhitectura fundamentală, uneltele pentru dezvoltatori și schemele API.",
    },
    search: {
      title: "Căutare în Documentație",
      placeholder: "Caută în documentație, ghiduri și API-uri...",
      noResults: "Nu s-au găsit rezultate pentru",
      noResultsHint: "Încearcă un alt cuvânt cheie, o altă categorie sau o comandă diferită.",
      poweredBy: "Căutare Wildfire",
      pressEscToClose: "pentru a închide",
      navigateArrows: "pentru a naviga",
      selectEnter: "pentru a selecta",
      sections: {
        pages: "Pagini",
        headings: "Secțiuni",
      },
    },
  },
};

export const LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
];
