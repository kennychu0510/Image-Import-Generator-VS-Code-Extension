import * as fs from 'fs';
import * as path from 'path';
import { ExtensionConfig, IImage } from './model';

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];


export function getImagesInDir(dir: string, config: ExtensionConfig) {
  const { prefix, suffix, spaceReplacement, atReplacement, hyphenReplacement } = config;

  let images: IImage[] = [];

  function isImageFile(filename: string) {
    const extension = path.extname(filename).toLowerCase();
    return imageExtensions.includes(extension);
  }

  function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (isImageFile(file)) {
        images.push({
          name: parseNameWithSpace(file, spaceReplacement),
          path: parsePathWithSpaces(filePath),
        });
      }
    });
  }

  scanDirectory(dir);
  images = images.sort((a, b) => {
    if (a.path < b.path) {
      return -1;
    }
    if (a.path > b.path) {
      return 1;
    }
    return 0;
  });
  return images;
}

export function generateFile(filePath: string, content: string) {
  const fileContent = 'export default {\n' + content + '};';
  fs.writeFile(filePath + '/index.ts', fileContent, (err) => {
    if (err) {
      throw new Error(err.message);
    }
  });
}

export function parseImageImportsToString(images: IImage[], imageDir: string, config: ExtensionConfig): string {
  const { prefix, suffix, spaceReplacement, atReplacement, hyphenReplacement } = config;
  return images.reduce((prev, cur) => {
    return prev + `\t${prefix}${parseKey(cur.name, config)}${suffix}: require('${getRelativePath(imageDir, cur.path)}'),\n`;
  }, '');
}

const extensionPattern = new RegExp(`(${imageExtensions.join('|')})`, 'gi');

function parseKey(key: string, config: ExtensionConfig): string {
  const { prefix, suffix, spaceReplacement, atReplacement, hyphenReplacement } = config;
  return key.replace(/-/g, hyphenReplacement).replace(/@/g, atReplacement).replace(extensionPattern, '');
}

function getRelativePath(from: string, to: string) {
  return path.join('..', path.relative(from, to)).slice(1);
}

export function createImportIndex(imageDir: string, config: ExtensionConfig) {
  const images = getImagesInDir(imageDir, config);
  if (images.length === 0) {
    generateFile(imageDir, '')
  }
  const content = parseImageImportsToString(images, imageDir, config);
  generateFile(imageDir, content);
}

function parsePathWithSpaces(path: string): string {
  return path.replace(/ /g, '\\ ');
}

function parseNameWithSpace(name: string, replacement = '_'): string {
  return name.replace(/ /g, replacement);
}