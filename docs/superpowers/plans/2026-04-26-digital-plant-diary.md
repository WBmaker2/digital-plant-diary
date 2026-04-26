# Digital Plant Diary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3~4학년 과학 수업에서 한 달 이상 식물을 관찰하며 날짜, 사진, 키(cm), 관찰 내용을 저장하고 성장 그래프와 타임라인으로 확인하는 웹앱을 만든다.

**Architecture:** 빈 폴더에서 Vite + React + TypeScript 앱을 새로 구성한다. 관찰 기록은 `PlantObservation` 타입으로 통일하고, 순수 함수(`src/lib`)가 정렬, 저장, 그래프 데이터, 성장 요약을 담당하며, React 컴포넌트는 입력 폼, Chart.js 그래프, 포스트잇형 타임라인을 조합한다.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Chart.js, react-chartjs-2, Local Storage, CSS Modules 없이 단일 `src/App.css`.

---

## Current Context

- Workspace: `/Users/kimhongnyeon/Dev/codex/digital-plant-diary`
- Current state: empty directory, not a git repository.
- Product language: Korean UI, classroom-oriented copy.
- Primary user flow: 학생이 날짜, 식물 키(cm), 관찰 메모, 선택 사진을 입력한다. 앱은 기록을 Local Storage에 저장하고, 키 변화를 꺾은선 그래프로 보여 주며, 기록을 포스트잇형 카드 타임라인으로 쌓는다.

## File Structure

- Create: `package.json` - scripts and dependencies.
- Create: `index.html` - Vite entry shell.
- Create: `vite.config.ts` - Vite + React + Vitest config.
- Create: `tsconfig.json` - app TypeScript config with bundler module resolution.
- Create: `tsconfig.node.json` - Vite config TypeScript settings.
- Create: `.gitignore` - generated and local files.
- Create: `src/main.tsx` - React root.
- Create: `src/App.tsx` - app shell, state orchestration, local status messages.
- Create: `src/App.css` - full responsive visual system.
- Create: `src/setupTests.ts` - Testing Library setup.
- Create: `src/vite-env.d.ts` - Vite type reference.
- Create: `src/types/plantDiary.ts` - observation and form types.
- Create: `src/lib/observationStorage.ts` - Local Storage load/save/clear helpers and normalization.
- Create: `src/lib/observationStorage.test.ts` - persistence and normalization tests.
- Create: `src/lib/plantMetrics.ts` - chart data, growth summary, sorting helpers.
- Create: `src/lib/plantMetrics.test.ts` - graph and growth summary tests.
- Create: `src/components/ObservationForm.tsx` - date, height, memo, photo input form.
- Create: `src/components/GrowthChart.tsx` - Chart.js line chart plus accessible data summary.
- Create: `src/components/ObservationTimeline.tsx` - post-it style observation cards and delete controls.
- Create: `src/App.test.tsx` - end-to-end component behavior tests.
- Create: `README.md` - classroom purpose, local run commands, storage note.

---

### Task 1: Project Scaffold

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `src/setupTests.ts`
- Create: `src/vite-env.d.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Initialize git**

Run:

```bash
git init
git branch -M main
```

Expected: repository initialized on `main`.

- [ ] **Step 2: Add package manifest**

Create `package.json`:

```json
{
  "name": "digital-plant-diary",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "chart.js": "^4.4.9",
    "react": "^19.0.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "typescript": "^5.8.3",
    "vite": "^6.2.0",
    "vitest": "^3.1.1",
    "jsdom": "^26.0.0"
  }
}
```

- [ ] **Step 3: Add app and test configuration**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true
  }
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Add minimal React shell**

Create `index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>초록 쑥쑥! 우리 반 식물 관찰 일기</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>초록 쑥쑥! 우리 반 식물 관찰 일기</h1>
      <p>식물의 키와 관찰 내용을 기록하면 성장 그래프로 함께 살펴볼 수 있어요.</p>
    </main>
  );
}
```

Create `src/App.css`:

```css
:root {
  color: #173322;
  background: #f6f1df;
  font-family:
    Inter, Pretendard, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

Create `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 5: Add smoke test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the plant diary title', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: '초록 쑥쑥! 우리 반 식물 관찰 일기'
      })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Add gitignore**

Create `.gitignore`:

```gitignore
node_modules/
dist/
.DS_Store
.env
.env.*
coverage/
```

- [ ] **Step 7: Install and verify scaffold**

Run:

```bash
npm install
npm test
npm run build
```

Expected: dependency install completes, smoke test passes, production build succeeds.

- [ ] **Step 8: Commit scaffold**

Run:

```bash
git add .
git commit -m "chore: scaffold digital plant diary"
```

Expected: first commit created.

---

### Task 2: Observation Types and Local Storage

**Files:**
- Create: `src/types/plantDiary.ts`
- Create: `src/lib/observationStorage.ts`
- Create: `src/lib/observationStorage.test.ts`

- [ ] **Step 1: Write persistence tests**

Create `src/lib/observationStorage.test.ts`:

```ts
import {
  createObservation,
  loadObservations,
  saveObservations,
  clearObservations
} from './observationStorage';

describe('observationStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates an observation with a stable id and ISO createdAt value', () => {
    const observation = createObservation({
      date: '2026-04-26',
      heightCm: 12.5,
      note: '잎이 두 장 더 자랐어요.',
      photoDataUrl: 'data:image/png;base64,abc'
    });

    expect(observation.id).toMatch(/^plant-/);
    expect(observation.date).toBe('2026-04-26');
    expect(observation.heightCm).toBe(12.5);
    expect(observation.note).toBe('잎이 두 장 더 자랐어요.');
    expect(observation.photoDataUrl).toBe('data:image/png;base64,abc');
    expect(new Date(observation.createdAt).toString()).not.toBe('Invalid Date');
  });

  it('saves and loads observations sorted by date', () => {
    const later = createObservation({
      date: '2026-04-28',
      heightCm: 15,
      note: '줄기가 곧아졌어요.'
    });
    const earlier = createObservation({
      date: '2026-04-26',
      heightCm: 11,
      note: '떡잎이 보였어요.'
    });

    saveObservations([later, earlier]);

    expect(loadObservations().map((item) => item.date)).toEqual([
      '2026-04-26',
      '2026-04-28'
    ]);
  });

  it('returns an empty array when stored JSON is broken', () => {
    localStorage.setItem('digital-plant-diary:observations', '{broken json');

    expect(loadObservations()).toEqual([]);
  });

  it('clears saved observations', () => {
    saveObservations([
      createObservation({
        date: '2026-04-26',
        heightCm: 10,
        note: '처음 심었어요.'
      })
    ]);

    clearObservations();

    expect(loadObservations()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run failing persistence tests**

Run:

```bash
npm test -- src/lib/observationStorage.test.ts
```

Expected: FAIL because `observationStorage.ts` does not exist.

- [ ] **Step 3: Add shared types**

Create `src/types/plantDiary.ts`:

```ts
export interface PlantObservation {
  id: string;
  date: string;
  heightCm: number;
  note: string;
  photoDataUrl?: string;
  createdAt: string;
}

export interface ObservationDraft {
  date: string;
  heightCm: number;
  note: string;
  photoDataUrl?: string;
}
```

- [ ] **Step 4: Implement Local Storage helpers**

Create `src/lib/observationStorage.ts`:

```ts
import type { ObservationDraft, PlantObservation } from '../types/plantDiary';

export const OBSERVATION_STORAGE_KEY = 'digital-plant-diary:observations';

const isObservation = (value: unknown): value is PlantObservation => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as PlantObservation;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    Number.isFinite(candidate.heightCm) &&
    typeof candidate.note === 'string' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.photoDataUrl === undefined ||
      typeof candidate.photoDataUrl === 'string')
  );
};

export const sortObservations = (
  observations: PlantObservation[]
): PlantObservation[] =>
  [...observations].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare === 0 ? a.createdAt.localeCompare(b.createdAt) : dateCompare;
  });

export const createObservation = (
  draft: ObservationDraft,
  now = new Date()
): PlantObservation => ({
  id: `plant-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
  date: draft.date,
  heightCm: Math.max(0, Number(draft.heightCm)),
  note: draft.note.trim(),
  photoDataUrl: draft.photoDataUrl,
  createdAt: now.toISOString()
});

export const loadObservations = (): PlantObservation[] => {
  const raw = localStorage.getItem(OBSERVATION_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortObservations(parsed.filter(isObservation)) : [];
  } catch {
    return [];
  }
};

export const saveObservations = (observations: PlantObservation[]) => {
  localStorage.setItem(
    OBSERVATION_STORAGE_KEY,
    JSON.stringify(sortObservations(observations))
  );
};

export const clearObservations = () => {
  localStorage.removeItem(OBSERVATION_STORAGE_KEY);
};
```

- [ ] **Step 5: Verify persistence tests**

Run:

```bash
npm test -- src/lib/observationStorage.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit persistence layer**

Run:

```bash
git add src/types/plantDiary.ts src/lib/observationStorage.ts src/lib/observationStorage.test.ts
git commit -m "feat: add plant observation storage"
```

Expected: commit created.

---

### Task 3: Growth Metrics and Chart Data

**Files:**
- Create: `src/lib/plantMetrics.ts`
- Create: `src/lib/plantMetrics.test.ts`

- [ ] **Step 1: Write growth metric tests**

Create `src/lib/plantMetrics.test.ts`:

```ts
import type { PlantObservation } from '../types/plantDiary';
import {
  buildGrowthChartData,
  getGrowthSummary,
  getLatestObservation
} from './plantMetrics';

const observation = (
  date: string,
  heightCm: number,
  note = '관찰 기록'
): PlantObservation => ({
  id: `id-${date}`,
  date,
  heightCm,
  note,
  createdAt: `${date}T00:00:00.000Z`
});

describe('plantMetrics', () => {
  it('builds date labels and height values for Chart.js', () => {
    const data = buildGrowthChartData([
      observation('2026-04-28', 15),
      observation('2026-04-26', 10)
    ]);

    expect(data.labels).toEqual(['4/26', '4/28']);
    expect(data.values).toEqual([10, 15]);
  });

  it('finds the latest observation by date', () => {
    expect(
      getLatestObservation([
        observation('2026-04-26', 10),
        observation('2026-04-30', 18)
      ])?.heightCm
    ).toBe(18);
  });

  it('summarizes total growth and fastest interval', () => {
    const summary = getGrowthSummary([
      observation('2026-04-26', 8),
      observation('2026-04-28', 12),
      observation('2026-05-01', 13)
    ]);

    expect(summary.totalGrowthCm).toBe(5);
    expect(summary.fastestGrowth).toEqual({
      from: '2026-04-26',
      to: '2026-04-28',
      growthCm: 4
    });
  });

  it('returns zero summary when there are not enough observations', () => {
    expect(getGrowthSummary([observation('2026-04-26', 8)])).toEqual({
      totalGrowthCm: 0,
      fastestGrowth: null
    });
  });
});
```

- [ ] **Step 2: Run failing metric tests**

Run:

```bash
npm test -- src/lib/plantMetrics.test.ts
```

Expected: FAIL because `plantMetrics.ts` does not exist.

- [ ] **Step 3: Implement growth metric helpers**

Create `src/lib/plantMetrics.ts`:

```ts
import type { PlantObservation } from '../types/plantDiary';
import { sortObservations } from './observationStorage';

export interface GrowthChartData {
  labels: string[];
  values: number[];
}

export interface FastestGrowth {
  from: string;
  to: string;
  growthCm: number;
}

export interface GrowthSummary {
  totalGrowthCm: number;
  fastestGrowth: FastestGrowth | null;
}

const formatDateLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
};

export const buildGrowthChartData = (
  observations: PlantObservation[]
): GrowthChartData => {
  const sorted = sortObservations(observations);

  return {
    labels: sorted.map((item) => formatDateLabel(item.date)),
    values: sorted.map((item) => item.heightCm)
  };
};

export const getLatestObservation = (
  observations: PlantObservation[]
): PlantObservation | null => {
  const sorted = sortObservations(observations);
  return sorted.at(-1) ?? null;
};

export const getGrowthSummary = (
  observations: PlantObservation[]
): GrowthSummary => {
  const sorted = sortObservations(observations);

  if (sorted.length < 2) {
    return {
      totalGrowthCm: 0,
      fastestGrowth: null
    };
  }

  const totalGrowthCm = Number(
    (sorted.at(-1)!.heightCm - sorted[0].heightCm).toFixed(1)
  );

  const fastestGrowth = sorted.slice(1).reduce<FastestGrowth | null>(
    (best, current, index) => {
      const previous = sorted[index];
      const growthCm = Number((current.heightCm - previous.heightCm).toFixed(1));

      if (!best || growthCm > best.growthCm) {
        return {
          from: previous.date,
          to: current.date,
          growthCm
        };
      }

      return best;
    },
    null
  );

  return {
    totalGrowthCm,
    fastestGrowth
  };
};
```

- [ ] **Step 4: Verify metric tests**

Run:

```bash
npm test -- src/lib/plantMetrics.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit metric helpers**

Run:

```bash
git add src/lib/plantMetrics.ts src/lib/plantMetrics.test.ts
git commit -m "feat: add plant growth metrics"
```

Expected: commit created.

---

### Task 4: Observation Form

**Files:**
- Create: `src/components/ObservationForm.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Extend app test for adding an observation**

Replace `src/App.test.tsx` with:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a plant observation from the form', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키'));
    await user.type(screen.getByLabelText('식물의 키'), '12.5');
    await user.type(screen.getByLabelText('관찰 내용'), '잎이 두 장 더 자랐어요.');
    await user.click(screen.getByRole('button', { name: '기록 저장' }));

    const timeline = screen.getByLabelText('식물 관찰 타임라인');
    expect(within(timeline).getByText('12.5cm')).toBeInTheDocument();
    expect(within(timeline).getByText('잎이 두 장 더 자랐어요.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing app test**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because the app has no form yet.

- [ ] **Step 3: Implement form component**

Create `src/components/ObservationForm.tsx`:

```tsx
import { FormEvent, useMemo, useState } from 'react';
import type { ObservationDraft } from '../types/plantDiary';

interface ObservationFormProps {
  onSubmit: (draft: ObservationDraft) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function ObservationForm({ onSubmit }: ObservationFormProps) {
  const [date, setDate] = useState(today);
  const [heightCm, setHeightCm] = useState('5');
  const [note, setNote] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [photoName, setPhotoName] = useState('');

  const canSubmit = useMemo(
    () => date.length > 0 && Number(heightCm) >= 0 && note.trim().length > 0,
    [date, heightCm, note]
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit({
      date,
      heightCm: Number(heightCm),
      note,
      photoDataUrl
    });

    setNote('');
    setPhotoDataUrl(undefined);
    setPhotoName('');
  };

  return (
    <form className="observation-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>관찰 날짜</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>
        <label>
          <span>식물의 키</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={heightCm}
            onChange={(event) => setHeightCm(event.target.value)}
            required
          />
        </label>
      </div>
      <label>
        <span>관찰 내용</span>
        <textarea
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="잎, 줄기, 색깔, 흙의 상태를 자세히 적어 보세요."
          required
        />
      </label>
      <label className="photo-picker">
        <span>사진 추가</span>
        <input
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0];

            if (!file) {
              setPhotoDataUrl(undefined);
              setPhotoName('');
              return;
            }

            setPhotoDataUrl(await readFileAsDataUrl(file));
            setPhotoName(file.name);
          }}
        />
        <small>{photoName || '사진은 선택 사항입니다.'}</small>
      </label>
      <button type="submit" disabled={!canSubmit}>
        기록 저장
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Integrate form in App**

Replace `src/App.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import ObservationForm from './components/ObservationForm';
import {
  createObservation,
  loadObservations,
  saveObservations
} from './lib/observationStorage';
import type { ObservationDraft, PlantObservation } from './types/plantDiary';

export default function App() {
  const [observations, setObservations] = useState<PlantObservation[]>(() =>
    loadObservations()
  );

  useEffect(() => {
    saveObservations(observations);
  }, [observations]);

  const addObservation = (draft: ObservationDraft) => {
    setObservations((current) => [...current, createObservation(draft)]);
  };

  return (
    <main className="app-shell">
      <header className="app-hero">
        <p className="eyebrow">3~4학년 과학 · 식물의 한살이</p>
        <h1>초록 쑥쑥! 우리 반 식물 관찰 일기</h1>
        <p>
          날짜, 키, 관찰 내용을 차곡차곡 기록하며 식물이 언제 크게 자라는지
          그래프로 확인해요.
        </p>
      </header>

      <section className="workspace" aria-label="식물 관찰 입력과 기록">
        <ObservationForm onSubmit={addObservation} />
        <section aria-label="식물 관찰 타임라인">
          {observations.map((item) => (
            <article className="note-card" key={item.id}>
              <time dateTime={item.date}>{item.date}</time>
              <strong>{item.heightCm}cm</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Verify app test**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit observation form**

Run:

```bash
git add src/App.tsx src/App.test.tsx src/components/ObservationForm.tsx
git commit -m "feat: add plant observation form"
```

Expected: commit created.

---

### Task 5: Growth Chart

**Files:**
- Create: `src/components/GrowthChart.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Mock chart rendering in app tests**

Add this mock near the top of `src/App.test.tsx`, after imports:

```tsx
vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="growth-line-chart">{data.labels.join(',')}</div>
  )
}));
```

- [ ] **Step 2: Extend app test for chart update**

Add this test to `src/App.test.tsx`:

```tsx
it('updates the growth chart after saving observations', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
  await user.clear(screen.getByLabelText('식물의 키'));
  await user.type(screen.getByLabelText('식물의 키'), '8');
  await user.type(screen.getByLabelText('관찰 내용'), '처음 싹이 보였어요.');
  await user.click(screen.getByRole('button', { name: '기록 저장' }));

  expect(screen.getByTestId('growth-line-chart')).toHaveTextContent('4/26');
  expect(screen.getByText('지금까지 0cm 자랐어요.')).toBeInTheDocument();
});
```

- [ ] **Step 3: Run failing chart test**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `GrowthChart` is not rendered yet.

- [ ] **Step 4: Implement GrowthChart component**

Create `src/components/GrowthChart.tsx`:

```tsx
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { buildGrowthChartData, getGrowthSummary } from '../lib/plantMetrics';
import type { PlantObservation } from '../types/plantDiary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface GrowthChartProps {
  observations: PlantObservation[];
}

export default function GrowthChart({ observations }: GrowthChartProps) {
  const chartData = buildGrowthChartData(observations);
  const summary = getGrowthSummary(observations);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: '식물의 키(cm)',
        data: chartData.values,
        borderColor: '#287a46',
        backgroundColor: 'rgba(66, 170, 104, 0.18)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#f4c542',
        pointBorderColor: '#17452a',
        pointRadius: 5
      }
    ]
  };

  return (
    <section className="growth-panel" aria-label="식물 성장 그래프">
      <div className="section-heading">
        <p className="eyebrow">키(cm) 데이터</p>
        <h2>성장 그래프</h2>
      </div>
      {observations.length === 0 ? (
        <p className="empty-copy">첫 기록을 저장하면 그래프가 나타나요.</p>
      ) : (
        <>
          <div className="chart-frame">
            <Line
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y}cm`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: '키(cm)'
                    }
                  }
                }
              }}
            />
          </div>
          <p className="growth-summary">
            지금까지 {summary.totalGrowthCm}cm 자랐어요.
          </p>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Render chart in App**

Update `src/App.tsx` imports:

```tsx
import GrowthChart from './components/GrowthChart';
```

Render the chart between header and workspace:

```tsx
<GrowthChart observations={observations} />
```

- [ ] **Step 6: Verify chart behavior**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit chart**

Run:

```bash
git add src/App.tsx src/App.test.tsx src/components/GrowthChart.tsx
git commit -m "feat: show plant growth chart"
```

Expected: commit created.

---

### Task 6: Timeline Cards, Deletion, and Status Feedback

**Files:**
- Create: `src/components/ObservationTimeline.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Extend tests for deletion and spoken status**

Add this test to `src/App.test.tsx`:

```tsx
it('deletes an observation and announces the change', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
  await user.clear(screen.getByLabelText('식물의 키'));
  await user.type(screen.getByLabelText('식물의 키'), '9');
  await user.type(screen.getByLabelText('관찰 내용'), '줄기가 조금 휘어졌어요.');
  await user.click(screen.getByRole('button', { name: '기록 저장' }));
  await user.click(screen.getByRole('button', { name: '2026-04-26 기록 삭제' }));

  expect(screen.queryByText('줄기가 조금 휘어졌어요.')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('관찰 기록을 삭제했어요.');
});
```

- [ ] **Step 2: Run failing deletion test**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because delete controls and status are not implemented.

- [ ] **Step 3: Implement timeline component**

Create `src/components/ObservationTimeline.tsx`:

```tsx
import type { PlantObservation } from '../types/plantDiary';

interface ObservationTimelineProps {
  observations: PlantObservation[];
  onDelete: (id: string) => void;
}

export default function ObservationTimeline({
  observations,
  onDelete
}: ObservationTimelineProps) {
  return (
    <section className="timeline-panel" aria-label="식물 관찰 타임라인">
      <div className="section-heading">
        <p className="eyebrow">관찰 카드</p>
        <h2>차곡차곡 쌓이는 성장 기록</h2>
      </div>
      {observations.length === 0 ? (
        <p className="empty-copy">오늘의 관찰을 저장하면 포스트잇 카드가 생겨요.</p>
      ) : (
        <div className="timeline-list">
          {observations.map((item) => (
            <article className="note-card" key={item.id}>
              {item.photoDataUrl && (
                <img src={item.photoDataUrl} alt={`${item.date} 식물 사진`} />
              )}
              <div className="note-card-body">
                <time dateTime={item.date}>{item.date}</time>
                <strong>{item.heightCm}cm</strong>
                <p>{item.note}</p>
              </div>
              <button type="button" onClick={() => onDelete(item.id)}>
                {item.date} 기록 삭제
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Integrate timeline and status in App**

Update `src/App.tsx` imports:

```tsx
import ObservationTimeline from './components/ObservationTimeline';
```

Add status state inside `App`:

```tsx
const [statusMessage, setStatusMessage] = useState('');
```

Update add handler:

```tsx
const addObservation = (draft: ObservationDraft) => {
  setObservations((current) => [...current, createObservation(draft)]);
  setStatusMessage('관찰 기록을 저장했어요.');
};
```

Add delete handler:

```tsx
const deleteObservation = (id: string) => {
  setObservations((current) => current.filter((item) => item.id !== id));
  setStatusMessage('관찰 기록을 삭제했어요.');
};
```

Replace the inline timeline section with:

```tsx
<ObservationTimeline observations={observations} onDelete={deleteObservation} />
<p className="sr-only" role="status" aria-live="polite">
  {statusMessage}
</p>
```

- [ ] **Step 5: Verify timeline behavior**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit timeline**

Run:

```bash
git add src/App.tsx src/App.test.tsx src/components/ObservationTimeline.tsx
git commit -m "feat: add plant observation timeline"
```

Expected: commit created.

---

### Task 7: Classroom Visual Design and Responsive Layout

**Files:**
- Modify: `src/App.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add accessibility test for main regions**

Add this test to `src/App.test.tsx`:

```tsx
it('exposes the main classroom regions with accessible names', () => {
  render(<App />);

  expect(screen.getByLabelText('식물 성장 그래프')).toBeInTheDocument();
  expect(screen.getByLabelText('식물 관찰 입력과 기록')).toBeInTheDocument();
  expect(screen.getByLabelText('식물 관찰 타임라인')).toBeInTheDocument();
});
```

- [ ] **Step 2: Replace stylesheet with finished visual system**

Replace `src/App.css` with:

```css
:root {
  color: #183225;
  background: #f7f0dc;
  font-family:
    Inter, Pretendard, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
textarea {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
  padding: 28px;
  background:
    linear-gradient(90deg, rgba(30, 97, 60, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(30, 97, 60, 0.07) 1px, transparent 1px),
    #f7f0dc;
  background-size: 32px 32px;
}

.app-hero,
.growth-panel,
.workspace {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.app-hero {
  display: grid;
  gap: 12px;
  padding: 30px 0 24px;
}

.eyebrow {
  margin: 0;
  color: #287a46;
  font-size: 0.85rem;
  font-weight: 800;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  max-width: 760px;
  margin-bottom: 0;
  color: #143322;
  font-size: clamp(2.2rem, 6vw, 4.6rem);
  line-height: 1.02;
  letter-spacing: 0;
}

h2 {
  margin-bottom: 0;
  font-size: 1.35rem;
}

.app-hero > p:last-child {
  max-width: 620px;
  margin-bottom: 0;
  color: #526252;
  font-size: 1.05rem;
  line-height: 1.7;
}

.growth-panel,
.observation-form,
.timeline-panel {
  border: 2px solid #244d36;
  border-radius: 8px;
  background: rgba(255, 252, 239, 0.92);
  box-shadow: 8px 8px 0 #2f6c47;
}

.growth-panel {
  display: grid;
  gap: 18px;
  padding: 24px;
}

.section-heading {
  display: grid;
  gap: 4px;
}

.chart-frame {
  height: 280px;
}

.growth-summary,
.empty-copy {
  margin-bottom: 0;
  color: #526252;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(280px, 380px) 1fr;
  gap: 26px;
  padding: 34px 0;
  align-items: start;
}

.observation-form,
.timeline-panel {
  padding: 22px;
}

.observation-form {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  display: grid;
  gap: 8px;
  color: #274233;
  font-weight: 800;
}

input,
textarea {
  width: 100%;
  border: 2px solid #bfd2b9;
  border-radius: 8px;
  background: #fffdf4;
  color: #183225;
  padding: 12px;
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus,
button:focus-visible {
  outline: 3px solid #f4c542;
  outline-offset: 2px;
}

.photo-picker small {
  color: #687461;
  font-weight: 600;
}

.observation-form button,
.note-card button {
  min-height: 44px;
  border-radius: 8px;
  background: #287a46;
  color: white;
  font-weight: 900;
}

.observation-form button:disabled {
  cursor: not-allowed;
  background: #aab8a2;
}

.timeline-panel {
  display: grid;
  gap: 18px;
}

.timeline-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.note-card {
  display: grid;
  gap: 12px;
  min-height: 220px;
  padding: 16px;
  border-radius: 6px;
  background: #fff2a8;
  box-shadow: 0 10px 18px rgba(44, 64, 32, 0.16);
  transform: rotate(-1deg);
}

.note-card:nth-child(2n) {
  background: #dff2b8;
  transform: rotate(1deg);
}

.note-card:nth-child(3n) {
  background: #ffd6bd;
}

.note-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 6px;
  object-fit: cover;
}

.note-card-body {
  display: grid;
  gap: 6px;
}

.note-card time {
  color: #58704d;
  font-weight: 800;
}

.note-card strong {
  font-size: 1.8rem;
}

.note-card p {
  margin-bottom: 0;
  line-height: 1.55;
}

.note-card button {
  align-self: end;
  background: #6f5035;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .app-shell {
    padding: 18px;
  }

  .workspace,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .growth-panel,
  .observation-form,
  .timeline-panel {
    box-shadow: 5px 5px 0 #2f6c47;
  }

  .chart-frame {
    height: 230px;
  }
}
```

- [ ] **Step 3: Verify tests and build**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 4: Commit visual design**

Run:

```bash
git add src/App.css src/App.test.tsx
git commit -m "style: polish classroom plant diary interface"
```

Expected: commit created.

---

### Task 8: Documentation and Browser Verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Add README**

Create `README.md`:

```md
# 초록 쑥쑥! 우리 반 식물 관찰 일기

3~4학년 과학 수업에서 식물의 한살이 과정을 장기 관찰할 때 쓰는 웹앱입니다.
학생은 날짜, 식물의 키(cm), 관찰 내용, 선택 사진을 저장하고, 누적 기록을
꺾은선 그래프와 포스트잇형 타임라인으로 확인할 수 있습니다.

## 수업 맥락

- 대상: 3~4학년군 과학
- 성취기준: [4과03-01] 여러 가지 식물의 한살이 과정을 관찰하고, 식물의 자람에 따라 나타나는 변화를 설명할 수 있다.
- 저장 방식: 브라우저 Local Storage

## 실행

```bash
npm install
npm run dev
```

## 확인

```bash
npm test
npm run build
```
```

- [ ] **Step 2: Run full local verification**

Run:

```bash
npm test
npm run build
npm run dev
```

Expected: tests pass, build succeeds, dev server prints a local URL.

- [ ] **Step 3: Browser-check primary workflow**

Open the local URL and verify:

```text
1. Desktop viewport: title, graph area, form, timeline area are visible without overlap.
2. Save one observation: timeline card appears and chart updates.
3. Save a second observation with a later date and larger height: line chart slope changes and growth summary updates.
4. Delete one observation: the card disappears and the chart updates.
5. Mobile viewport around 390x844: form, graph, and cards remain readable without horizontal scrolling.
```

Expected: all five checks pass.

- [ ] **Step 4: Commit docs**

Run:

```bash
git add README.md
git commit -m "docs: describe digital plant diary"
```

Expected: commit created.

---

## Acceptance Criteria

- The app is usable as the first screen, without a marketing landing page.
- Students can save date, height(cm), memo, and optional photo.
- Saved observations persist after reload via Local Storage.
- The graph automatically reflects saved height data in chronological order.
- Observation cards appear as a classroom-friendly post-it style timeline.
- Users can delete a mistaken observation.
- Korean UI copy reflects 3~4학년 과학 and 식물의 한살이 context.
- `role="status"` announces save/delete changes for assistive technology.
- `npm test` and `npm run build` pass.
- Browser verification confirms desktop and mobile layouts.

## Out of Scope for First Build

- Multi-student login or teacher dashboard.
- Cloud synchronization.
- Export to PDF or spreadsheet.
- AI-generated observation feedback.
- GitHub Pages deployment and Hong's Vibe Coding Lab registration. These can be planned after the local app is approved.

## Recommended Implementation Order

1. Scaffold baseline.
2. Add typed observation storage.
3. Add growth metric utilities.
4. Build form and persistence flow.
5. Add Chart.js graph.
6. Add timeline cards and delete/status behavior.
7. Polish classroom visual design.
8. Verify, document, and prepare for a separate publish plan if requested.
