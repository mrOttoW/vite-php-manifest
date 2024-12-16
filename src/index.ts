import { DEFAULT_OPTIONS, VITE_PLUGIN_NAME } from './constants';
import type { Manifest, ManifestChunk, Plugin, ResolvedConfig } from 'vite';
import { merge } from './utils';
import fs from 'fs';
import path from 'path';
import json2php from 'json2php';

type ChunkCallback = (originalFileName: string, manifestChunk: ManifestChunk) => ManifestChunk; // eslint-disable-line no-unused-vars

type GroupCallback = (originalFileName: string, manifestChunk: ManifestChunk) => string; // eslint-disable-line no-unused-vars

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
  unlinkOriginManifest?: boolean;
  manifestFile?: string;
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
  let outDirPath: string;

  /**
   * Log message.
   *
   * @param msg
   */
  const log = (msg: string) => {
    rootConfig.logger.info(`${VITE_PLUGIN_NAME}: ${msg}`, { timestamp: true });
  };

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

        // Group through extension list.
        if (typeof options.group === 'object') {
          for (const [chunkGroup, extensions] of Object.entries(options.group)) {
            if (extensions.includes(fileNameExtension)) {
              manifestGroup = chunkGroup;
            }
          }
        }
        // Group through callback.
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

  const writePhpManifest = (filteredManifest: Manifest | Record<string, Manifest>) => {
    const phpManifestFile = path.resolve(outDirPath, options.manifestFile);
    const phpManifestFolder = path.dirname(phpManifestFile);
    const phpPrinter = json2php.make({
      linebreak: options.linebreak,
      indent: options.indent,
      shortArraySyntax: options.shortArraySyntax,
    });

    fs.mkdirSync(phpManifestFolder, { recursive: true });
    fs.writeFileSync(phpManifestFile, `<?php\n\nreturn ${phpPrinter(filteredManifest)};\n`, 'utf-8');
  };

  /**
   * Unlink Origin Manifest.
   *
   * @param manifestPath
   */
  const unlinkOriginManifest = (manifestPath: string) => {
    const originManifestFolder = path.dirname(manifestPath);

    fs.unlinkSync(manifestPath);
    fs.readdir(originManifestFolder, (err, files) => {
      if (err) {
        log(`Error reading directory: ${originManifestFolder}`);
      } else {
        if (files.length === 0) {
          fs.rm(originManifestFolder, { recursive: true }, err => {
            if (err) {
              log(`Error deleting folder: ${originManifestFolder}`);
            }
          });
        }
      }
    });
  };

  /**
   * Vite Plugin.
   */
  return {
    name: VITE_PLUGIN_NAME,
    enforce: 'pre',

    /**
     * Get Resolved Config.
     *
     * @param c
     */
    configResolved(c) {
      rootConfig = c;
      rootPath = c.root;
      outDirPath = path.resolve(rootPath, rootConfig.build.outDir);
    },

    /**
     * Close Bundle hook.
     */
    closeBundle: async () => {
      const resolvedManifestName = rootConfig.build.manifest;
      const defaultManifestName = path.join('.vite', 'manifest.json');
      const originManifestPath =
        resolvedManifestName && typeof resolvedManifestName === 'string'
          ? path.resolve(outDirPath, resolvedManifestName)
          : path.resolve(outDirPath, defaultManifestName);

      if (fs.existsSync(originManifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(originManifestPath, 'utf-8'));
        const filteredManifest = options.filter === false && options.group === false ? manifest : filterManifest(manifest);

        writePhpManifest(filteredManifest);

        if (options.unlinkOriginManifest) {
          unlinkOriginManifest(originManifestPath);
        }
      }
    },
  };
}

export { VitePhpManifest };
