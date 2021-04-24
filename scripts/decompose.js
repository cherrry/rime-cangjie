import argparse from 'argparse'
import hanzi from 'hanzi'

let arg_parser = new argparse.ArgumentParser({});
arg_parser.add_argument('--words', {help: 'Words to decompose.'});
const args = arg_parser.parse_args();

hanzi.start();

console.log(hanzi.decomposeMany(args.words));

