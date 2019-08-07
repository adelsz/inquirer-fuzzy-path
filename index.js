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
  depthLimit,
  resultFilter,
) {
  const fuzzOptions = {
    pre: style.green.open,
    post: style.green.close,
  };

  async function listNodes(nodePath, level) {
    try {
      if (excludePath(nodePath)) {
        return [];
      }
      const nodes = await readdir(nodePath);
      const currentNode = (itemType !== 'file' ? [nodePath] : []);
      if (
        nodes.length > 0
        && (depthLimit === undefined || level >= 0)
      ) {
        const nodesWithPath = nodes.map(
          nodeName => listNodes(
            path.join(nodePath, nodeName),
            depthLimit ? level - 1 : undefined,
          ),
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

  const nodes = listNodes(rootPath, depthLimit);
  const filterPromise = nodes.then(
    (nodeList) => {
      const filteredNodes = fuzzy
        .filter(pattern || '', nodeList.filter(resultFilter), fuzzOptions)
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
    const {
      depthLimit,
      itemType = 'any',
      rootPath = '.',
      excludePath = () => false,
      resultFilter = () => true,
    } = question;
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
          depthLimit,
          resultFilter,
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
