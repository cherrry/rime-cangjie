// Script to keep only traditional Chinese characters.

import argparse from 'argparse';
import fs from 'fs';
import readline from 'readline';

const arg_parser = new argparse.ArgumentParser({});
arg_parser.add_argument('--sc', {help: 'Path to SC character source.'});
const args = arg_parser.parse_args();

let SC_WORDS = new Set();
let TC_WHITELIST = new Set([
  // Cantonese
  '扑', '吓',
  // People names
  '咏',
  // SC False Positive
  '并', '怜',
  // SC False Positive (Variants)
  '祱', '痥', '帨', '鮵', '侻',
  '哾', '駾', '莌', '娧', '綐',
  '䬇', '䫄', '㙂', '䬈', '䂱',
  '䬽', '㟋',
]);

const sc_rl = readline.createInterface(fs.createReadStream(args.sc));
sc_rl.on('line', function (line) {
  const tabs = line.split('\t');
  const word = tabs[0];
  if (!TC_WHITELIST.has(word)) {
    SC_WORDS.add(word);
  }
}).on('close', function() {
  const rl = readline.createInterface(process.stdin);
  let is_dict = false;
  rl.on('line', function(line) {
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
      if (!SC_WORDS.has(word)) {
        console.log(line);
      }
    }
  });
});
