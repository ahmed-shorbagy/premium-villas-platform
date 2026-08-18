# Cairo Property Hub

## Project info

A comprehensive real estate platform for the Arab world.

## Getting Started

To run this project locally:

1. Clone the repository
2. Install dependencies:
```sh
npm install
```
3. Start the development server:
```sh
npm run dev
```

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Deployment

To deploy this project:

1. Build the project:
```sh
npm run build
```
This will also generate the sitemap.xml for SEO.

2. Deploy the `dist` folder to your hosting provider.

## Cloudflare R2 media uploads

Admin villa media uploads go directly to the `shima-villas` R2 bucket using a short-lived signed PUT URL from the `r2-presign` Edge Function. R2 credentials must stay in Supabase secrets (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `PUBLIC_R2_URL`) — never as `VITE_*` values.

Admin villa media is uploaded to R2 as a 1280px WebP plus a 480px `_sm` thumbnail. Listing cards use the thumbnail and never autoplay video. Removing media or deleting a villa also deletes the R2 objects via `r2-delete`.

Apply the CORS policy in [`supabase/functions/r2-presign/cors.json`](supabase/functions/r2-presign/cors.json) on the R2 bucket (Cloudflare dashboard → R2 → bucket → Settings → CORS). Production origins `https://www.nuzuul.com` and `https://nuzuul.com` are included. Browser `PUT` uploads require `Content-Type` and `Cache-Control`.

