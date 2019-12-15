# inquirer-fuzzy-path


[![npm](https://img.shields.io/npm/v/inquirer-fuzzy-path)](https://www.npmjs.com/package/inquirer-fuzzy-path)
[![npm](https://img.shields.io/npm/dw/inquirer-fuzzy-path)](https://www.npmjs.com/package/inquirer-fuzzy-path)

Fuzzy file/directory search and select prompt for Inquirer.js 

![inquirer-fuzzy-path demo](https://raw.githubusercontent.com/adelsz/inquirer-fuzzy-path/master/recording.gif)

## Usage

Register the prompt with inquirer:
```javascript
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
```

Call the prompt:
```javascript
  return inquirer.prompt([
    {
      type: 'fuzzypath',
      name: 'path',
      excludePath: nodePath => nodePath.startsWith('node_modules'),
        // excludePath :: (String) -> Bool
        // excludePath to exclude some paths from the file-system scan
      excludeFilter: nodePath => nodePath == '.',
        // excludeFilter :: (String) -> Bool
        // excludeFilter to exclude some paths from the final list, e.g. '.'
      itemType: 'any',
        // itemType :: 'any' | 'directory' | 'file'
        // specify the type of nodes to display
        // default value: 'any'
        // example: itemType: 'file' - hides directories from the item list
      rootPath: 'app',
        // rootPath :: String
        // Root search directory
      message: 'Select a target directory for your component:',
      default: 'components/',
      suggestOnly: false,
        // suggestOnly :: Bool
        // Restrict prompt answer to available choices or use them as suggestions
      depthLimit: 5,
        // depthLimit :: integer >= 0
        // Limit the depth of sub-folders to scan
        // Defaults to infinite depth if undefined
    }
  ]);
```

## Change log
* In version 2.2.0 new option `excludeFilter` was added.
* In version 2.1.0 new option `depthLimit` was added.
* In version 2.0.0 option `filterPath` was deprecated. Please use `excludePath` and `itemType` instead.

## Related

- [inquirer](https://github.com/SBoudrias/Inquirer.js) - A collection of common interactive command line user interfaces

## License

MIT © [adelsz](https://github.com/adelsz)
