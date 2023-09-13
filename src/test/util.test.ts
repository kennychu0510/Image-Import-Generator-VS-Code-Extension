import { describe, it, expect, afterEach } from 'vitest';

import { IImage, generateFile, getImagesInDir, parseImageImportsToString } from '../utils';
import * as fs from 'fs';
const imagesPath1 = '/Users/kennychu/mycode/vscode_extensions/rn-image-import/src/test/assets/images1';

describe('get images in dir', () => {
  it('returns an array', () => {
    expect(Array.isArray(getImagesInDir(imagesPath1))).toBeTruthy();
  });

  it('returns correct array', () => {
    expect(getImagesInDir(imagesPath1)).toMatchObject([
      {
        name: 'iOS_Loading.gif',
        path: imagesPath1 + '/iOS_Loading.gif',
      },
      {
        name: 'icon-cancel@2x.png',
        path: imagesPath1 + '/icon-cancel@2x.png',
      },
      {
        name: 'icon-cancel@3x.png',
        path: imagesPath1 + '/icon-cancel@3x.png',
      },
    ]);
  });
});

describe('generate file', () => {
  afterEach(() => {
    fs.rmSync(imagesPath1 + '/index.ts');
  });
  it('generate file works', () => {
    generateFile(imagesPath1, `\n`);
    expect(fs.existsSync(imagesPath1 + '/index.ts')).toBeTruthy();
    expect(fs.readFileSync(imagesPath1 + '/index.ts', 'utf-8')).toContain('export default {');
  });
});

describe('image paths parse to string', () => {
  const sampleInput: IImage[] = [
    {
      name: 'icon-cancel@3x.png',
      path: imagesPath1 + '/icon-cancel@3x.png',
    },
    {
      name: 'iOS_Loading.gif',
      path: imagesPath1 + '/iOS_Loading.gif',
    },
    {
      name: 'icon-cancel@2x.png',
      path: imagesPath1 + '/icon-cancel@2x.png',
    },
  ];

  it('parse to string correctly', () => {
    expect(parseImageImportsToString(sampleInput, imagesPath1)).toContain(`icon_cancel3x: require('./icon-cancel@3x.png'),`);
    expect(parseImageImportsToString(sampleInput, imagesPath1)).toContain(`iOS_Loading: require('./iOS_Loading.gif'),`);
    expect(parseImageImportsToString(sampleInput, imagesPath1)).toContain(`icon_cancel2x: require('./icon-cancel@2x.png'),`);
  });
});

describe('integration test', () => {
  afterEach(() => {
    fs.rmSync(imagesPath1 + '/index.ts');
  });
  it('generate file with correct imports', () => {
    const images = getImagesInDir(imagesPath1);
    const content = parseImageImportsToString(images, imagesPath1);
    generateFile(imagesPath1, content);
    expect(fs.existsSync(imagesPath1 + '/index.ts')).toBeTruthy();
    expect(fs.readFileSync(imagesPath1 + '/index.ts', 'utf-8')).toContain(`icon_cancel3x: require('./icon-cancel@3x.png'),`);
    expect(fs.readFileSync(imagesPath1 + '/index.ts', 'utf-8')).toContain(`iOS_Loading: require('./iOS_Loading.gif'),`);
    expect(fs.readFileSync(imagesPath1 + '/index.ts', 'utf-8')).toContain(`icon_cancel2x: require('./icon-cancel@2x.png'),`);
  });
});
