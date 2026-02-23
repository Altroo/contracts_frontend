import { jest } from '@jest/globals';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

jest.mock('@/components/pages/auth/reset-password/enterCode', () => ({
	__esModule: true,
	default: () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const React = require('react');
		return React.createElement('div', null, 'ENTER_CODE_CLIENT_MARKER');
	},
}));

afterEach(() => {
	jest.resetModules();
	jest.clearAllMocks();
});

describe('EnterCodePage', () => {
	it('renders EnterCodeClient', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require('./page');
		const Page = mod.default as () => unknown;
		const html = renderToStaticMarkup(Page() as React.ReactElement);
		expect(html).toContain('ENTER_CODE_CLIENT_MARKER');
	});
});
