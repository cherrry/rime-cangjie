import argparse from 'argparse';
import fs from 'fs';
import readline from 'readline';

const arg_parser = new argparse.ArgumentParser({});
arg_parser.add_argument('--jp', {help: 'Path to Japanese characters source.'});
const args = arg_parser.parse_args();

const jp_rl = readline.createInterface(fs.createReadStream(args.jp));
let KANJI = new Set();

jp_rl.on('line', function (line) {
  const words = line.split('');
  words.forEach(function (word) {
    KANJI.add(word);
  });
}).on('close', function () {
  const rl = readline.createInterface(process.stdin);
  console.error("Kanji: ", KANJI.size);

  rl.on('line', function (line) {
    const tabs = line.split('\t');
    const word = tabs[0];
    if (KANJI.has(word)) {
      KANJI.delete(word);
    }
  }).on('close', function () {
    console.error("Filtered Kanji: ", KANJI.size);
    const sorted = Array.from(KANJI).sort();
    sorted.forEach(function (word) {
      console.log(word);
    });
  });
});
