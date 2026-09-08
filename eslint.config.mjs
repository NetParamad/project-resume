import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", ".git/**", "out/**", "build/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Resume templates & avatar preview render user-uploaded images with
    // unknown dimensions (ImageKit), so next/image's static sizing does not
    // apply. Plain <img> is intentional here.
    files: [
      "components/preview/templates/**/*.tsx",
      "components/builder/sections/PersonalInfoForm.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
