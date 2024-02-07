export type ExtensionConfig = { 
  prefix: string,
  suffix: string,
  spaceReplacement: string,
  atReplacement: string,
  hyphenReplacement: string,
}

export interface IImage {
  name: string;
  path: string;
}