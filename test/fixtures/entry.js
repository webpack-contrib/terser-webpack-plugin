// foo
/* @preserve*/
// bar
const a = 2 + 2;

module.exports = function Foo() {
  const b = 2 + 2;
  throw new Error('test');
  console.log(b + 1 + 2);
};

module.exports();
