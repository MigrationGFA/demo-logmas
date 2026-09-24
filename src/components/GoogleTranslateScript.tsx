"use client";

import Script from "next/script";
import React from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
            layout?: unknown;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

/**
 * Mounts the Google Translate engine once in the document body.
 *
 * The widget itself is deliberately hidden via `globals.css`; the visible
 * control is `LanguageSwitcher`, which drives the engine programmatically.
 * Machine translation is used instead of an i18n dictionary so that dynamic
 * server/mock responses, table headers, tooltips and public landing copy are
 * all covered without extracting thousands of strings.
 */
export function GoogleTranslateScript() {
  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                  {
                    pageLanguage: 'en',
                    includedLanguages: 'en,yo,ha,ig',
                    autoDisplay: false
                  },
                  'google_translate_element'
                );
              }
            }
          `,
        }}
      />
      <Script
        id="google-translate-script"
        strategy="afterInteractive"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}
