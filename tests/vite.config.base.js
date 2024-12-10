import path from 'path';

const globals = {
  jquery: 'jQuery',
  lodash: '_',
  react: 'React',
  'react-dom': 'ReactDOM',
  'wp-blocks': 'wp.blocks',
  'wp-block-editor': 'wp.blockEditor',
  'wp-i18n': 'wp.i18n',
};

export const config = {
  root: `tests`,
  build: {
    assetsInlineLimit: 0,
    manifest: true,
    outDir: 'build',
    rollupOptions: {
      input: {
        'jquery-bundle': path.resolve(__dirname, 'src', 'my-jquery-bundle', 'my-jquery-bundle.js'),
        'lodash-bundle': path.resolve(__dirname, 'src', 'my-lodash-bundle', 'my-lodash-bundle.js'),
        'react-bundle': path.resolve(__dirname, 'src', 'my-react-bundle', 'my-react-bundle.jsx'),
        'wp-block-bundle': path.resolve(__dirname, 'src', 'my-blocks-bundles', 'my-wp-block-bundle', 'my-wp-block-bundle.jsx'),
      },
      output: {
        globals: globals,
      },
      external: Object.keys(globals),
    },
  },
  plugins: [],
};

export const pluginOptions = {
  group: (originalFileName, manifestChunk) => (originalFileName.endsWith('svg') ? 'svg' : 'other'),
  filter: (originalFileName, manifestChunk) => {
    manifestChunk.test = 'test';
    return manifestChunk;
  },
};
