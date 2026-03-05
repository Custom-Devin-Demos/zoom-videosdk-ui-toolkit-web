import { describe, it, expect } from "vitest";
import { resources } from "@/i18n/index";
import enUS from "@/i18n/en-US.json";

const INTERPOLATION_REGEX = /\{\{(\w+)\}\}/g;
const HTML_TAG_REGEX = /<\/?[a-z]+>/gi;

/** All locale codes that should be registered */
const EXPECTED_LOCALES = [
  "en-US",
  "de-DE",
  "es-ES",
  "fr-FR",
  "ja-JP",
  "pt-PT",
  "ru-RU",
  "zh-CN",
  "zh-TW",
  "ko-KR",
  "vi-VN",
  "it-IT",
];

const enKeys = Object.keys(enUS);

describe("i18n", () => {
  describe("locale registration", () => {
    it("should have all 12 expected locales registered in resources", () => {
      const registeredLocales = Object.keys(resources);
      for (const locale of EXPECTED_LOCALES) {
        expect(registeredLocales).toContain(locale);
      }
    });

    it("should have a translation object for each locale", () => {
      for (const locale of EXPECTED_LOCALES) {
        const resource = resources[locale as keyof typeof resources];
        expect(resource).toBeDefined();
        expect(resource.translation).toBeDefined();
        expect(typeof resource.translation).toBe("object");
      }
    });
  });

  describe("translation key parity", () => {
    const nonEnLocales = EXPECTED_LOCALES.filter((l) => l !== "en-US");

    for (const locale of nonEnLocales) {
      describe(locale, () => {
        it("should contain exactly the same keys as en-US", () => {
          const resource = resources[locale as keyof typeof resources];
          const localeKeys = Object.keys(resource.translation);

          const missingKeys = enKeys.filter((k) => !localeKeys.includes(k));
          const extraKeys = localeKeys.filter((k) => !enKeys.includes(k));

          expect(missingKeys).toEqual([]);
          expect(extraKeys).toEqual([]);
        });

        it("should have the same number of keys as en-US", () => {
          const resource = resources[locale as keyof typeof resources];
          const localeKeys = Object.keys(resource.translation);
          expect(localeKeys.length).toBe(enKeys.length);
        });
      });
    }
  });

  describe("interpolation variable preservation", () => {
    const nonEnLocales = EXPECTED_LOCALES.filter((l) => l !== "en-US");

    for (const locale of nonEnLocales) {
      describe(locale, () => {
        it("should preserve all {{variable}} placeholders from en-US", () => {
          const resource = resources[locale as keyof typeof resources];
          const translation = resource.translation as Record<string, string>;
          const mismatches: string[] = [];

          for (const key of enKeys) {
            const enValue = (enUS as Record<string, string>)[key];
            const localeValue = translation[key];

            if (!enValue || !localeValue) continue;

            const enVars = [...enValue.matchAll(INTERPOLATION_REGEX)].map((m) => m[1]).sort();
            const localeVars = [...localeValue.matchAll(INTERPOLATION_REGEX)].map((m) => m[1]).sort();

            if (JSON.stringify(enVars) !== JSON.stringify(localeVars)) {
              mismatches.push(`${key}: en-US has {{${enVars.join(", ")}}} but ${locale} has {{${localeVars.join(", ")}}}`);
            }
          }

          expect(mismatches).toEqual([]);
        });
      });
    }
  });

  describe("HTML tag preservation", () => {
    const nonEnLocales = EXPECTED_LOCALES.filter((l) => l !== "en-US");

    for (const locale of nonEnLocales) {
      describe(locale, () => {
        it("should preserve HTML tags from en-US", () => {
          const resource = resources[locale as keyof typeof resources];
          const translation = resource.translation as Record<string, string>;
          const mismatches: string[] = [];

          for (const key of enKeys) {
            const enValue = (enUS as Record<string, string>)[key];
            const localeValue = translation[key];

            if (!enValue || !localeValue) continue;

            const enTags = (enValue.match(HTML_TAG_REGEX) || []).sort();
            const localeTags = (localeValue.match(HTML_TAG_REGEX) || []).sort();

            if (JSON.stringify(enTags) !== JSON.stringify(localeTags)) {
              mismatches.push(`${key}: en-US has [${enTags.join(", ")}] but ${locale} has [${localeTags.join(", ")}]`);
            }
          }

          expect(mismatches).toEqual([]);
        });
      });
    }
  });

  describe("no empty translations for non-empty source", () => {
    const nonEnLocales = EXPECTED_LOCALES.filter((l) => l !== "en-US");

    for (const locale of nonEnLocales) {
      describe(locale, () => {
        it("should not have empty translations for non-empty en-US values", () => {
          const resource = resources[locale as keyof typeof resources];
          const translation = resource.translation as Record<string, string>;
          const emptyTranslations: string[] = [];

          for (const key of enKeys) {
            const enValue = (enUS as Record<string, string>)[key];
            const localeValue = translation[key];

            // en-US has a value but locale does not (skip keys that are empty in en-US)
            if (enValue && enValue.trim() !== "" && (!localeValue || localeValue.trim() === "")) {
              emptyTranslations.push(key);
            }
          }

          // Allow settings.rejoin which is empty in en-US too
          const filtered = emptyTranslations.filter((k) => (enUS as Record<string, string>)[k] !== "");
          expect(filtered).toEqual([]);
        });
      });
    }
  });
});
