#!/usr/bin/env node
"use strict";

import { statSync, accessSync, constants } from "fs";
import fs from "fs";
import { resolve } from "path";
import { sync as _globSync } from "glob";

/**
 * 対象ファイルリストを取得する
 * @private
 * @param extensions 拡張子の配列
 * @param cwd ソースディレクトリ
 * @returns {*}
 */
const getFileList = (extensions, cwd) => {
  const ext = "+(" + extensions.join("|") + ")";
  const pattern = `**/*.${ext}`;
  return _globSync(pattern, {
    cwd: cwd,
  });
};

/**
 * ファイルの更新が必要か否かを判定する
 * @private
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

  //更新日比較　変更があったら更新対象
  const srcStats = getStats(filePath, srcDir);
  return srcStats.mtime > targetStats.mtime;
};

/**
 * fileの情報を取得する。fileが存在しない場合はnullを返す。
 * @private
 * @param filePath:string
 * @param targetDir:string
 * @returns {*}
 */
const getStats = (filePath, targetDir) => {
  try {
    const stats = statSync(targetDir + "/" + filePath);
    return stats;
  } catch (err) {
    return null;
  }
};

/**
 * 更新対象ファイルのリストを取得する。
 * @param extensions{string[]} 拡張子の配列
 * @param srcDir{string}
 * @param targetDir{string} 比較、保存対象ディレクトリ
 * @returns {Array} 更新対象ファイルリスト srcDirからの相対パス
 */
export function getFiles(extensions = [], srcDir, targetDir) {
  //ファイル拡張子が指定されていない場合は警告
  if (extensions.length === 0) {
    console.error(
      "node-newer-files.getFiles() : ファイル拡張子が指定されていません。空の配列を返します。",
    );
  }

  //srcディレクトリの存在確認
  if (!findSrcDir(srcDir, "getFiles")) {
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
}

/**
 * ソースディレクトリの存在を確認する。
 * @private
 * @param srcDir
 * @param functionName
 * @returns {boolean}
 */
const findSrcDir = (srcDir, functionName) => {
  try {
    accessSync(srcDir, constants.R_OK);
    return true;
  } catch (err) {
    console.error(
      `node-newer-files.${functionName}() : srcディレクトリが存在しません。処理を中断します。`,
    );
    return false;
  }
};

/**
 * ファイルの同期を行う。
 * ソースディレクトリに存在しないファイルをターゲットディレクトリから削除する。
 * @param extensions{string[]}
 * @param srcDir{string}
 * @param targetDir{string}
 * @returns {Array} 削除されたファイルのパス配列
 */
export function sync(extensions, srcDir, targetDir) {
  //srcディレクトリの存在確認
  if (!findSrcDir(srcDir, "sync")) {
    return false;
  }

  if (!checkTargetDir(targetDir)) {
    return false;
  }

  const srcFiles = getFileList(extensions, srcDir);
  const targetFiles = getFileList(extensions, targetDir);
  const list = [];

  for (let target of targetFiles) {
    if (!srcFiles.includes(target)) {
      list.push(target);
      fs.unlink(resolve(targetDir, target), () => {});
    }
  }
  return list;
}

/**
 * ターゲットディレクトリの存在確認と、対象ディレクトリが不適切でないかの確認。
 * @private
 * @param targetDir
 * @returns {boolean}
 */
const checkTargetDir = (targetDir) => {
  //targetDirの存在確認
  try {
    accessSync(targetDir, constants.R_OK | constants.W_OK);
  } catch (err) {
    console.error(
      "node-newer-files.sync() : targetディレクトリが存在しないか、パーミッションがありません。処理を中断します。",
    );
    return false;
  }

  //targetDirはルートディレクトリを指定するのは禁止
  if (resolve() === resolve(targetDir) || targetDir === "/") {
    console.error(
      "node-newer-files.sync() : targetにプロジェクトルートが指定されています。ファイルの保護のため処理を中断します。",
    );
    return false;
  }
  return true;
};
