import {jest} from '@jest/globals';
import {renderToStaticMarkup} from 'react-dom/server';
import {type ReactElement, type ReactNode, createElement} from 'react';

type SessionUser = { pk: number; email: string };
type Session = { user: SessionUser } | null;

const mockAuth = jest.fn() as jest.MockedFunction<() => Promise<Session>>;
jest.mock('@/auth', () => ({
  __esModule: true,
  auth: mockAuth,
}));

jest.mock('@/styles/globals.sass', () => ({}));

jest.mock('@/components/shared/themeToggle/themeToggle', () => ({
  AuthThemeToggle: () => null,
}));

jest.mock('@/providers/sessionProvider', () => ({
  __esModule: true,
  default: (props: { session?: Session; children?: ReactNode }) => {
     
    const {createElement} = require('react');
    return createElement('div', null, `SESSION_PROVIDER:${JSON.stringify(props.session)}`, props.children);
  },
}));

jest.mock('@/providers/storeProvider', () => ({
  __esModule: true,
  default: (props: { children?: ReactNode }) => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'STORE_PROVIDER', props.children);
  },
}));

jest.mock('@/contexts/InitContext', () => ({
  __esModule: true,
  InitContextProvider: (props: { children?: ReactNode }) => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'INIT_CONTEXT', props.children);
  },
}));

jest.mock('@/contexts/initEffects', () => ({
  __esModule: true,
  InitEffects: () => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'INIT_EFFECTS');
  },
}));

jest.mock('@/contexts/toastContext', () => ({
  __esModule: true,
  ToastContextProvider: (props: { children?: ReactNode }) => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'TOAST_PROVIDER', props.children);
  },
}));

jest.mock('@/contexts/languageContext', () => ({
  __esModule: true,
  LanguageContextProvider: (props: { children?: ReactNode }) => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'LANGUAGE_PROVIDER', props.children);
  },
}));

jest.mock('@/utils/serverTranslations', () => ({
  __esModule: true,
  getServerTranslations: () => require('@/translations').translations.fr,
}));

jest.mock('@/components/shared/sessionExpiredListener/sessionExpiredListener', () => ({
  __esModule: true,
  default: () => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'SESSION_EXPIRED_LISTENER');
  },
}));
jest.mock('@/components/shared/maintenance/Maintenance', () => ({
  __esModule: true,
  default: () => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'MAINTENANCE_GATE');
  },
}));

jest.mock('@mui/material-nextjs/v16-appRouter', () => ({
  __esModule: true,
  AppRouterCacheProvider: (props: { children?: ReactNode }) => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'MUI_CACHE', props.children);
  },
}));

jest.mock('@/providers/themeProvider', () => ({
  __esModule: true,
  default: (props: { children?: ReactNode }) => {
     
    const {createElement} = require('react');
    return createElement('div', null, 'THEME_PROVIDER', props.children);
  },
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  cookies: jest.fn().mockImplementation(async () => ({
    get: jest.fn().mockReturnValue(undefined),
  })),
}));

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('RootLayout', () => {
  it('renders children wrapped with providers (session fetched client-side)', async () => {
    let RootLayout: (props: { children: ReactNode }) => unknown;
    jest.isolateModules(() => {
       
      const mod = require('./layout');
      RootLayout = mod.default;
    });

    const result = await (RootLayout!({children: createElement('div', null, 'CHILD_CONTENT')}) as Promise<unknown>);
    const html = renderToStaticMarkup(result as unknown as ReactElement);

    expect(html).toContain('SESSION_PROVIDER');
    expect(html).toContain('INIT_EFFECTS');
    expect(html).toContain('TOAST_PROVIDER');
    expect(html).toContain('CHILD_CONTENT');
    expect(html).toContain('data-theme="light"');
    // auth() is not called — session is fetched client-side by SessionProvider
    expect(mockAuth).not.toHaveBeenCalled();
  });
});
