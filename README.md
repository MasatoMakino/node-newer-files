# node-newer-files

> [!CAUTION]
>
> **This repository has been archived.**
>
> This package is deprecated. The functionality can be replaced with ~20 lines of code using Node.js 22+ built-in `globSync` from `node:fs`. See [#182](https://github.com/MasatoMakino/node-newer-files/issues/182) for replacement examples.

> Compare two directories and list updated files.

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

## Getting Started

### Install

```bash
npm install @masatomakino/newer-files --save-dev
```

### API

[API documents](https://masatomakino.github.io/node-newer-files/api/)

##### getFiles(extensions, srcDir, targetDir) → {Array}

Compare two directories and list updated files.

##### sync(extensions, srcDir, targetDir) → {Array}

Compare two directories and sync files.

## License

[MIT licensed](LICENSE).
