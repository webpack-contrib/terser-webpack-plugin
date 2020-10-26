import foo, { bar } from './dep';

function Foo() {
  const b = foo;
  const baz = `baz${Math.random()}`;
  return () => {
    return {
      a: b + bar + baz,
      b,
      baz,
    };
  };
}

console.log(Foo());

export default Foo;
