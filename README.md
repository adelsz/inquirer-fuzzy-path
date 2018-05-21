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
        // pathFilter allows to filter FS nodes by type and path
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
