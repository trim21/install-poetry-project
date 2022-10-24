# Install Poetry Project With Cache

[![ci](https://github.com/Trim21/install-poetry-project/workflows/build-test/badge.svg)](https://github.com/Trim21/install-poetry-project/actions)

This action install poetry deps to `.venv`, and enable virtualenv environment.

virtualenv environment directory `.venv` is cache.

```yaml
- uses: actions/checkout@v3

- uses: actions/setup-python@v3
  with:
    python-version: 3.7

- uses: Trim21/setup-poetry@dist/v1

- uses: Trim21/install-poetry-project@dist/v1
  with:
    install_args: -vvv --no-root # extras arguments passed to poetry command 
    extras: |
      group1
      group2
      # install_args: '-vvv'
```
