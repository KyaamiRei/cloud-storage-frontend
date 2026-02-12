import { getExtensionFromFileName } from "./getExtensionFromFileName";
import { isImage } from "./isImage";

export type FileCategory = 
  | "all" 
  | "image" 
  | "document" 
  | "video" 
  | "audio" 
  | "archive" 
  | "other";

export const getFileCategory = (filename: string): FileCategory => {
  const ext = getExtensionFromFileName(filename)?.toLowerCase();
  
  if (!ext) return "other";
  
  // Изображения
  if (isImage(ext)) return "image";
  
  // Документы
  const documentExts = [
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", 
    "txt", "rtf", "odt", "ods", "odp", "pages", "numbers", "key"
  ];
  if (documentExts.includes(ext)) return "document";
  
  // Видео
  const videoExts = [
    "mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", 
    "m4v", "3gp", "mpg", "mpeg", "vob", "ogv"
  ];
  if (videoExts.includes(ext)) return "video";
  
  // Аудио
  const audioExts = [
    "mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", 
    "opus", "amr", "aiff", "au"
  ];
  if (audioExts.includes(ext)) return "audio";
  
  // Архивы
  const archiveExts = [
    "zip", "rar", "7z", "tar", "gz", "bz2", "xz", 
    "iso", "dmg", "cab", "arj", "lzh"
  ];
  if (archiveExts.includes(ext)) return "archive";
  
  return "other";
};

export const getFileCategoryLabel = (category: FileCategory): string => {
  const labels: Record<FileCategory, string> = {
    all: "Все файлы",
    image: "Изображения",
    document: "Документы",
    video: "Видео",
    audio: "Аудио",
    archive: "Архивы",
    other: "Прочее",
  };
  return labels[category];
};

export const getFileCategoryIcon = (category: FileCategory) => {
  // Иконки будут использоваться из @ant-design/icons
  return category;
};
