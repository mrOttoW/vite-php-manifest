import { DEFAULT_OPTIONS, VITE_PLUGIN_NAME } from './constants';
import type { Manifest, ManifestChunk, Plugin, ResolvedConfig } from 'vite';
import { merge } from './utils';
import fs from 'fs';
import path from 'path';
import json2php from 'json2php';

type ChunkCallback = (originalFileName: string, manifestChunk: ManifestChunk) => ManifestChunk;

type GroupCallback = (originalFileName: string, manifestChunk: ManifestChunk) => string;

type ChunkGroup = Record<string, string[]>;

type FilterOptions = false | ChunkCallback;

type GroupOptions = false | ChunkGroup | GroupCallback;

interface Options {
  filter?: FilterOptions;
  group?: GroupOptions;
  defaultGroup?: string;
  linebreak?: string;
  indent?: string;
  shortArraySyntax?: boolean;
  manifestFile?: string;
  unlinkOriginManifest?: boolean;
}

/**
 * VitePhpManifest.
 *
 * @param optionsParam
 * @constructor
 */
function VitePhpManifest(optionsParam: Options = {}): Plugin {
  const options: Options = merge(optionsParam, DEFAULT_OPTIONS);
  let rootConfig: ResolvedConfig;
  let rootPath: string;

  /**
   * Filter the Manifest.
   *
   * @param manifest
   */
  const filterManifest = (manifest: Manifest): Manifest | Record<string, Manifest> => {
    const groupedManifest: Record<string, Manifest> = {};

    for (const [originalFileName, manifestChunk] of Object.entries(manifest)) {
      // Filter the manifestChunk.
      if (options.filter !== false) {
        manifest[originalFileName] = options.filter(originalFileName, manifestChunk);
      }

      // Group the manifestChunk.
      if (options.group !== false) {
        const fileNameExtension = originalFileName.split('.').pop() || '';
        let manifestGroup = 'other';

        if (typeof options.group === 'object') {
          for (const [chunkGroup, extensions] of Object.entries(options.group)) {
            if (extensions.includes(fileNameExtension)) {
              manifestGroup = chunkGroup;
            }
          }
        }
        if (typeof options.group === 'function') {
          manifestGroup = options.group(originalFileName, manifestChunk);
        }

        if (!groupedManifest[manifestGroup]) {
          groupedManifest[manifestGroup] = {};
        }

        groupedManifest[manifestGroup][originalFileName] = manifestChunk;
      }
    }

    return options.group !== false ? groupedManifest : manifest;
  };

  /**
   * Vite Plugin.
   */
  return {
    name: VITE_PLUGIN_NAME,
    enforce: 'post',

    /**
     * Get Resolved Config.
     *
     * @param c
     */
    configResolved(c) {
      rootConfig = c;
      rootPath = c.root;
    },

    /**
     * Close Bundle hook.
     */
    closeBundle: async () => {
      const manifestFile = path.resolve(rootPath, rootConfig.build.outDir, options.manifestFile);

      if (fs.existsSync(manifestFile)) {
        const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
        const phpPrinter = json2php.make({
          linebreak: options.linebreak,
          indent: options.indent,
          shortArraySyntax: options.shortArraySyntax,
        });
        const filteredManifest = options.filter === false && options.group === false ? manifest : filterManifest(manifest);

        fs.writeFileSync(
          path.resolve(path.dirname(manifestFile), 'manifest.php'),
          `<?php\n\nreturn ${phpPrinter(filteredManifest)};\n`,
          'utf-8'
        );
        console.log(manifestFile);

        if (options.unlinkOriginManifest) {
          fs.unlinkSync(manifestFile);
        }
      }
    },
  };
}

export { VitePhpManifest };
