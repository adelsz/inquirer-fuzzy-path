const fs = require('fs');
const path = require('path');
const util = require('util');

const Choices = require('inquirer/lib/objects/choices');
const InquirerAutocomplete = require('inquirer-autocomplete-prompt');
const stripAnsi = require('strip-ansi');
const style = require('ansi-styles');
const fuzzy = require('fuzzy');

const readdir = util.promisify(fs.readdir);

function getPaths(
  rootPath,
  pattern,
  excludePath,
  itemType,
  defaultItem,
) {
  const fuzzOptions = {
    pre: style.green.open,
    post: style.green.close,
  };

  async function listNodes(nodePath) {
    try {
      if (excludePath(nodePath)) {
        return [];
      }
      const nodes = await readdir(nodePath);
      const currentNode = (itemType !== 'file' ? [nodePath] : []);
      if (nodes.length > 0) {
        const nodesWithPath = nodes.map(
          nodeName => listNodes(path.join(nodePath, nodeName)),
        );
        const subNodes = await Promise.all(nodesWithPath);
        return subNodes.reduce((acc, val) => acc.concat(val), currentNode);
      }
      return currentNode;
    } catch (err) {
      if (err.code === 'ENOTDIR') {
        return itemType !== 'directory' ? [nodePath] : [];
      }
      return [];
    }
  }

  const nodes = listNodes(rootPath);
  const filterPromise = nodes.then(
    (nodeList) => {
      const filteredNodes = fuzzy
        .filter(pattern || '', nodeList, fuzzOptions)
        .map(e => e.string);
      if (!pattern && defaultItem) {
        filteredNodes.unshift(defaultItem);
      }
      return filteredNodes;
    },
  );
  return filterPromise;
}

class InquirerFuzzyPath extends InquirerAutocomplete {
  constructor(question, rl, answers) {
    const rootPath = question.rootPath || '.';
    const excludePath = question.excludePath || (() => false);
    const itemType = question.itemType || 'any';
    const questionBase = Object.assign(
      {},
      question,
      {
        source: (_, pattern) => getPaths(
          rootPath,
          pattern,
          excludePath,
          itemType,
          question.default,
        ),
      },
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
