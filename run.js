const newer = require("./node-newer-files.js");
const list = newer.getFiles(
  ["js", "html"],
  "spec/sampleSrc",
  "spec/sampleDist"
);
console.log(list);
console.log(
  `maybe
[
  'sample1.js',
  'sample3.js',
  'sample4.html',
  'sub/sampleSub1.js',
  'sub/sampleSub2.html'
]
`
);
