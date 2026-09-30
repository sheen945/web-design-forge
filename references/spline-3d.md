# Spline 3D 集成指南

> 摘自 GENESIS UI/UX Gold Standard（作者 Miguel Jiminez，MIT 协议）Phase 4。
> 触发场景：项目需要交互式 3D 场景（Hero 背景、产品展示、沉浸式体验）时阅读本文件。

## Phase 4: Spline 3D Integration

When the project calls for interactive 3D scenes (hero backgrounds, product showcases, immersive experiences), use [Spline.design](https://spline.design).

### Embed by Stack

| Stack | Method |
|---|---|
| Vanilla HTML/JS | `<spline-viewer>` web component OR `@splinetool/runtime` |
| React / Vite | `@splinetool/react-spline` |
| Next.js | `@splinetool/react-spline/next` |
| Vue | `@splinetool/vue-spline` |
| iframe | Public URL iframe |

### Setup Checklist (BEFORE embedding)

User must: Spline editor → **Export** → **Code Export** → copy `prod.spline.design` URL. Check:
- Toggle **Hide Background** ON (if site has custom bg)
- Toggle **Hide Spline Logo** ON (paid plan)
- Set **Geometry Quality** to Performance
- Disable **Page Scroll**, **Zoom**, **Pan** unless needed
- Click **Generate Draft** / **Promote to Production** after changes

### React / Vite (Lazy Loading)
```jsx
import { lazy, Suspense } from 'react';
const Spline = lazy(() => import('@splinetool/react-spline'));

export default function Hero() {
  return (
    <Suspense fallback={<div style={{ background: '#0a0a0a', width: '100%', height: '100vh' }} />}>
      <Spline scene="https://prod.spline.design/REPLACE_ME/scene.splinecode" />
    </Suspense>
  );
}
```

### Next.js (SSR Fix)
```jsx
import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
  loading: () => <div style={{ background: '#0a0a0a', width: '100%', height: '100vh' }} />
});
export default function Page() {
  return <Spline scene="https://prod.spline.design/REPLACE_ME/scene.splinecode" />;
}
```

### Vanilla HTML
```html
<script type="module" src="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/REPLACE_ME/scene.splinecode" background="transparent" events-target="global"></spline-viewer>
```

### Full-Page 3D Hero (Production Pattern)
```jsx
import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isLowEnd = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 2;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div style={{
        position: 'absolute', inset: 0, background: '#0a0a0a', zIndex: 0,
        opacity: loaded ? 0 : 1, transition: 'opacity 0.5s ease'
      }} />
      {!isMobile && !isLowEnd && (
        <Spline
          scene="https://prod.spline.design/REPLACE_ME/scene.splinecode"
          onLoad={() => setLoaded(true)}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1>Your Content Here</h1>
      </div>
    </div>
  );
}
```

### Runtime API — Object Control
```js
spline.load(sceneUrl).then(() => {
  const obj = spline.findObjectByName('MyObject');
  obj.position.x += 50;
  obj.rotation.y += Math.PI / 2;    // RADIANS not degrees
  obj.scale.x = 2; obj.scale.y = 2; obj.scale.z = 2;
  obj.emitEvent('mouseHover');       // trigger animation
  obj.emitEventReverse('mouseHover'); // reverse
  spline.setVariable('score', spline.getVariable('score') + 1);
  spline.addEventListener('mouseDown', (e) => console.log('Clicked:', e.target.name));
});
```

### Spline Event Types

| Event | Use case |
|---|---|
| `mouseDown` | Click/tap on object |
| `mouseUp` | Release after click |
| `mouseHover` | Cursor enters object area |
| `mousePress` | Holding click down |
| `keyDown` / `keyUp` | Key press/release |
| `start` | Scene loaded and started |
| `scroll` | Page scrolled |

### Scene Performance Limits
- Under 3MB = fine
- 3-10MB = optimize
- Over 10MB = serious problem
- Over 20MB = export as video, don't embed

### Mobile Strategy (ALWAYS implement one)

**Option A — Skip on mobile (recommended):**
```js
if (window.innerWidth < 768 || navigator.hardwareConcurrency <= 2) {
  // Show static background or video instead
}
```

**Option B — Export as video for mobile:** Record animation as MP4, serve on mobile.

### CLS Prevention
```css
spline-viewer, canvas.spline-canvas {
  display: block; width: 100%; height: 100vh;
  contain: strict;
}
```

### Load Timeout Fallback (ALWAYS add)
```js
const TIMEOUT_MS = 8000;
const timeoutId = setTimeout(() => {
  document.getElementById('spline-fallback').style.display = 'block';
  document.querySelector('.spline-wrapper').style.display = 'none';
}, TIMEOUT_MS);
spline.load(sceneUrl).then(() => clearTimeout(timeoutId));
```

### Common Gotchas

| Symptom | Fix |
|---|---|
| Page won't scroll | `body { overflow: auto !important }` or disable Page Scroll in Play Settings |
| White box behind scene | Play Settings → Hide Background → regenerate URL |
| Laggy on non-Mac | Add `navigator.hardwareConcurrency` check, skip on low-end |
| Buttons not clickable | `pointer-events: none` on Spline wrapper; `pointer-events: all` on content |
| Hydration error (Next.js) | `dynamic(() => import(...), { ssr: false })` |
| Rotations look wrong | Use `Math.PI / 180 * degrees` |
| CORS error | Download `.splinecode` and self-host |

---
