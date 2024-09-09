import * as crypto from 'crypto';

/**
 * 计算文件hash值
 * @param buffer
 * @returns 文件类型
 */
export function calculateHash(buffer: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);

  return hash.digest('hex');
}

/**
 * 判断文件类型
 * @param mimetype
 * @returns 文件类型
 */
export function determineFileType(mimetype: string): string {
  // 图片类型
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/webp',
    'image/vnd.microsoft.icon',
  ];

  // 文档类型
  const documentMimeTypes = [
    'application/pdf',
    'application/msword',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'text/html',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
  ];

  // 音频类型
  const audioMimeTypes = [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'audio/aac',
    'audio/midi',
    'audio/x-midi',
    'audio/flac',
  ];

  // 视频类型
  const videoMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/quicktime',
    'video/x-flv',
    'video/x-matroska',
  ];

  // 判断MIME类型属于哪一类
  if (imageMimeTypes.includes(mimetype)) {
    return 'image';
  } else if (documentMimeTypes.includes(mimetype)) {
    return 'docs';
  } else if (audioMimeTypes.includes(mimetype)) {
    return 'audio';
  } else if (videoMimeTypes.includes(mimetype)) {
    return 'video';
  } else {
    return 'docs';
  }
}
