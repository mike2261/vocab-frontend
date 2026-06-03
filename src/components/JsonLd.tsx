import { SITE } from "@/lib/site";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE.url}/#app`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web, Chrome",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Spaced repetition flashcards",
          "AI-generated definitions and translations",
          "Vietnamese translations",
          "CEFR level tagging",
          "Chrome extension for saving words",
          "AI passage generation for contextual review",
        ],
        inLanguage: ["en", "vi"],
        audience: {
          "@type": "Audience",
          audienceType: "Vietnamese English learners",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE.url}/#extension`,
        name: `${SITE.name} Chrome Extension`,
        operatingSystem: "Chrome",
        applicationCategory: "BrowserApplication",
        description:
          "Save English words from any webpage with one click. Lexio auto-fills definitions, Vietnamese translations, and CEFR levels.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#org`,
        name: SITE.name,
        url: SITE.url,
        logo: `${SITE.url}/icon.svg`,
        sameAs: [],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Lexio?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Lexio is an AI-powered English vocabulary app for Vietnamese learners. It lets you save words from any webpage, auto-generates definitions with Vietnamese translations and CEFR levels, and helps you master them with spaced repetition flashcards or AI-generated reading passages.",
            },
          },
          {
            "@type": "Question",
            name: "Is Lexio free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Lexio's core features are free to use, including the Chrome extension, AI-generated definitions, and spaced repetition review.",
            },
          },
          {
            "@type": "Question",
            name: "How is Lexio different from Anki or Quizlet?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Unlike Anki, Lexio requires zero manual card creation — AI auto-fills everything when you save a word. Unlike Quizlet, Lexio provides Vietnamese translations, CEFR level tagging, and an AI passage review mode that helps you see words in context rather than in isolation.",
            },
          },
          {
            "@type": "Question",
            name: "Does Lexio support Vietnamese?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Every word entry includes a Vietnamese translation alongside the English definition, making it specifically designed for Vietnamese learners of English.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
