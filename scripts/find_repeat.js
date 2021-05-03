import argparse from 'argparse';
import fs from 'fs';
import readline from 'readline';

const arg_parser = new argparse.ArgumentParser({});
arg_parser.add_argument('--cj3ext', {help: 'Additional extension dictionary.'});
const args = arg_parser.parse_args();

let is_dict = false;
let encoding = '';
let repeated = [];

let CJ3EXT = {};

const cj3ext_rl = readline.createInterface(fs.createReadStream(args.cj3ext));
cj3ext_rl.on('line', function (line) {
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
    const keys = tabs[1];
    if (!CJ3EXT.hasOwnProperty(keys)) {
      CJ3EXT[keys] = [];
    }
    CJ3EXT[keys].push(word);
  }
}).on('close', function () {
  const rl = readline.createInterface(process.stdin);
  rl.on('line', function (line) {
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
      const keys = tabs[1];
      if (keys !== encoding) {
        if (CJ3EXT.hasOwnProperty(encoding)) {
          repeated = repeated.concat(CJ3EXT[encoding]);
        }
        if (repeated.length > 1) {
          repeated.forEach(function (w) {
            console.log(`${w}\t${encoding}`);
          });
        }
        encoding = keys;
        repeated = [];
      }
      repeated.push(word);
    }
  });
});
