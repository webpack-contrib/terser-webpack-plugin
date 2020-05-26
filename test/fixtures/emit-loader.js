module.exports = function(content) {
  this.emitFile("extra-file.js", 'var a = 1; console.log(a);');

  return content;
};
