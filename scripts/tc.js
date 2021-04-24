// Script to keep only traditional Chinese characters.
//
// Usage: node scripts/tc.js < cangjie5.noto.dict.yaml

import hanzi from 'hanzi';
import readline from 'readline';
import shuffle from 'array-shuffle';

const OUTPUT_TC = true;
const OUTPUT_SC = false;

hanzi.start();

const COMPONENT_KEYS = ['components1', 'components2', 'components3'];

const SC_COMPONENTS = new Set([
  '讠', '贝', '纟', '见', '门',
  '车', '爱', '龙', '佥', '钅',
  '头', '长', '专', '戋', '马',
  '东', '与', '页', '华', '韦',
  '鸟', '单', '饣', '鱼', '夹',
  '厨', '发', '啬', '齿', '争',
  '寿', '呙', '历', '区', '兴',
  '风', '丬', '仑', '仓', '齐',
  '亚', '冈', '娄', '尽', '奂',
  '罗', '无',
]);

let DICT = [];

let TC_VOTES = {};
let SC_VOTES = {};

function getVote(votes, word) {
  if (votes.hasOwnProperty(word)) {
    return votes[word];
  }
  return 0;
}

function voteFor(votes, word, count = 1) {
  if (!votes.hasOwnProperty(word)) {
    votes[word] = 0;
  }
  votes[word] += count;
}

function confident(word) {
  const tc = getVote(TC_VOTES, word);
  return tc > 0 || Math.abs(tc - getVote(SC_VOTES, word)) > 20;
}

let count = 0;
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

      // Filter by decomposition.
      const decomposition = hanzi.decompose(word);
      let maybeTC = !SC_COMPONENTS.has(word);
      for (let i = 0; i < COMPONENT_KEYS.length; ++i) {
        const key = COMPONENT_KEYS[i];
        if (decomposition.hasOwnProperty(key)) {
          for (let j = 0; j < decomposition[key].length; ++j) {
            if (SC_COMPONENTS.has(decomposition[key][j])) {
              maybeTC = false;
            }
          }
        }
      }

      if (maybeTC) {
        DICT.push({word, line});
      } else {
        voteFor(SC_VOTES, word);
        return;
      }

      // Voting by definition lookup.
      const defs = hanzi.definitionLookup(word);
      if (defs != null) {
        for (let i = 0; i < defs.length; ++i) {
          let def = defs[i];
          voteFor(TC_VOTES, def.traditional, 10);
          if (def.traditional !== def.simplified && word == def.simplified) {
            voteFor(SC_VOTES, word);
          }
        }
      }
    }
  };
}()).on('close', function () {
  const random = shuffle(DICT);

  for (let i = 0; i < random.length; ++i) {
    count++;
    let {word} = random[i];

    if (confident(word)) {
      continue;
    }

    // Voting by dictionary reference.
    const dicts = hanzi.dictionarySearch(word);
    if (dicts != null) {
      for (let i = 0; i < dicts.length && !confident(word); ++i) {
        let defs = dicts[i];
        for (let j = 0; j < defs.length && !confident(word); ++j) {
          let def = defs[j];

          let tc = def.traditional.split('');
          let sc = def.simplified.split('');
          if (tc.length === sc.length) {
            for (let k = 0; k < tc.length; ++k) {
              if (tc[k] === sc[k]) {
                voteFor(TC_VOTES, tc[k]);
              } else {
                voteFor(SC_VOTES, sc[k]);
              }
            }
          }
        }
      }
    }

    const sc = getVote(SC_VOTES, word);
    if (sc > 0) {
      console.error(DICT.length, count, word, getVote(TC_VOTES, word), sc);
    }
  }

  for (let i = 0; i < DICT.length; ++i) {
    let {word, line} = DICT[i];
    const tc = getVote(TC_VOTES, word);
    const isTC = tc > 0 || getVote(TC_VOTES, word) >= getVote(SC_VOTES, word);
    if (isTC && OUTPUT_TC) {
      console.error(word, "TC", getVote(TC_VOTES, word), getVote(SC_VOTES, word));
      console.log(line);
    } else if (!isTC && OUTPUT_SC) {
      console.error(word, "SC", getVote(TC_VOTES, word), getVote(SC_VOTES, word));
      console.log(line);
    }
  }
});
