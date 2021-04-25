// Script to find all SC characters.

import hanzi from 'hanzi';
import readline from 'readline';
import shuffle from 'array-shuffle';

hanzi.start();

const SC_COMPONENTS = new Set([
  '讠', '贝', '纟', '见', '门',
  '车', '爱', '龙', '佥', '钅',
  '头', '长', '专', '戋', '马',
  '东', '与', '页', '华', '韦',
  '鸟', '单', '饣', '鱼', '夹',
  '发', '啬', '齿', '争', '寿',
  '呙', '历', '区', '兴', '风',
  '丬', '仑', '仓', '齐', '冈',
  '娄', '尽', '奂', '罗', '无',
  '楽', '厨', '亚',
  // Unused variants
  '兑',
]);

const DICT = [];
const TC_WORDS = new Set();
const SC_WORDS = new Set();

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

const rl = readline.createInterface(process.stdin);
rl.on('line', function() {
  let is_dict = false;
  return function (line) {
    if (line === '...') {
      is_dict = true;
      return;
    }

    if (is_dict && line !== '') {
      let tabs = line.split('\t');
      const word = tabs[0];
      DICT.push({word, line});
    }
  };
}()).on('close', function() {
  // 1. Decomposition
  const COMPONENT_KEYS = ['components1', 'components2', 'components3'];
  DICT.forEach(function ({word}) {
    const decomposition = hanzi.decompose(word);
    let isSC = SC_COMPONENTS.has(word);
    COMPONENT_KEYS.forEach(function (key) {
      if (decomposition.hasOwnProperty(key)) {
        const de = decomposition[key];
        de.forEach(function (c) {
          if (SC_COMPONENTS.has(c)) {
            isSC = true;
          }
        });
      }
    });
    if (isSC) {
      // console.log(word);
      SC_WORDS.add(word);
    }
  });
  console.error('After Decomposition TC', TC_WORDS.size);
  console.error('After Decomposition SC', SC_WORDS.size);

  // 2. Lookup
  DICT.forEach(function ({word}) {
    if (SC_WORDS.has(word)) {
      return;
    }
    const defs = hanzi.definitionLookup(word);
    if (defs == null) {
      return;
    }
    defs.forEach(function ({traditional}) {
      if (!SC_WORDS.has(traditional)) {
        TC_WORDS.add(traditional);
      }
    });
  });
  console.error('After Lookup TC', TC_WORDS.size);
  console.error('After Lookup SC', SC_WORDS.size);

  // 3. Voting
  let TC_VOTES = {};
  let SC_VOTES = {};
  let count = 0;
  const random = shuffle(DICT);
  random.forEach(function ({word}) {
    count++;
    if (TC_WORDS.has(word) || SC_WORDS.has(word)) {
      return;
    }
    const dicts = hanzi.dictionarySearch(word);
    if (dicts == null) {
      return;
    }
    dicts.forEach(function (defs) {
      defs.forEach(function ({traditional, simplified}) {
        const tc = traditional.split('');
        const sc = simplified.split('');
        if (tc.length !== sc.length) {
          return;
        }
        for (let i = 0; i < tc.length; ++i) {
          if (tc[i] === sc[i]) {
            voteFor(TC_VOTES, tc[i]);
          } else {
            voteFor(SC_VOTES, sc[i]);
          }
        }
      });
    });
    const tc = getVote(TC_VOTES, word);
    const sc = getVote(SC_VOTES, word);
    if (sc > tc) {
      console.error(count, DICT.length, word, tc, sc);
    }
  });
  DICT.forEach(function ({word}) {
    if (TC_WORDS.has(word) || SC_WORDS.has(word)) {
      return;
    }
    const tc = getVote(TC_VOTES, word);
    const sc = getVote(SC_VOTES, word);
    if (tc > 0) {
      TC_WORDS.add(word);
    } else if (sc > tc) {
      SC_WORDS.add(word);
    }
  });
  console.error('After Voting TC', TC_WORDS.size);
  console.error('After Voting SC', SC_WORDS.size);

  // Final: Output.
  DICT.forEach(function ({word, line}) {
    if (!TC_WORDS.has(word) && SC_WORDS.has(word)) {
      console.log(line);
    }
  });
});

