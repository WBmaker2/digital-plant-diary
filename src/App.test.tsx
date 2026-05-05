import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import { OBSERVATION_STORAGE_KEY } from './lib/observationStorage';

vi.mock('react-chartjs-2', () => ({
  Line: ({
    'aria-label': ariaLabel,
    data,
    role
  }: {
    'aria-label': string;
    data: { labels: string[]; datasets: Array<{ data: number[] }> };
    role: string;
  }) => (
    <div
      aria-label={ariaLabel}
      data-testid="growth-line-chart"
      data-values={data.datasets[0].data.join(',')}
      role={role}
    >
      {data.labels.join(',')}
    </div>
  )
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes the main classroom regions with accessible names', () => {
    render(<App />);

    expect(
      screen.getByRole('region', { name: '식물 성장 그래프' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: '식물 관찰 입력과 기록' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: '식물 관찰 타임라인' })
    ).toBeInTheDocument();
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

  it('updates the growth chart after saving observations', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-28');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('식물의 키(cm)'), '12.5');
    await user.type(screen.getByLabelText('관찰 내용'), '줄기가 더 길어졌어요.');
    await user.click(screen.getByRole('button', { name: '기록 저장' }));

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('식물의 키(cm)'), '8');
    await user.type(screen.getByLabelText('관찰 내용'), '처음 싹이 보였어요.');
    await user.click(screen.getByRole('button', { name: '기록 저장' }));

    const chart = screen.getByTestId('growth-line-chart');
    expect(
      screen.getByRole('img', { name: '식물 키 성장 선 그래프' })
    ).toBeInTheDocument();
    expect(chart).toHaveTextContent('4/26,4/28');
    expect(chart).toHaveAttribute('data-values', '8,12.5');
    expect(screen.getByText('4/26: 8cm')).toBeInTheDocument();
    expect(screen.getByText('4/28: 12.5cm')).toBeInTheDocument();
    expect(screen.getByText('지금까지 4.5cm 자랐어요.')).toBeInTheDocument();
  });

  it('deletes an observation and announces the change', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('식물의 키(cm)'), '9');
    await user.type(screen.getByLabelText('관찰 내용'), '줄기가 조금 휘어졌어요.');
    await user.click(screen.getByRole('button', { name: '기록 저장' }));
    await user.click(
      screen.getByRole('button', {
        name: '2026-04-26 9cm 기록 삭제: 줄기가 조금 휘어졌어요.'
      })
    );

    expect(screen.queryByText('줄기가 조금 휘어졌어요.')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('관찰 기록을 삭제했어요.');
    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(OBSERVATION_STORAGE_KEY) ?? '[]'
      ) as Array<{ note: string }>;

      expect(
        stored.some((observation) => observation.note === '줄기가 조금 휘어졌어요.')
      ).toBe(false);
    });
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
    expect(
      screen.getByText('사진은 선택 사항이며 1MB 이하를 권장합니다.')
    ).toBeInTheDocument();

    readers[0].result = 'data:image/png;base64,stale';
    readers[0].onload?.call(
      readers[0] as unknown as FileReader,
      new ProgressEvent('load') as ProgressEvent<FileReader>
    );

    await waitFor(() => {
      expect(
        screen.getByText('사진은 선택 사항이며 1MB 이하를 권장합니다.')
      ).toBeInTheDocument();
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

  it('rejects oversized observation photos before reading them', async () => {
    const fileReader = vi.fn();
    vi.stubGlobal('FileReader', fileReader);

    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('식물의 키(cm)'), '12.5');
    await user.type(screen.getByLabelText('관찰 내용'), '사진 없이 저장할 기록이에요.');
    await user.upload(
      screen.getByLabelText(/사진 추가/),
      new File([new Uint8Array(1_000_001)], 'large-photo.png', {
        type: 'image/png'
      })
    );

    expect(screen.getByText('사진은 1MB 이하로 추가해 주세요.')).toBeInTheDocument();
    expect(fileReader).not.toHaveBeenCalled();

    const saveButton = screen.getByRole('button', { name: '기록 저장' });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(screen.getByText('사진 없이 저장할 기록이에요.')).toBeInTheDocument();
  });

  it('downloads a JSON backup of saved observations', async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi.fn(() => 'blob:plant-diary-backup');
    const revokeObjectUrl = vi.fn();
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl
    });

    render(<App />);

    await user.clear(screen.getByLabelText('관찰 날짜'));
    await user.type(screen.getByLabelText('관찰 날짜'), '2026-04-26');
    await user.clear(screen.getByLabelText('식물의 키(cm)'));
    await user.type(screen.getByLabelText('식물의 키(cm)'), '8');
    await user.type(screen.getByLabelText('관찰 내용'), '처음 싹이 보였어요.');
    await user.click(screen.getByRole('button', { name: '기록 저장' }));
    await user.click(screen.getByRole('button', { name: '백업 저장' }));

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorClick).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:plant-diary-backup');
    expect(screen.getByRole('status')).toHaveTextContent('백업 파일을 저장했어요.');
  });

  it('imports observations from a JSON backup file', async () => {
    const user = userEvent.setup();
    const backup = {
      version: 1,
      exportedAt: '2026-04-26T00:00:00.000Z',
      observations: [
        {
          id: 'plant-imported',
          date: '2026-04-26',
          heightCm: 8,
          note: '백업에서 돌아온 기록이에요.',
          createdAt: '2026-04-26T00:00:00.000Z'
        }
      ]
    };

    render(<App />);

    await user.upload(
      screen.getByLabelText('백업 불러오기'),
      new File([JSON.stringify(backup)], 'plant-backup.json', {
        type: 'application/json'
      })
    );

    await waitFor(() => {
      const timeline = screen.getByLabelText('식물 관찰 타임라인');
      expect(
        within(timeline).getByText('백업에서 돌아온 기록이에요.')
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(
        '백업 기록을 불러왔어요.'
      );
    });

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(OBSERVATION_STORAGE_KEY) ?? '[]'
      ) as Array<{ note: string }>;

      expect(stored).toEqual([
        expect.objectContaining({ note: '백업에서 돌아온 기록이에요.' })
      ]);
    });
  });

  it('announces an invalid JSON backup file', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.upload(
      screen.getByLabelText('백업 불러오기'),
      new File(['not json'], 'broken.json', { type: 'application/json' })
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      '백업 파일을 읽지 못했어요.'
    );
  });
});
