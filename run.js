const newer = require("./node-newer-files.js");
const list = newer.getFiles(
  ["js", "html"],
  "spec/sampleSrc",
  "spec/sampleDist"
);
console.log(list);
