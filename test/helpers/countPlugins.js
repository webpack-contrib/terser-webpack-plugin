/**
 * @param {object} root0 options
 * @param {import("tapable").Hook[]} root0.hooks hooks
 * @returns {number} count of plugins
 */
export default function countPlugins({ hooks }) {
  return Object.keys(hooks).reduce((aggregate, name) => {
    aggregate[name] = Array.isArray(hooks[name].taps)
      ? hooks[name].taps.length
      : 0;
    return aggregate;
  }, {});
}
