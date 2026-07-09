import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

const replaceMock = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    replace: replaceMock,
    isReady: true,
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'admin', id: 1 },
  }),
}));

jest.mock('@/component/AdminReportCard', () => () => <div>Reports</div>);

jest.mock('@/services/api', () => ({
  ReportFetcherServices: {
    getThreeMostPopularVenuesAndTimings: jest.fn().mockRejectedValue(new Error('boom')),
    getThreeMostPopularApplicantsAndTheirSuccessRate: jest.fn().mockRejectedValue(new Error('boom')),
  },
}));

describe('Admin report page', () => {
  it('shows an error message when report loading fails', async () => {
    const { default: ReportPage } = await import('../pages/user/admin/report');

    render(<ReportPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load reports/i)).toBeInTheDocument();
    });
  });
});
