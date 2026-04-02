import {jest} from '@jest/globals';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';

jest.mock('@/components/pages/auth/reset-password/resetPassword', () => ({
  __esModule: true,
  default: () => {
     
    const React = require('react');
    return React.createElement('div', null, 'RESET_PASSWORD_CLIENT_MARKER');
  },
}));

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('ResetPasswordPage', () => {
  it('renders ResetPasswordClient', () => {
     
    const mod = require('./page');
    const Page = mod.default as () => unknown;
    const html = renderToStaticMarkup(Page() as React.ReactElement);
    expect(html).toContain('RESET_PASSWORD_CLIENT_MARKER');
  });
});
