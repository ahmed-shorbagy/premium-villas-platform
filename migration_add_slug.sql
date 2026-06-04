-- Add slug column to properties table
ALTER TABLE public.properties ADD COLUMN slug text;

-- Add a unique constraint so no two properties have the same slug
ALTER TABLE public.properties ADD CONSTRAINT properties_slug_key UNIQUE (slug);
