import { jest } from '@jest/globals';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

jest.mock('@/components/pages/users/users-view', () => ({
	__esModule: true,
	default: (props: { id?: number }) => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const React = require('react');
		return React.createElement('div', null, `USERS_VIEW_CLIENT_MARKER:ID=${props?.id ?? ''}`);
	},
}));

afterEach(() => {
	jest.resetModules();
	jest.clearAllMocks();
});

describe('UserDetailPage', () => {
	it('renders UsersViewClient with numeric id from params', async () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require('./page');
		const Page = mod.default as (props: { params: Promise<{ id: string }> }) => Promise<unknown>;

		const result = await Page({ params: Promise.resolve({ id: '5' }) });
		const html = renderToStaticMarkup(result as React.ReactElement);
		expect(html).toContain('USERS_VIEW_CLIENT_MARKER:ID=5');
	});
});
