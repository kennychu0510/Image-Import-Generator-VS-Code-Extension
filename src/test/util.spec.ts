import { describe, expect, it } from "vitest";

import * as path from "path";
import { ExtensionConfig, IImage } from "../model";
import {
  containSpace,
  getImagesInDir,
  parseImageImportsToString,
} from "../utils";

// get current file path

const imagesPath1 = path.join(__dirname, "assets", "images1");
const config: ExtensionConfig = {
  prefix: "",
  suffix: "",
  atReplacement: "",
  hyphenReplacement: "_",
  imageExtensions: ["jpg", "jpeg", "png", "gif"],
};

describe("get images in dir", () => {
  it("returns an array", () => {
    expect(Array.isArray(getImagesInDir(imagesPath1, config))).toBeTruthy();
  });

  it("returns correct array", () => {
    expect(getImagesInDir(imagesPath1, config)).toMatchObject([
      {
        name: "iOS_Loading.gif",
        path: path.join(imagesPath1, "iOS_Loading.gif"),
      },
      {
        name: "icon-cancel@2x.png",
        path: path.join(imagesPath1, "icon-cancel@2x.png"),
      },
      {
        name: "icon-cancel@3x.png",
        path: path.join(imagesPath1, "icon-cancel@3x.png"),
      },
    ]);
  });
});

describe("image paths parse to string", () => {
  const sampleInput: IImage[] = [
    {
      name: "icon-cancel@3x.png",
      path: imagesPath1 + "/icon-cancel@3x.png",
    },
    {
      name: "iOS_Loading.gif",
      path: imagesPath1 + "/iOS_Loading.gif",
    },
    {
      name: "icon-cancel@2x.png",
      path: imagesPath1 + "/icon-cancel@2x.png",
    },
  ];

  it("parse to string correctly", () => {
    expect(
      parseImageImportsToString(sampleInput, imagesPath1, config)
    ).toContain(`icon_cancel3x: require('./icon-cancel@3x.png'),`);
    expect(
      parseImageImportsToString(sampleInput, imagesPath1, config)
    ).toContain(`iOS_Loading: require('./iOS_Loading.gif'),`);
    expect(
      parseImageImportsToString(sampleInput, imagesPath1, config)
    ).toContain(`icon_cancel2x: require('./icon-cancel@2x.png'),`);
  });
});

describe("ignore images containing sapce", () => {
  it("should be able to parse path with spaces", () => {
    const folderWithImagesWithSpaces = path.join(
      __dirname,
      "assets",
      "with-images-spaces"
    );
    const images = getImagesInDir(folderWithImagesWithSpaces, config);
    expect(images.length === 0);
  });
});

describe("contain spaces", () => {
  it("should return true if name contains spaces", () => {
    expect(containSpace("icon cancel.png")).toBeTruthy();
  });

  it("should return false if name does not contain spaces", () => {
    expect(containSpace("icon-cancel.png")).toBeFalsy();
  });

  it("should return false if name does not contain spaces", () => {
    expect(containSpace("icon/   cancel.png")).toBeTruthy();
  });
});
