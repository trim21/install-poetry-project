# Install Poetry Project With Cache

[![ci](https://github.com/Trim21/install-poetry-project/workflows/build-test/badge.svg)](https://github.com/Trim21/install-poetry-project/actions)

example: [test.yml](.github/workflows/test.yml)

```yaml
- uses: actions/checkout@v2

- uses: actions/setup-python@v1
  with:
    python-version: 3.7

- uses: Trim21/setup-poetry@v1

- uses: Trim21/install-poetry-project@dist/v1
  with:
    extras: |
      group1
      group2
```
