const BrokenCodePlugin = require("./BrokenCodePlugin");
const compile = require("./compile");
const countPlugins = require("./countPlugins");
const EmitNewAsset = require("./EmitNewAsset");
const execute = require("./execute");
const ExistingCommentsFile = require("./ExistingCommentsFile");
const getCompiler = require("./getCompiler");
const getErrors = require("./getErrors");
const getWarnings = require("./getWarnings");
const ModifyExistingAsset = require("./ModifyExistingAsset");
const readAsset = require("./readAsset");
const readsAssets = require("./readAssets");
const normalizeErrors = require("./normalizeErrors");

module.exports = {
  BrokenCodePlugin,
  compile,
  countPlugins,
  EmitNewAsset,
  ExistingCommentsFile,
  execute,
  getCompiler,
  getErrors,
  getWarnings,
  ModifyExistingAsset,
  normalizeErrors,
  readAsset,
  readsAssets,
};
