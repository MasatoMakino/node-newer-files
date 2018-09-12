#!/usr/bin/env node
"use strict";

const fs = require("fs");
const glob = require("glob");

/**
 * 対象ファイルリストを取得する
 * @param extensions 拡張子の配列
 * @param cwd　ソースディレクトリ
 * @returns {*}
 */
const getFileList = (extensions, cwd) => {
  const ext = "+(" + extensions.join("|") + ")";
  const pattern = `**/*.${ext}`;
  return glob.sync(pattern, {
    cwd: cwd
  });
};

/**
 * ファイルの更新が必要か否かを判定する
 * @param filePath
 * @param srcDir
 * @param targetDir
 * @returns {boolean}
 */
const isNeedsUpdate = (filePath, srcDir, targetDir) => {
  const targetStats = getStats(filePath, targetDir);
  if (!targetStats) {
    return true;
  }

  const srcStats = getStats(filePath, srcDir);
  if (srcStats.mtime > targetStats.mtime) {
    return true;
  }
  return false;
};

/**
 * fileの情報を取得する。fileが存在しない場合はnullを返す。
 * @param filePath:string
 * @param targetDir:string
 * @returns {*}
 */
const getStats = (filePath, targetDir) => {
  try {
    const stats = fs.statSync(targetDir + "/" + filePath);
    return stats;
  } catch (err) {
    return null;
  }
};

/**
 * 更新対象ファイルのリストを取得する
 * @param extensions 拡張子の配列
 * @param srcDir ソースディレクトリ
 * @param targetDir 比較、保存対象ディレクトリ
 * @returns {{path: Array, fileName: Array}} 更新対象ファイルリスト pathはフルパス、filenameはsrcDirからの相対パス
 */
exports.getFiles = (extensions, srcDir, targetDir) => {
  const imageList = getFileList(extensions, srcDir);
  const list = [];

  for (let file of imageList) {
    const update = isNeedsUpdate(file, srcDir, targetDir);

    if (!update) {
      continue;
    }
    list.push(file);
  }
  return list;
};
