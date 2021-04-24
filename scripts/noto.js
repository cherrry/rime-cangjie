// Script to filter words without font support.
//
// Usage: node scripts/noto.js --font /path/to/font.otf < cangjie5.dict.yaml

import argparse from 'argparse'
import fontkit from 'fontkit'
import readline from 'readline'

const arg_parser = new argparse.ArgumentParser({});
arg_parser.add_argument('--font', {help: 'Path to font file.'});
const args = arg_parser.parse_args();

let font = fontkit.openSync(args.font);
let charSet = new Set(font.characterSet);

const rl = readline.createInterface(process.stdin);
rl.on('line', function() {
  let is_dict = false;
  return function (line) {
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
      const code = word.charCodeAt(0);
      if (charSet.has(code)) {
        console.log(line);
      }
    }
  }
}());
