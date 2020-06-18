import script from '!!file-loader?name=[path][name].[ext]!./emitted.js'

const myVar = 12;

console.log(myVar, script);

export default 12;
