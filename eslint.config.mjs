import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals, ...nextTs, globalIgnores(['public/vendor/**', '.next/**', 'next-env.d.ts', 'work/**', 'test-results/**', 'playwright-report/**'])]);
