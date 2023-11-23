## Contributing

- Open a pull request
- Ensure that it is linted
- Ensure that tests pass (including updating any snapshots used by tests)
- Test it within a webpack project

## Testing Your Pull Request

You may have the need to test your changes in a real-world project or dependent
module. Thankfully, Github provides a means to do this. Add a dependency to the
`package.json` for such a project as follows:

```json
{
  "devDependencies": {
    "terser-webpack-plugin": "webpack-contrib/terser-webpack-plugin#{id}/head"
  }
}
```

Where `{id}` is the # ID of your Pull Request.

## Thanks

For your interest, time, understanding, and for following this simple guide.
