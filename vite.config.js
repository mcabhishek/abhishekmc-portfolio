import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoHtml } from './src/config/site.js'

/**
 * Injects the JSON-LD graph into index.html at build time, so the structured
 * data is always derived from SITE_CONFIG and can never drift from it.
 */
function structuredData() {
  return {
    name: 'abhishek-structured-data',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace('</head>', `    ${seoHtml()}\n  </head>`)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), structuredData()],
  server: {
    proxy: {
      // Relay contact-form submissions to the local SMTP server.
      "/api": "http://127.0.0.1:3001",
    },
  },
  preview: {
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
})
