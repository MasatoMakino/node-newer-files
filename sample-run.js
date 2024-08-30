import { getFiles } from "./node-newer-files.js";
const list = getFiles(
  ["js", "html"],
  "spec/sampleSrc",
  "spec/sampleDist",
).sort();
console.log(list);

const expect = [
  "sample1.js",
  "sample3.js",
  "sample4.html",
  "sub/sampleSub1.js",
  "sub/sampleSub2.html",
].sort();

console.log(`maybe`, expect);
if (list.toString() === expect.toString()) {
  console.log("works fine!");
} else {
  console.warn("error!");
}
