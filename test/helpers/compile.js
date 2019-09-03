export default function compile(compiler) {
  return new Promise((resolve, reject) => {
    // eslint-disable-line consistent-return
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      return resolve(stats);
    });
  });
}
