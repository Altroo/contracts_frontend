import React from 'react';
import type { Metadata, Viewport } from 'next';
import '@/styles/globals.sass';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import SessionProvider from '@/providers/sessionProvider';
import StoreProvider from '@/providers/storeProvider';
import type { AppProps } from 'next/app';
import { InitContextProvider } from '@/contexts/InitContext';
import { auth } from '@/auth';
import ThemeProvider from '@/providers/themeProvider';
import { InitEffects } from '@/contexts/initEffects';
import { ToastContextProvider } from '@/contexts/toastContext';
import { ErrorBoundary } from '@/components/shared/errorBoundary';
import SessionExpiredListener from '@/components/shared/sessionExpiredListener/sessionExpiredListener';

export const metadata: Metadata = {
	title: 'Contrats',
	applicationName: 'Contrats',
	robots: {
		index: false,
		follow: false,
	},
	icons: {
		icon: [{ url: '/assets/ico/favicon.ico', rel: 'shortcut icon' }],
	},
	other: {
		copyright: `Copyright - Contrats © ${new Date().getFullYear()}`,
		rating: 'general',
		expires: 'never',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1.0,
	themeColor: '#ffffff',
};

interface EntryPointProps extends AppProps {
	children: React.ReactNode;
}

const RootLayout: React.FC<EntryPointProps> = async (props) => {
	const session = await auth();
	return (
		<html lang="fr" data-scroll-behavior="smooth">
			<body>
				<a href="#main-content" className="skip-to-content">
					Aller au contenu principal
				</a>
				<SessionProvider session={session}>
					<StoreProvider>
						<InitContextProvider>
							<InitEffects />
							<AppRouterCacheProvider>
								<ThemeProvider>
									<ErrorBoundary>
										<ToastContextProvider>
											<SessionExpiredListener />
											<div id="main-content">{props.children}</div>
										</ToastContextProvider>
									</ErrorBoundary>
								</ThemeProvider>
							</AppRouterCacheProvider>
						</InitContextProvider>
					</StoreProvider>
				</SessionProvider>
			</body>
		</html>
	);
};

export default RootLayout;
