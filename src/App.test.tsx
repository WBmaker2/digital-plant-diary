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

    await user.clear(screen.getByLabelText('관찰 날짜'));
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
