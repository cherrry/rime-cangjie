import argparse from 'argparse'
import hanzi from 'hanzi'

let arg_parser = new argparse.ArgumentParser({});
arg_parser.add_argument('--words', {help: 'Words to lookup.'});
const args = arg_parser.parse_args();

hanzi.start();

args.words.split('').forEach(function (word) {
  console.log(hanzi.definitionLookup(word));
});
