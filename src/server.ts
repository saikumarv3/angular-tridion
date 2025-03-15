import {
  ɵSERVER_CONTEXT as SERVER_CONTEXT,
  renderApplication
} from '@angular/platform-server';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { bootstrap } from './bootstrap.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = resolve(browserDistFolder, 'index.html');

const app = express();
const engine = new CommonEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', async (req, res, next) => {
  try {
    const html = await engine.render({
      bootstrap,
      documentFilePath: indexHtml,
      url: req.originalUrl,
      providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: SERVER_CONTEXT, useValue: 'ssr' }
      ]
    });
    res.send(html);
  } catch (err) {
    next(err);
  }
});

/**
 * Start the server
 */
const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});

export default app;
