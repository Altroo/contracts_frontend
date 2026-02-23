'use client';

import { type ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useIsClient } from '@/utils/hooks';

type MediaQueryProps = {
	children: ReactNode;
};

export const Desktop = ({ children }: MediaQueryProps) => {
	const theme = useTheme();
	const isClient = useIsClient();
	const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
	if (!isClient) return null;
	return isDesktop ? <>{children}</> : null;
};

export const TabletAndMobile = ({ children }: MediaQueryProps) => {
	const theme = useTheme();
	const isClient = useIsClient();
	const isTabletMobile = useMediaQuery(theme.breakpoints.down('md'));
	if (!isClient) return null;
	return isTabletMobile ? <>{children}</> : null;
};
