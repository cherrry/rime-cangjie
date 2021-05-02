import argparse from 'argparse';
import fs from 'fs';
import readline from 'readline';

const arg_parser = new argparse.ArgumentParser({});
arg_parser.add_argument('--cangjie', {help: 'Reference cangjie dictionary.'});
const args = arg_parser.parse_args();

let is_dict = false;
let DICT = {};
let JA_DICT = {};

const cangjie_rl = readline.createInterface(fs.createReadStream(args.cangjie));
cangjie_rl.on('line', function (line) {
  if (!is_dict || line === '') {
    console.log(line);
  }
  if (line === '...') {
    is_dict = true;
    return;
  }
  if (is_dict && line !== '') {
    let tabs = line.split('\t');
    const word = tabs[0];
    if (!DICT.hasOwnProperty(word)) {
      DICT[word] = [];
    }
    DICT[word].push(tabs.slice(1).join('\t'));
  }
}).on('close', function () {
  const ja_rl = readline.createInterface(process.stdin);
  ja_rl.on('line', function (line) {
    const tabs = line.split(' ');
    const ja = tabs[0];
    const same_words = new Set(tabs);
    // console.log(ja, same_words);

    same_words.forEach(function (word) {
      if (DICT.hasOwnProperty(word)) {
        const encoding = DICT[word][0];
        if (!JA_DICT.hasOwnProperty(encoding)) {
          JA_DICT[encoding] = [];
        }
        JA_DICT[encoding].push(ja);
      }
    });
  }).on('close', function () {
    const keys = Object.keys(JA_DICT).sort();
    keys.forEach(function (key) {
      const words = JA_DICT[key].sort();
      words.forEach(function (word) {
        console.log(`${word}\t${key}`);
      });
    });
  });
});
