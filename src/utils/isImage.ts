export const isImage = (ext: string) => {
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext.toLowerCase());
};
