const newer = require("./node-newer-files.js");

const list = newer.getFiles(["jpg", "png", "gif"], "src/img", "dist/img");
console.log(list);
