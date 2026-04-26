import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { OBSERVATION_STORAGE_KEY } from './lib/observationStorage';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds a plant observation from the form', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('식물의 키(cm)'), '12.5');
    await user.type(screen.getByLabelText('관찰 내용'), '잎이 두 장 더 자랐어요.');
    await user.click(screen.getByRole('button', { name: '기록 저장' }));

    const timeline = screen.getByLabelText('식물 관찰 타임라인');
    expect(within(timeline).getByText('12.5cm')).toBeInTheDocument();
    expect(within(timeline).getByText('잎이 두 장 더 자랐어요.')).toBeInTheDocument();
  });

  it('does not rewrite invalid stored data on first render', () => {
    const invalidStoredValue = '{"futureVersion":2,';
    localStorage.setItem(OBSERVATION_STORAGE_KEY, invalidStoredValue);

    render(<App />);

    expect(localStorage.getItem(OBSERVATION_STORAGE_KEY)).toBe(invalidStoredValue);
  });

  it('does not submit an observation with an empty height', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('관찰 내용'), '잎 색이 연해졌어요.');

    const saveButton = screen.getByRole('button', { name: '기록 저장' });
    expect(saveButton).toBeDisabled();
    await user.click(saveButton);

    const timeline = screen.getByLabelText('식물 관찰 타임라인');
    expect(within(timeline).queryByText('잎 색이 연해졌어요.')).not.toBeInTheDocument();
  });

  it('ignores a stale photo read after submitting the form', async () => {
    const readers: Array<{
      result: string | ArrayBuffer | null;
      error: DOMException | null;
      onload: FileReader['onload'];
      onerror: FileReader['onerror'];
      readAsDataURL: ReturnType<typeof vi.fn>;
    }> = [];

    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      error: DOMException | null = null;
      onload: FileReader['onload'] = null;
      onerror: FileReader['onerror'] = null;
      readAsDataURL = vi.fn();
    }

    vi.stubGlobal(
      'FileReader',
      vi.fn(() => {
        const reader = new MockFileReader();
        readers.push(reader);
        return reader;
      })
    );

    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('식물의 키(cm)'), '12.5');
    await user.type(screen.getByLabelText('관찰 내용'), '첫 번째 기록이에요.');
    await user.upload(
      screen.getByLabelText(/사진 추가/),
      new File(['old photo'], 'old-photo.png', { type: 'image/png' })
    );

    expect(screen.getByText('old-photo.png')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '기록 저장' }));
    expect(screen.getByText('사진은 선택 사항입니다.')).toBeInTheDocument();

    readers[0].result = 'data:image/png;base64,stale';
    readers[0].onload?.call(
      readers[0] as unknown as FileReader,
      new ProgressEvent('load') as ProgressEvent<FileReader>
    );

    await waitFor(() => {
      expect(screen.getByText('사진은 선택 사항입니다.')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('관찰 내용'), '두 번째 기록이에요.');
    await user.click(screen.getByRole('button', { name: '기록 저장' }));

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(OBSERVATION_STORAGE_KEY) ?? '[]'
      ) as Array<{ note: string; photoDataUrl?: string }>;
      const secondObservation = stored.find(
        (observation) => observation.note === '두 번째 기록이에요.'
      );

      expect(secondObservation?.photoDataUrl).toBeUndefined();
    });
  });
});
