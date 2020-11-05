const fs = require('fs');
const slugify = require('slugify');

const wordsString = fs.readFileSync(
  `${__dirname}/../wordClassesData.json`
);

const words = JSON.parse(wordsString);

const modifiedWords = words.map((el) => {
  el.slug = slugify(el.partOfSpeech);
  return el;
});

fs.writeFileSync(
  `${__dirname}/../wordClassesData.json`,
  JSON.stringify(modifiedWords)
);
