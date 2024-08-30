"use strict";
import fs from "fs";
import { vi, describe, test, expect } from "vitest";

const spyLog = vi.spyOn(console, "log").mockImplementation((x) => x);
const spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);
const spyError = vi.spyOn(console, "error").mockImplementation((x) => x);

import { getFiles, sync } from "../node-newer-files";

describe("更新ファイルリストの取得", () => {
  const maybeList = [
    "sample1.js",
    "sample3.js",
    "sample4.html",
    "sample5.css",
    "sub/sampleSub1.js",
    "sub/sampleSub2.html",
  ];

  const srcList = [
    "sample1.js",
    "sample2.js",
    "sample3.js",
    "sample4.html",
    "sample5.css",
    "sub/sampleSub1.js",
    "sub/sampleSub2.html",
  ];

  /**
   * CI環境ではテストファイルの最終更新日時が変化するため断念。ローカルでは正常に稼働する。
   */
  /*
  test("更新ファイルを期待値通りに取得", () => {
    const list = newer.getFiles(
      ["js", "html", "css"],
      "spec/sampleSrc",
      "spec/sampleDist"
    );

    expect(list).toEqual(maybeList);
  });
  */

  test("ファイル拡張子無指定の場合は空の配列を返す", () => {
    const list = getFiles(undefined, "spec/sampleSrc", "spec/sampleDist");
    expect(list).toEqual([]);
  });

  test("ソースディレクトリ未指定の場合はエラーとして処理を中断", () => {
    const list = getFiles(["js", "html", "css"], undefined, "spec/sampleDist");
    expect(list).toEqual([]);
  });

  test("ターゲットディレクトリ未指定の場合は空として扱い、ソースディレクトリのファイルを全て返す", () => {
    const list = getFiles(["js", "html", "css"], "spec/sampleSrc", undefined);
    expect([...list].sort()).toEqual([...srcList].sort());
  });
});

describe("ファイルの同期", () => {
  const unlink = vi
    .spyOn(fs, "unlink")
    .mockImplementation((string, Function) => undefined);

  test("ファイルの同期と削除を行う", () => {
    const deleted = sync(
      ["js", "html", "css"],
      "spec/sampleSrc",
      "spec/sampleDist",
    );
    expect(unlink).toHaveBeenCalled();
    expect(unlink).toHaveBeenCalledTimes(2);
    expect([...deleted].sort()).toEqual(
      ["sample101.js", "sample102.js"].sort(),
    );

    unlink.mockReset();
    unlink.mockRestore();
  });

  test("srcディレクトリが存在しない場合は停止", () => {
    const deleted = sync(
      ["js", "html", "css"],
      "not/exist/dir",
      "spec/sampleDist",
    );

    expect(deleted).toBe(false);

    unlink.mockReset();
    unlink.mockRestore();
  });

  test("srcディレクトリがnullの場合も存在しないとして処理停止", () => {
    const deleted = sync(["js", "html", "css"], null, "spec/sampleDist");
    expect(deleted).toBe(false);
    unlink.mockReset();
    unlink.mockRestore();
  });

  test("srcディレクトリがundefinedの場合も存在しないとして処理停止", () => {
    const deleted = sync(["js", "html", "css"], undefined, "spec/sampleDist");
    expect(deleted).toBe(false);
    unlink.mockReset();
    unlink.mockRestore();
  });

  test("targetディレクトリが存在しない場合は停止", () => {
    const deleted = sync(
      ["js", "html", "css"],
      "spec/sampleSrc",
      "not/exist/dir",
    );
    expect(deleted).toBe(false);
    unlink.mockReset();
    unlink.mockRestore();
  });

  test("targetディレクトリがundefinedの場合は処理停止", () => {
    const deleted = sync(["js", "html", "css"], "spec/sampleSrc", undefined);
    expect(deleted).toBe(false);
    unlink.mockReset();
    unlink.mockRestore();
  });

  test("targetディレクトリがルート'./'の場合は処理停止", () => {
    const deleted = sync(["js", "html", "css"], "spec/sampleSrc", "./");
    expect(deleted).toBe(false);
    unlink.mockReset();
    unlink.mockRestore();
  });

  test("targetディレクトリが'/'の場合は処理停止", () => {
    const deleted = sync(["js", "html", "css"], "spec/sampleSrc", "/");
    expect(deleted).toBe(false);
    unlink.mockReset();
    unlink.mockRestore();
  });
});
