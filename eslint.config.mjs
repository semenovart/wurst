import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "out/**", "node_modules/**", "coverage/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
