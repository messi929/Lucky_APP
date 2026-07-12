// Expo 모노레포 metro 설정 — 워크스페이스 패키지(@lucky/*) 해석
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
// 모노레포: Expo 기본 watchFolders 유지 + 워크스페이스 루트 추가 (Expo 공식 가이드)
config.watchFolders = [...config.watchFolders, workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// 워크스페이스 패키지(@lucky/*)의 "exports" 서브패스(예: @lucky/ui/tokens) 해석
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
