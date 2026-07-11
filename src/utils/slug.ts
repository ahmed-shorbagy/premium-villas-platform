export const generateSlug = (title: string): string => {
  // Generate a clean 6-character random alphanumeric string for clean URLs
  // This completely avoids Arabic characters in the URL
  return Math.random().toString(36).substring(2, 8);
};
