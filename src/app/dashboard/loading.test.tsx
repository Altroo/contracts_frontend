import {render, screen} from '@testing-library/react';
import DashboardLoading from './loading';

describe('DashboardLoading', () => {
  it('shows the app loader while the authenticated page resolves', () => {
    render(<DashboardLoading/>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
