import React from 'react';
import { render } from '@testing-library/react';

const replaceMock = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    replace: replaceMock,
    isReady: true,
    query: { id: '1' },
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'vendor', id: 1 },
  }),
}));

jest.mock('@/services/api', () => ({
  UserFetcherServices: {
    getAllVendors: jest.fn().mockResolvedValue([]),
  },
  VenueFetcherServices: {
    updateVenue: jest.fn(),
  },
}));

describe('Venue edit page access control', () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  it('redirects non-admin users to the 404 page', async () => {
    const { default: VenuePage } = await import('../pages/venues/[id]/index');

    render(<VenuePage />);

    expect(replaceMock).toHaveBeenCalledWith('/404');
  });
});
