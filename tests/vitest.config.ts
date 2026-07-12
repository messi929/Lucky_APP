import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // 개발 중 빌드 없이 TS 소스를 바로 테스트하기 위한 별칭
      "@lucky/core": fileURLToPath(new URL("../packages/core/src", import.meta.url)),
    },
  },
  test: {
    include: ["**/*.test.ts"],
  },
});
