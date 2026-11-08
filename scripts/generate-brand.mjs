import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { Milo } = await server.ssrLoadModule('/src/components/Art.tsx');
  const bear = renderToStaticMarkup(createElement(Milo, { happy: true, waving: true }));
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#CCE5EA"/><circle cx="512" cy="512" r="405" fill="#F8D767"/><svg x="190" y="130" width="645" height="720">${bear}</svg></svg>`;
  writeFileSync('public/milo.svg', icon);
  writeFileSync('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', new Resvg(icon).render().asPng());
  const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="#CCE5EA"/><svg x="1066" y="1038" width="600" height="656">${bear}</svg></svg>`;
  const png = new Resvg(splash).render().asPng();
  for (const file of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) writeFileSync(`ios/App/App/Assets.xcassets/Splash.imageset/${file}`, png);
} finally { await server.close(); }
