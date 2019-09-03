function removeCWD(str) {
  return str.split(`${process.cwd()}/`).join('');
}

export default function cleanErrorStack(error) {
  return removeCWD(error.toString())
    .split('\n')
    .slice(0, 2)
    .join('\n');
}
