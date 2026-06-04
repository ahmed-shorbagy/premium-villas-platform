export const generateSlug = (title: string): string => {
  // 1. Convert to lower case (for English parts)
  let slug = title.toLowerCase();

  // 2. Remove special characters but keep Arabic characters, English letters, and numbers
  // \u0621-\u064A covers standard Arabic characters
  // \u0660-\u0669 covers Arabic-Indic digits
  slug = slug.replace(/[^\w\s\u0621-\u064A\u0660-\u0669-]/g, '');

  // 3. Replace spaces and multiple hyphens with a single hyphen
  slug = slug.replace(/[\s-]+/g, '-');

  // 4. Trim hyphens from start and end
  slug = slug.replace(/^-+|-+$/g, '');

  // 5. Append a short random string to guarantee uniqueness 
  // (e.g., if there are multiple 'فيلا-بمسبح')
  const randomStr = Math.random().toString(36).substring(2, 6);
  
  return `${slug}-${randomStr}`;
};
