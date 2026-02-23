import { jest } from '@jest/globals';

const mockRedirect = jest.fn(() => {
	throw new Error('redirect');
});

jest.mock('next/navigation', () => ({
	__esModule: true,
	redirect: mockRedirect,
}));

const CONTRACTS_LIST = '/dashboard/contracts';
jest.mock('@/utils/routes', () => ({
	__esModule: true,
	CONTRACTS_LIST,
}));

afterEach(() => {
	jest.resetModules();
	jest.clearAllMocks();
});

describe('DashboardPage server component', () => {
	it('redirects to CONTRACTS_LIST immediately', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require('./page');
		const Page = mod.default as () => unknown;

		expect(() => Page()).toThrow('redirect');
		expect(mockRedirect).toHaveBeenCalledWith(CONTRACTS_LIST);
	});
});
