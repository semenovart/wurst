import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "out/**", "node_modules/**", "coverage/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // R3F-слой сознательно императивен: мутации refs/геометрии/инстансов в
    // useFrame — канонический паттерн производительности (см. PLAN.md).
    // Compiler-правила react-hooks этому паттерну не подходят.
    files: ["src/components/scene/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
    },
  },
];

export default eslintConfig;
