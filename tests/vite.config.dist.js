import { defineConfig } from 'vite';
import { VitePhpManifest } from '../dist';
import { config, pluginOptions } from './vite.config.base';

config.plugins.push(VitePhpManifest(pluginOptions));

export default defineConfig(config);
