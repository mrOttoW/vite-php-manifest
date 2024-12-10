<div align="center">
  <a href="https://vitejs.dev/">
    <img width="200" height="200" hspace="10" src="vite-logo.svg" alt="vite logo" />
  </a>
  <h1>️Vite 6 PHP Manifest</h1>
  <p>
A Vite plugin to convert the generated `manifest.json` into a PHP manifest file. It provides flexibility for filtering and grouping manifest items and supports customizable PHP formatting.

</p>
  <img src="https://img.shields.io/github/v/release/mrOttoW/vite-php-manifest" alt="GitHub release" />
  <img src="https://img.shields.io/npm/dependency-version/vite-php-manifest/peer/vite" alt="npm peer dependency version" />
  <img alt="Node Current" src="https://img.shields.io/node/v/vite-php-manifest">
  <img src="https://img.shields.io/github/last-commit/mrOttoW/vite-php-manifest" alt="GitHub last commit"/>
  <img src="https://img.shields.io/npm/l/vite-php-manifest" alt="licence" />
</div>

## Features

- Converts `manifest.json` to a PHP file.
- Supports filtering and grouping of manifest items/chunks.
- Allows customization of PHP file formatting (line breaks, indentation, short array syntax).

## Installation

Install it via npm:

```bash
npm install vite-php-manifest --save-dev
```

Or with yarn:

```bash
yarn add -D vite-php-manifest
```

## Usage

Add the plugin to your `vite.config.js` file:

```javascript
import { defineConfig } from 'vite';
import { VitePhpManifest } from 'vite-php-manifest';

export default defineConfig({
  plugins: [VitePhpManifest()],
});
```

or with plugin options (optional)

```javascript
import { defineConfig } from 'vite';
import { VitePhpManifest } from 'vite-php-manifest';

export default defineConfig({
  plugins: [
    VitePhpManifest({
      filter: (originalFileName, manifestChunk) => {
        manifestChunk.myCustomKey = 'my-custom-value';
        return manifestChunk;
      },
      group: {
        js: ['js', 'jsx'],
        css: ['css'],
        images: ['png', 'jpg', 'jpeg', 'gif'],
        svg: ['svg'],
      },
      linebreak: '\n',
      indent: '    ',
      shortArraySyntax: true,
      unlinkOriginManifest: false,
      manifestFile: 'vite/manifest.php',
    }),
  ],
});
```

## Options

### `filter` (default: `false`)

Type: `false | (originalFileName: string, manifestChunk: ManifestChunk) => ManifestChunk | null`

A function to filter chunks in the manifest. If `false`, no filtering is applied.

**Example**:

```javascript
filter: (originalFileName, manifestChunk) => {
  if (manifestChunk.isEntry) {
    manifestChunk.customEntryKey = 'custom-value';
  }
  return manifestChunk;
};
```

### `group` (default: `false`)

Type: `false | Record<string, string[]> | (originalFileName: string, manifestChunk: ManifestChunk) => string`

A function to group chunks in the PHP manifest. Can be an object mapping group names to file extensions or a callback function.

**Example** (Object Mapping):

```javascript
 group: {
  js: ['js', 'jsx'],
    css: ['css'],
    images: ['png', 'jpg', 'jpeg', 'gif'],
    svg: ['svg']
},
```

**Example** (Callback Function):

```javascript
group: (originalFileName, manifestChunk) => {
  return originalFileName.endsWith('.css') ? 'styles' : 'scripts';
},
```

### `defaultGroup` (default: `'other'`)

Type: `string`

The default group name for chunks that do not match any group when using object mapping.

### `unlinkOriginManifest` (default: `true`)

Type: `boolean`

If `true`, deletes the original `manifest.json` after generating the PHP file.

### `manifestFile` (default: `'manifest.php'`)

Type: `string`

The output path for the generated PHP manifest file relative to the `outDir`.

### `linebreak` (default: `'\n'`)

Type: `string`

The line break character(s) to use in the PHP manifest file.

### `indent` (default: `' '`)

Type: `string`

The indentation character(s) to use in the PHP manifest file.

### `shortArraySyntax` (default: `false`)

Type: `boolean`

Whether to use PHP's short array syntax ([]).

## Example Output

Given the following `manifest.json`:

```json
{
  "main.js": {
    "file": "assets/main-1234.js",
    "isEntry": true
  },
  "styles.css": {
    "file": "assets/styles-5678.css",
    "isEntry": false
  }
}
```

The plugin generates the following manifest.php:

```php
<?php
  return array(
    'main.js' => array(
      'file' => 'assets/main-1234.js',
      'isEntry' => true,
    ),
    'styles.css' => array(
      'file' => 'assets/styles-5678.css',
      'isEntry' => false,
    ),
  );
```
