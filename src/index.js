/**
 * Derafu: Vite Plugin D2 - A Vite plugin to convert D2 diagrams to Images.
 *
 * Copyright (c) 2025 Esteban De La Fuente Rubio / Derafu <https://www.derafu.org>
 * Licensed under the MIT License.
 * See LICENSE file for more details.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const execPromise = promisify(exec);

/**
 * D2 Diagram to Image Vite plugin.
 *
 * @param {Object} options - Plugin options.
 * @param {number} options.theme - D2 theme (default: 0).
 * @param {string} options.layout - D2 layout engine (default: 'dagre').
 * @param {boolean} options.sketch - Enable sketch mode (default: false).
 * @param {boolean} options.dark - Enable dark mode (default: false).
 * @param {number} options.pad - Padding (default: 10).
 * @param {string} options.diagramsDir - Custom input directory (default: './assets/diagrams').
 * @param {string} options.outputDir - Custom output directory (default: null - uses Vite's configured outDir).
 * @param {string} options.outputFormat - Output format (default: 'svg').
 * @param {boolean} options.verbose - Enable verbose output (default: false).
 * @returns {Object} Vite plugin.
 */
export default function vitePluginD2(options = {}) {
  const {
    theme = 0,
    layout = 'dagre',
    sketch = false,
    dark = false,
    pad = 10,
    diagramsDir = './assets/diagrams',
    outputDir = null,
    outputFormat = 'svg',
    verbose = false
  } = options;

  // Store Vite configuration for later access.
  let viteConfig = null;

  return {
    name: 'vite-plugin-d2',
    enforce: 'pre',

    /**
     * Configuration hook to customize Vite's behavior with D2 files.
     *
     * @param {Object} config - Vite configuration object.
     * @returns {Object} - Modified configuration.
     */
    config(config) {
      // Store the configuration for later use.
      viteConfig = config;

      // Add D2 files to the list of assets to be processed.
      config.assetsInclude = config.assetsInclude || [];
      if (Array.isArray(config.assetsInclude)) {
        config.assetsInclude.push('**/*.d2');
      } else {
        config.assetsInclude = [config.assetsInclude, '**/*.d2'];
      }

      return config;
    },

    /**
     * Process D2 files at the start of the build.
     * This hook is executed at the beginning of the build process.
     */
    async buildStart() {
      // Verify if D2 is installed.
      try {
        await execPromise('d2 --version');
        if (verbose) {
          this.info('D2 is installed and available.');
        }
      } catch (error) {
        this.warn(`
          D2 CLI is not installed or not found in PATH.
          Please install D2 globally with: npm install -g d2
          or follow instructions at: https://d2lang.com/tour/install/
          D2 files will not be processed in this build.
        `);
        return;
      }

      // Check output format.
      if (outputFormat !== 'svg') {
        this.warn(`
          For now only SVG is supported.
          D2 files will not be processed in this build.
        `);
        return;
      }

      // Determine the base output directory.
      const outDir = viteConfig?.build?.outDir || 'dist';
      const baseOutputDir = outputDir || outDir;

      const projectRoot = process.cwd();

      // Search for D2 files in the diagrams directory.
      const inputDirectory = path.resolve(diagramsDir);
      if (!fs.existsSync(inputDirectory)) {
        this.warn(`Diagrams directory not found: ${inputDirectory}`);
        return;
      }

      // Find all D2 files in the specified directory.
      const d2Files = await glob('**/*.d2', { cwd: inputDirectory });
      this.info(`Found ${d2Files.length} D2 files to process.`);

      // Process each D2 file and generate SVG.
      for (const file of d2Files) {
        const inputPath = path.join(inputDirectory, file);

        // Define the output path.
        const fileRelativePath = path.relative(inputDirectory, inputPath);
        const outputRelativePath = fileRelativePath.replace(/\.d2$/, `.${outputFormat}`);
        const outputPath = path.join(projectRoot, baseOutputDir, outputRelativePath);

        // Ensure the output directory exists.
        const outputDirPath = path.dirname(outputPath);
        if (!fs.existsSync(outputDirPath)) {
          fs.mkdirSync(outputDirPath, { recursive: true });
        }

        // Build D2 command with options.
        const d2Command = [
          'd2',
          `"${inputPath}"`,
          `"${outputPath}"`,
          `--theme=${theme}`,
          `--layout=${layout}`,
          sketch ? '--sketch' : '',
          dark ? '--dark' : '',
          `--pad=${pad}`
        ].filter(Boolean).join(' ');

        // Ejecutar comando D2.
        try {
          if (verbose) {
            this.info(`Executing D2 command: ${d2Command}`);
          }
          await execPromise(d2Command);
          if (verbose) {
            this.info(`Generated ${outputFormat.toUpperCase()}: ${outputPath}`);
          }
        } catch (error) {
          this.error(`Error generating ${outputFormat.toUpperCase()} for ${inputPath}: ${error.message}`);
        }
      }
    },

    /**
     * Handle D2 files during loading to prevent Rollup from processing them as
     * JavaScript.
     *
     * @param {string} id - File ID (path).
     * @returns {string|null} - Empty string for D2 files, null for other files.
     */
    load(id) {
      if (id.endsWith('.d2')) {
        return '';
      }
      return null;
    }
  };
}
