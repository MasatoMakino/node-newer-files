#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
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
  return srcStats.mtime > targetStats.mtime;
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
 * @returns {Array} 更新対象ファイルリスト pathはフルパス、filenameはsrcDirからの相対パス
 */
exports.getFiles = (extensions = [], srcDir, targetDir) => {
  //ファイル拡張子が指定されていない場合は警告
  if (extensions.length === 0) {
    console.error(
      "node-newer-files.getFiles() : ファイル拡張子が指定されていません。空の配列を返します。"
    );
  }

  //srcディレクトリの存在確認
  try {
    fs.accessSync(srcDir, fs.constants.R_OK);
  } catch (err) {
    console.error(
      "node-newer-files.getFiles() : srcディレクトリが存在しません。処理を中断します。"
    );
    return [];
  }

  const fileList = getFileList(extensions, srcDir);
  const list = [];

  for (let file of fileList) {
    const update = isNeedsUpdate(file, srcDir, targetDir);

    if (!update) {
      continue;
    }
    list.push(file);
  }
  return list;
};

/**
 * ファイルの同期を行う
 * ソースディレクトリに存在しないファイルをターゲットディレクトリから削除する
 * @param extensions
 * @param srcDir
 * @param targetDir
 */
exports.sync = (extensions, srcDir, targetDir) => {
  //srcディレクトリの存在確認
  try {
    fs.accessSync(srcDir, fs.constants.R_OK);
  } catch (err) {
    console.error(
      "node-newer-files.sync() : srcディレクトリが存在しません。targetディレクトリを破壊する可能性があるので処理を中断します。"
    );
    return false;
  }

  //targetDirの存在確認
  try {
    fs.accessSync(targetDir, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    console.error(
      "node-newer-files.sync() : targetディレクトリが存在しないか、パーミッションがありません。処理を中断します。"
    );
    return false;
  }

  //targetDirはルートディレクトリを指定するのは禁止
  if (path.resolve() === path.resolve(targetDir) || targetDir === "/") {
    console.error(
      "node-newer-files.sync() : targetにプロジェクトルートが指定されています。ファイルの保護のため処理を中断します。"
    );
    return false;
  }

  const srcFiles = getFileList(extensions, srcDir);
  const targetFiles = getFileList(extensions, targetDir);
  const list = [];

  for (let target of targetFiles) {
    if (!srcFiles.includes(target)) {
      list.push(target);
      fs.unlink(path.resolve(targetDir, target), () => {});
    }
  }
  return list;
};
