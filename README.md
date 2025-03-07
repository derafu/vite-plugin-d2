# Derafu: Vite Plugin D2 - A Vite plugin to convert D2 diagrams to Images

A Vite plugin that converts [D2](https://d2lang.com/) diagram files to SVG during the build process.

## Installation

```bash
npm install --save-dev vite-plugin-d2
```

Make sure you have D2 installed globally:

```bash
npm install -g d2
```

Or follow the official installation instructions at: [https://d2lang.com/tour/install/](https://d2lang.com/tour/install/)

## Usage

Add the plugin to your `vite.config.js`:

```js
import vitePluginD2 from 'vite-plugin-d2';

export default {
  plugins: [
    vitePluginD2({
      // Options (all optional).
      theme: 0,              // D2 theme (number).
      layout: 'dagre',       // Layout engine.
      sketch: false,         // Enable sketch mode.
      dark: false,           // Enable dark mode.
      pad: 10,               // Padding.
      diagramsDir: './assets/diagrams',  // Input directory for D2 files.
      outputDir: null,       // Custom output dir (uses Vite's outDir if null).
      outputFormat: 'svg',   // Output format (currently only 'svg').
      verbose: false         // Enable verbose output logging.
    })
  ]
};
```

## How it works

The plugin searches for `.d2` files in the specified directory (`diagramsDir`, defaults to `./assets/diagrams`). During the build process, this plugin will:

1. Find all `.d2` files in the specified directory.
2. Convert them to SVG using the D2 CLI.
3. Place the generated SVG files in the output directory.

For example, if you have:

- `./assets/diagrams/architecture.d2`

The plugin will generate:

- `./dist/architecture.svg` (or in your configured output directory).

## Output Directory Configuration

By default, the plugin will output the SVG files to Vite's configured build output directory (`build.outDir`, which defaults to `dist`).

You can customize the output location by setting the `outputDir` option. The relative structure of files within the `diagramsDir` will be preserved in the output.

## Example D2 File

```
# Example D2 diagram.
shape: sequence_diagram
actor User
app: Application
db: Database

User -> app: Request data
app -> db: Query
db -> app: Results
app -> User: Display data
```

## Options

| Option       | Type         | Default             | Description                                                |
|--------------|--------------|---------------------|------------------------------------------------------------|
| theme        | number       | 0                   | D2 theme number                                            |
| layout       | string       | 'dagre'             | Layout engine (e.g., 'dagre', 'elk')                       |
| sketch       | boolean      | false               | Enable sketch/hand-drawn mode                              |
| dark         | boolean      | false               | Enable dark mode                                           |
| pad          | number       | 10                  | Padding around the diagram                                 |
| diagramsDir  | string       | './assets/diagrams' | Directory containing D2 files                              |
| outputDir    | string\|null | null                | Custom output directory (uses Vite's build.outDir if null) |
| outputFormat | string       | 'svg'               | Output format (currently only 'svg' is supported)          |
| verbose      | boolean      | false               | Enable verbose output logging                              |

## Advanced Usage

### Custom Input and Output Directories

You can specify custom directories for your D2 files and the generated SVGs:

```js
vitePluginD2({
  diagramsDir: './src/diagrams',  // Custom input directory.
  outputDir: './public/images',   // Custom output directory.
  verbose: true                   // Enable detailed logging.
})
```

### Styling Options

Customize the appearance of your diagrams:

```js
vitePluginD2({
  theme: 3,           // Use theme number 3.
  sketch: true,       // Enable sketch mode for hand-drawn appearance.
  dark: true,         // Enable dark mode.
  pad: 20             // Add more padding (20px).
})
```

## Troubleshooting

If you encounter issues:

1. Make sure D2 is properly installed and available in your PATH.
2. Check if the input directory exists and contains .d2 files.
3. Enable verbose mode (`verbose: true`) to see detailed logs.
4. Verify you have the necessary permissions to write to the output directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
