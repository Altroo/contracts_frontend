import { jest } from '@jest/globals';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

jest.mock('@/components/pages/contracts/contract-form', () => ({
	__esModule: true,
	default: (props: { id?: number }) => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const React = require('react');
		return React.createElement('div', null, `CONTRACT_FORM_CLIENT_MARKER:ID=${props?.id ?? ''}`);
	},
}));

afterEach(() => {
	jest.resetModules();
	jest.clearAllMocks();
});

describe('ContractEditPage', () => {
	it('renders ContractFormClient with numeric id from params', async () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require('./page');
		const Page = mod.default as (props: { params: Promise<{ id: string }> }) => Promise<unknown>;

		const result = await Page({ params: Promise.resolve({ id: '7' }) });
		const html = renderToStaticMarkup(result as React.ReactElement);
		expect(html).toContain('CONTRACT_FORM_CLIENT_MARKER:ID=7');
	});
});
