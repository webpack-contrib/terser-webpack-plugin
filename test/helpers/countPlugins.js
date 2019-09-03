export default function countPlugins({ hooks }) {
  return Object.keys(hooks).reduce((aggregate, name) => {
    // eslint-disable-next-line no-param-reassign
    aggregate[name] = Array.isArray(hooks[name].taps)
      ? hooks[name].taps.length
      : 0;
    return aggregate;
  }, {});
}
