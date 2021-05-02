import readline from 'readline';

let is_dict = false;
let encoding = '';
let repeated = [];

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
      if (repeated.length > 1) {
        repeated.sort().forEach(function (w) {
          console.log(`${w}\t${encoding}`);
        });
      }
      encoding = keys;
      repeated = [];
    }
    repeated.push(word);
  }
});
