const fs = require('fs');

const readFileFrom = (path) => {
  return fs
    .readFileSync(path)
    .toString()
    .split('\r\n');
};

var mongoObjectId = function () {
  var timestamp = (
    (new Date().getTime() / 1000) |
    0
  ).toString(16);
  return (
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, function () {
        return (
          (Math.random() * 16) |
          0
        ).toString(16);
      })
      .toLowerCase()
  );
};

try {
  var wordStr = readFileFrom(
    `${process.cwd()}/../wordData.json`
  );

  var wordClassStr = readFileFrom(
    `${process.cwd()}/../wordClassData.json`
  );

  var exampleStr = readFileFrom(
    `${process.cwd()}/../exampleData.json`
  );
} catch (err) {
  console.log(err);
}

const words = JSON.parse(wordStr);
const wordClasses = JSON.parse(wordClasses);

const createJSON = async (
  property,
  values,
  writePath
) => {
  const words = values.map((value) => {
    const obj = {};

    obj[property] = value;
    return obj;
  });

  const wordsJSON = JSON.stringify(words);

  fs.writeFileSync(writePath, wordsJSON);
  console.log(wordsJSON);
};

createJSON(
  'spelling',
  wordSpellings,
  `${process.cwd()}/../words.data.json`
);
createJSON(
  'example',
  examples,
  `${process.cwd()}/../examples.data.json`
);
