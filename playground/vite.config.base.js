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
  root: 'playground',
  build: {
    assetsInlineLimit: 0,
    manifest: true,
    outDir: 'build',
    rollupOptions: {
      input: {
        'jquery-bundle': path.resolve(__dirname, 'src', 'jquery', 'jquery.js'),
        'lodash-bundle': path.resolve(__dirname, 'src', 'lodash', 'lodash.js'),
        'react-bundle': path.resolve(__dirname, 'src', 'react', 'react.jsx'),
        'blocks-bundle': path.resolve(__dirname, 'src', 'blocks', 'example-block', 'example-block.jsx'),
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
  group: originalFileName => (originalFileName.endsWith('svg') ? 'svg' : 'other'),
  filter: (originalFileName, manifestChunk) => {
    manifestChunk.test = 'test';
    return manifestChunk;
  },
};
