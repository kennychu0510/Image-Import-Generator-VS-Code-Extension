import * as fs from 'fs';
import * as path from 'path';

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
export interface IImage {
  name: string;
  path: string;
}

export function getImagesInDir(dir: string) {
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
          name: parseNameWithSpace(file),
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

export function parseImageImportsToString(images: IImage[], imageDir: string): string {
  return images.reduce((prev, cur) => {
    return prev + `\t${parseKey(cur.name)}: require('${getRelativePath(imageDir, cur.path)}'),\n`;
  }, '');
}

const extensionPattern = new RegExp(`(${imageExtensions.join('|')})`, 'gi');

function parseKey(key: string): string {
  return key.replace(/-/g, '_').replace(/@/g, '').replace(extensionPattern, '');
}

function getRelativePath(from: string, to: string) {
  return path.join('..', path.relative(from, to)).slice(1);
}

export function createImportIndex(imageDir: string) {
  const images = getImagesInDir(imageDir);
  if (images.length === 0) {
    throw new Error('No images found in directory');
  }
  const content = parseImageImportsToString(images, imageDir);
  generateFile(imageDir, content);
}

function parsePathWithSpaces(path: string): string {
  return path.replace(/ /g, '\\ ');
}

function parseNameWithSpace(name: string, replacement = '_'): string {
  return name.replace(/ /g, replacement);
}