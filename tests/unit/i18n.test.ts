import { describe, it, expect } from "vitest";
import { resources } from "@/i18n/index";
import enUS from "@/i18n/en-US.json";

const EXPECTED_LOCALES = [
  "en-US",
  "zh-CN",
  "de-DE",
  "es-ES",
  "fr-FR",
  "ja-JP",
  "pt-PT",
  "ru-RU",
  "zh-TW",
  "ko-KR",
  "vi-VN",
  "it-IT",
];

const enKeys = Object.keys(enUS).sort();

describe("i18n translation files", () => {
  it("should have all 12 expected locales in resources", () => {
    const resourceKeys = Object.keys(resources).sort();
    for (const locale of EXPECTED_LOCALES) {
      expect(resourceKeys).toContain(locale);
    }
    expect(resourceKeys.length).toBeGreaterThanOrEqual(EXPECTED_LOCALES.length);
  });

  for (const locale of EXPECTED_LOCALES) {
    describe(`${locale}`, () => {
      it("should have all keys from en-US", () => {
        const translation =
          resources[locale as keyof typeof resources]?.translation;
        expect(translation).toBeDefined();
        const translationKeys = Object.keys(
          translation as Record<string, string>,
        ).sort();
        const missingKeys = enKeys.filter(
          (k) => !translationKeys.includes(k),
        );
        expect(missingKeys).toEqual([]);
      });

      it("should not have extra keys beyond en-US", () => {
        const translation =
          resources[locale as keyof typeof resources]?.translation;
        expect(translation).toBeDefined();
        const translationKeys = Object.keys(
          translation as Record<string, string>,
        ).sort();
        const extraKeys = translationKeys.filter(
          (k) => !enKeys.includes(k),
        );
        expect(extraKeys).toEqual([]);
      });

      it("should have exactly the same number of keys as en-US", () => {
        const translation =
          resources[locale as keyof typeof resources]?.translation;
        expect(translation).toBeDefined();
        expect(
          Object.keys(translation as Record<string, string>).length,
        ).toBe(enKeys.length);
      });

      it("should preserve all interpolation variables from en-US", () => {
        const translation = resources[locale as keyof typeof resources]
          ?.translation as Record<string, string>;
        expect(translation).toBeDefined();
        const varPattern = /\{\{[^}]+\}\}/g;
        const issues: string[] = [];

        for (const key of enKeys) {
          const enVars = (enUS[key as keyof typeof enUS] || "").match(
            varPattern,
          );
          if (enVars && enVars.length > 0) {
            const transVal = translation[key] || "";
            const transVars = transVal.match(varPattern) || [];
            const enVarSet = new Set(enVars);
            const transVarSet = new Set(transVars);
            for (const v of enVarSet) {
              if (!transVarSet.has(v)) {
                issues.push(
                  `Key "${key}": missing variable ${v} in ${locale}`,
                );
              }
            }
          }
        }

        expect(issues).toEqual([]);
      });

      it("should not have empty string values (unless empty in en-US)", () => {
        const translation = resources[locale as keyof typeof resources]
          ?.translation as Record<string, string>;
        expect(translation).toBeDefined();
        const enEmptyKeys = new Set(
          Object.entries(enUS)
            .filter(([, v]) => v === "")
            .map(([k]) => k),
        );
        const emptyKeys = Object.entries(translation)
          .filter(([k, v]) => v === "" && !enEmptyKeys.has(k))
          .map(([k]) => k);
        expect(emptyKeys).toEqual([]);
      });
    });
  }
});
