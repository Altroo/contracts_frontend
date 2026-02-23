import { createTheme } from '@mui/material/styles';
import { hexToRGB } from './helpers';

export const getDefaultTheme = () =>
	createTheme({
		palette: {
			primary: {
				main: '#0D070B',
			},
			success: {
				main: 'rgb(129, 199, 132)',
			},
			error: {
				main: 'rgb(229, 115, 115)',
			},
		},
		breakpoints: {
			values: {
				xs: 0,
				sm: 600,
				md: 992,
				lg: 1200,
				xl: 1536,
			},
		},
	});

export const navigationBarTheme = (_primaryColor: string | undefined = undefined) =>
	createTheme({
		palette: {
			primary: {
				main: '#1a1a2e',
			},
		},
	});

export const CustomTheme = (primaryColor: string | undefined = undefined) => {
	let rippleColor = '#0D070B';
	if (primaryColor) {
		if (primaryColor !== '#FFFFFF') {
			rippleColor = hexToRGB(primaryColor, 0.5);
		} else {
			rippleColor = hexToRGB(rippleColor, 0.5);
		}
	}
	return getDefaultTheme();
};
