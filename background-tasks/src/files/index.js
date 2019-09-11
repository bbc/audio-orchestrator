export { default as FileStore } from './FileStore';

export const registerFiles = (
  { files, fileStore }, onProgress,
) => fileStore.registerFiles(files, onProgress);

export const probeFiles = (
  { files, fileStore }, onProgress,
) => fileStore.probeFiles(files, onProgress);

export const detectItems = (
  { files, fileStore }, onProgress,
) => fileStore.detectItems(files, onProgress);

export const encodeFiles = (
  { files, fileStore }, onProgress,
) => fileStore.encodeFiles(files, onProgress);
