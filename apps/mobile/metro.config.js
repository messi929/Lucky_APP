// Expo 모노레포 metro 설정 — 워크스페이스 패키지(@lucky/*) 해석
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;
// 워크스페이스 패키지(@lucky/*)의 "exports" 서브패스(예: @lucky/ui/tokens) 해석
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
