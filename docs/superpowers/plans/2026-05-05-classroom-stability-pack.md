# Classroom Stability Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the published plant diary safer for real classroom use by stabilizing tests, adding JSON backup/restore, guarding photo storage size, and documenting teacher workflows.

**Architecture:** Keep the app client-only and preserve the existing Local Storage model. Put pure validation/import/export logic in `src/lib/observationStorage.ts`, keep UI state in `src/App.tsx`, keep photo-reading safeguards inside `src/components/ObservationForm.tsx`, and document classroom use in `README.md`.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Chart.js, browser Local Storage.

---

## File Structure

- Modify `src/setupTests.ts`: ensure Vitest always uses a complete Storage-like `localStorage`, even on newer Node versions with experimental Web Storage.
- Modify `src/lib/observationStorage.ts`: add observation backup serialization/import parsing and export the observation type guard/normalizer needed by import.
- Modify `src/lib/observationStorage.test.ts`: cover backup export/import happy paths and invalid import paths.
- Modify `src/App.tsx`: add backup/restore UI state and handlers.
- Modify `src/App.test.tsx`: cover export download, import replace, and invalid import messaging.
- Modify `src/components/ObservationForm.tsx`: reject photo files over a fixed size before reading.
- Modify `src/App.css`: style the backup controls and file-size helper text.
- Modify `README.md`: add teacher workflow, data backup guidance, and photo-size guidance.
- Modify `package.json`: add a portable `verify` script that runs tests then build.

---

### Task 1: Stabilize Test Environment

**Files:**
- Modify: `src/setupTests.ts`
- Modify: `package.json`

- [x] **Step 1: Add a failing environment regression test by running current tests on Node 25**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH npm test
```

Expected before fix: FAIL with `localStorage.clear is not a function`.

- [x] **Step 2: Patch `src/setupTests.ts` with a memory-backed Storage shim**

Replace the file with:

```ts
import '@testing-library/jest-dom/vitest';

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, String(value))
  };
};

const installLocalStorageShim = () => {
  if (
    typeof globalThis.localStorage !== 'undefined' &&
    typeof globalThis.localStorage.clear === 'function' &&
    typeof globalThis.localStorage.getItem === 'function'
  ) {
    return;
  }

  const storage = createMemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage
  });

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage
    });
  }
};

installLocalStorageShim();
```

- [x] **Step 3: Add a verify script**

Update `package.json` scripts to include:

```json
"verify": "npm test && npm run build"
```

- [x] **Step 4: Verify tests and build**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH npm test
PATH=/opt/homebrew/bin:$PATH npm run build
```

Expected: all 23 tests pass and Vite build succeeds.

- [x] **Step 5: Commit**

```bash
git add src/setupTests.ts package.json package-lock.json
git commit -m "test: stabilize local storage in vitest"
```

---

### Task 2: Add JSON Backup and Restore

**Files:**
- Modify: `src/lib/observationStorage.ts`
- Modify: `src/lib/observationStorage.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/App.css`

- [x] **Step 1: Write storage import/export tests**

Add tests to `src/lib/observationStorage.test.ts`:

```ts
it('exports observations with a version and sorted observations', () => {
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

  const parsed = JSON.parse(exportObservationBackup([later, earlier])) as {
    version: number;
    observations: Array<{ date: string }>;
  };

  expect(parsed.version).toBe(1);
  expect(parsed.observations.map((item) => item.date)).toEqual([
    '2026-04-26',
    '2026-04-28'
  ]);
});

it('imports observations from a backup payload', () => {
  const observation = createObservation({
    date: '2026-04-26',
    heightCm: 8,
    note: '처음 싹이 보였어요.'
  });

  const imported = parseObservationBackup(
    JSON.stringify({ version: 1, observations: [observation] })
  );

  expect(imported).toEqual([observation]);
});

it('rejects invalid backup payloads', () => {
  expect(() => parseObservationBackup('{"version":2,"observations":[]}')).toThrow(
    '지원하지 않는 백업 파일입니다.'
  );
  expect(() => parseObservationBackup('not json')).toThrow(
    '백업 파일을 읽지 못했어요.'
  );
});
```

- [x] **Step 2: Implement pure backup helpers**

Add exports in `src/lib/observationStorage.ts`:

```ts
export const OBSERVATION_BACKUP_VERSION = 1;

export const exportObservationBackup = (
  observations: PlantObservation[],
  exportedAt = new Date()
): string =>
  JSON.stringify(
    {
      version: OBSERVATION_BACKUP_VERSION,
      exportedAt: exportedAt.toISOString(),
      observations: sortObservations(observations)
    },
    null,
    2
  );

export const parseObservationBackup = (raw: string): PlantObservation[] => {
  try {
    const parsed = JSON.parse(raw) as {
      version?: unknown;
      observations?: unknown;
    };

    if (parsed.version !== OBSERVATION_BACKUP_VERSION) {
      throw new Error('unsupported version');
    }

    if (!Array.isArray(parsed.observations)) {
      throw new Error('missing observations');
    }

    return sortObservations(parsed.observations.filter(isObservation));
  } catch (error) {
    if (error instanceof Error && error.message === 'unsupported version') {
      throw new Error('지원하지 않는 백업 파일입니다.');
    }

    throw new Error('백업 파일을 읽지 못했어요.');
  }
};
```

- [x] **Step 3: Write app-level backup/restore tests**

Add tests to `src/App.test.tsx` that:
- create one observation
- click `백업 저장`
- assert `URL.createObjectURL` and an anchor click were called
- upload a JSON backup through `백업 불러오기`
- assert the imported card appears and the status says `백업 기록을 불러왔어요.`
- upload invalid JSON and assert `백업 파일을 읽지 못했어요.`

- [x] **Step 4: Implement backup controls in `src/App.tsx`**

Add:
- `handleExportBackup()`
- `handleImportBackup(event: ChangeEvent<HTMLInputElement>)`
- a `<section className="backup-panel" aria-label="관찰 기록 백업">`
- buttons/inputs with accessible names `백업 저장`, `백업 불러오기`

- [x] **Step 5: Style backup controls in `src/App.css`**

Add a compact bordered panel that matches `.observation-form` and keeps controls from overflowing on mobile.

- [x] **Step 6: Verify**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH npm test
PATH=/opt/homebrew/bin:$PATH npm run build
```

Expected: all tests pass and build succeeds.

- [x] **Step 7: Commit**

```bash
git add src/lib/observationStorage.ts src/lib/observationStorage.test.ts src/App.tsx src/App.test.tsx src/App.css
git commit -m "feat: add observation backup restore"
```

---

### Task 3: Guard Photo Storage Size

**Files:**
- Modify: `src/components/ObservationForm.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/App.css`

- [x] **Step 1: Add a failing photo-size test**

Add an app test that uploads a 2 MB image file and expects:
- `사진은 1MB 이하로 추가해 주세요.`
- `FileReader` not called
- the save button remains usable after the file is rejected if date/height/note are valid

- [x] **Step 2: Implement the file-size guard**

Add:

```ts
const MAX_PHOTO_BYTES = 1_000_000;
```

In `handlePhotoChange`, before reading:

```ts
if (file.size > MAX_PHOTO_BYTES) {
  setPhotoDataUrl(undefined);
  setPhotoName('');
  setPhotoError('사진은 1MB 이하로 추가해 주세요.');
  event.target.value = '';
  return;
}
```

- [x] **Step 3: Add helper copy**

Update the file picker helper fallback to:

```ts
photoError || photoName || '사진은 선택 사항이며 1MB 이하를 권장합니다.'
```

- [x] **Step 4: Verify**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH npm test
PATH=/opt/homebrew/bin:$PATH npm run build
```

Expected: all tests pass and build succeeds.

- [x] **Step 5: Commit**

```bash
git add src/components/ObservationForm.tsx src/App.test.tsx src/App.css
git commit -m "fix: guard oversized observation photos"
```

---

### Task 4: Document Teacher Workflow

**Files:**
- Modify: `README.md`

- [x] **Step 1: Add classroom operation guidance**

Add sections:

```markdown
## 수업 사용 흐름

1. 학생이 날짜, 식물의 키, 관찰 내용을 기록합니다.
2. 매주 같은 요일에 기록하면 성장 그래프를 비교하기 쉽습니다.
3. 단원 마무리에는 그래프가 크게 꺾이는 시점과 그때의 관찰 메모를 함께 읽습니다.

## 데이터 백업

- 기록은 브라우저 Local Storage에 저장됩니다.
- 같은 기기와 같은 브라우저에서 이어서 사용할 수 있습니다.
- 장기 활동 전후에는 `백업 저장`으로 JSON 파일을 내려받아 보관하고, 필요하면 `백업 불러오기`로 복원합니다.

## 사진 사용 안내

- 사진은 선택 사항입니다.
- Local Storage 용량을 아끼기 위해 1MB 이하 사진을 권장합니다.
- 학급 공용 기기에서는 학생 개인정보가 포함된 사진을 피합니다.
```

- [x] **Step 2: Verify README stays concise**

Run:

```bash
sed -n '1,220p' README.md
```

Expected: public URL, subject/grade context, run commands, backup guidance are present.

- [x] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add classroom operation guidance"
```

---

### Task 5: Final Verification

**Files:**
- No planned source changes.

- [x] **Step 1: Run full verification**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH npm run verify
git status --short --branch
```

Expected:
- all tests pass
- build succeeds
- branch has only intentional commits

- [x] **Step 2: Optional browser check**

Run the dev server:

```bash
PATH=/opt/homebrew/bin:$PATH npm run dev -- --host 127.0.0.1
```

Open the app and confirm:
- backup panel is visible
- adding an observation still updates the graph
- exporting creates a JSON file
- importing restores a card
- oversized photo shows the 1MB warning

- [x] **Step 3: Summarize**

Report:
- branch name
- commits created
- verification commands and results
- remaining deployment choice: push/deploy now or review first

---

## Self-Review

- Spec coverage: Node/test stability, JSON backup/restore, photo storage guard, teacher docs, and final verification are covered.
- Placeholder scan: No placeholder markers or undefined future work remain.
- Type consistency: All new helpers use existing `PlantObservation` and `ObservationDraft` shapes.
