const fs = require('fs');
const path = require('path');
const util = require('util');

const Choices = require('inquirer/lib/objects/choices');
const InquirerAutocomplete = require('inquirer-autocomplete-prompt');
const stripAnsi = require('strip-ansi');
const style = require('ansi-styles');
const fuzzy = require('fuzzy');

const readdir = util.promisify(fs.readdir);

function getPaths(rootPath, pattern, pathFilter) {
  const fuzzOptions = {
    pre: style.green.open,
    post: style.green.close,
  };

  function nodeOption(nodePath, isDirectory) {
    return pathFilter(isDirectory, nodePath) ? [nodePath] : [];
  }

  async function listNodes(nodePath) {
    try {
      const currentNode = nodeOption(nodePath, true);
      if (currentNode.length === 0) {
        return currentNode;
      }
      const nodes = await readdir(nodePath);
      if (nodes.length > 0) {
        const nodesWithPath = nodes.map(nodeName => listNodes(path.join(nodePath, nodeName)));
        const subNodes = await Promise.all(nodesWithPath);
        return subNodes.reduce((acc, val) => acc.concat(val), currentNode);
      }
      return currentNode;
    } catch (err) {
      if (err.code === 'ENOTDIR') {
        return nodeOption(nodePath, false);
      }
      throw err;
    }
  }

  const nodes = listNodes(rootPath);
  const filterPromise = nodes.then(
    nodeList => fuzzy
      .filter(pattern || '', nodeList, fuzzOptions)
      .map(e => e.string),
  );
  return filterPromise;
}

class InquirerFuzzyPath extends InquirerAutocomplete {
  constructor(question, rl, answers) {
    const rootPath = question.rootPath || '.';
    const pathFilter = question.pathFilter || (() => true);
    const questionBase = Object.assign(
      {},
      question,
      { source: (_, pattern) => getPaths(rootPath, pattern, pathFilter) },
    );
    super(questionBase, rl, answers);
  }

  search(searchTerm) {
    return super.search(searchTerm).then(() => {
      this.currentChoices.getChoice = (choiceIndex) => {
        const choice = Choices.prototype.getChoice.call(this.currentChoices, choiceIndex);
        return {
          value: stripAnsi(choice.value),
          name: stripAnsi(choice.name),
          short: stripAnsi(choice.name),
        };
      };
    });
  }

  onSubmit(line) {
    super.onSubmit(stripAnsi(line));
  }
}


module.exports = InquirerFuzzyPath;
