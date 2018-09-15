const newer = require("./node-newer-files.js");
const list = newer.getFiles([], "spec/sampleSrc", "spec/sampleDist");
console.log(list);
