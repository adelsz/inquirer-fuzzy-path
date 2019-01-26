# inquirer-fuzzy-path

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
      pathFilter: (isDirectory, nodePath) => isDirectory,
        // pathFilter :: (Bool, String) -> Bool
        // pathFilter allows you to filter the fs entries     returned to the user
      scanFilter: (isDirectory, nodePath) => isDirectory,
        // scanFilter :: (Bool, String) -> Bool
        // scanFilter allows you to control where this plugin searches for files, and is applied only when reading the directory. As an example, for better performance, you might want to filter out `node-modules` using this function.
      rootPath: 'app',
        // rootPath :: String
        // Root search directory
      message: 'Select a target directory for your component:',
      default: 'components/',
      suggestOnly: false,
        // suggestOnly :: Bool
        // Restrict prompt answer to available choices or use them as suggestions
    }
  ]);
```

## Related

- [inquirer](https://github.com/SBoudrias/Inquirer.js) - A collection of common interactive command line user interfaces

## License

MIT © [adelsz](https://github.com/adelsz)
