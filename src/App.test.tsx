import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the classroom plant diary heading', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: '초록 쑥쑥! 우리 반 식물 관찰 일기',
      }),
    ).toBeInTheDocument();
  });
});
