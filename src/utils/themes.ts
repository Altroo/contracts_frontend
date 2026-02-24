import { createTheme } from '@mui/material/styles';
import { hexToRGB } from './helpers';

export const CustomTheme = (primaryColor: string | undefined = undefined) => {
	let rippleColor = '#0D070B';
	if (primaryColor) {
		if (primaryColor !== '#FFFFFF') {
			rippleColor = hexToRGB(primaryColor, 0.5);
		} else {
			rippleColor = hexToRGB(rippleColor, 0.5);
		}
	}
	return createTheme({
		palette: {
			primary: {
				main: rippleColor,
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
		typography: {
			fontFamily: 'Poppins',
		},
	});
};

export const getDefaultTheme = (primaryColor: string | undefined = undefined) => {
	const defaultColor = '#0274D7';
	if (primaryColor) {
		return CustomTheme(primaryColor);
	} else {
		return CustomTheme(defaultColor);
	}
};

export const textInputTheme = (primaryColor: string | undefined = undefined) => {
	const defaultTheme = getDefaultTheme(primaryColor);
	const blueColor = '#0274d7';

	return createTheme({
		...defaultTheme,
		components: {
			MuiInputBase: {
				styleOverrides: {
					root: {
						'& fieldset': {
							borderRadius: '16px',
							border: '1px solid #A3A3AD',
						},
						'& fieldset > legend': {
							fontFamily: 'Poppins',
							fontSize: '14px',
						},
					},
					input: {
						fontFamily: 'Poppins',
						fontSize: '19px',
						caretColor: blueColor,
					},
				},
			},
			MuiFormControl: {
				styleOverrides: {
					root: {
						'& .MuiFormLabel-root': {
							fontFamily: 'Poppins',
							fontSize: '19px',
							color: '#A3A3AD',
						},
						'& .MuiFormLabel-root.Mui-focused': {
							fontFamily: 'Poppins',
							fontSize: '19px',
							color: blueColor,
						},
					},
				},
			},
		},
	});
};

export const navigationBarTheme = (primaryColor: string | undefined = undefined) => {
	const defaultTheme = getDefaultTheme(primaryColor);
	return createTheme({
		...defaultTheme,
		components: {
			MuiAppBar: {
				styleOverrides: {
					root: {
						backgroundColor: 'white',
						color: '#0D070B',
						boxShadow: '0px 0px 24px rgba(13, 7, 11, 0.2)',
					},
				},
			},
			MuiAccordionSummary: {
				styleOverrides: {
					content: {
						fontSize: '15px',
					},
				},
			},
			MuiListItemText: {
				styleOverrides: {
					primary: {
						fontSize: '15px',
					},
				},
			},
			MuiListItemButton: {
				styleOverrides: {
					root: {
						fontSize: '15px',
					},
				},
			},
		},
	});
};

export const customDropdownTheme = (primaryColor: string | undefined = undefined) => {
	const defaultTheme = getDefaultTheme(primaryColor);
	const blueColor = '#0274d7';

	return createTheme({
		...defaultTheme,
		components: {
			MuiInputBase: {
				styleOverrides: {
					root: {
						'& fieldset': {
							borderRadius: '16px',
							border: '1px solid #A3A3AD',
						},
						'& fieldset > legend': {
							fontFamily: 'Poppins',
							fontSize: '14px',
						},
					},
					input: {
						fontFamily: 'Poppins',
						fontSize: '19px',
						caretColor: blueColor,
					},
				},
			},
			MuiFormControl: {
				styleOverrides: {
					root: {
						'& .MuiFormLabel-root': {
							fontFamily: 'Poppins',
							fontSize: '16px',
							color: '#A3A3AD',
						},
						'& .MuiFormLabel-root.Mui-focused': {
							fontFamily: 'Poppins',
							fontSize: '19px',
							color: blueColor,
						},
					},
				},
			},
			MuiMenuItem: {
				styleOverrides: {
					gutters: {
						fontFamily: 'Poppins',
						fontSize: '16px',
						paddingTop: '10px',
						paddingBottom: '10px',
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: {
						border: `1px solid ${blueColor}`,
						borderBottomLeftRadius: '21px',
						borderBottomRightRadius: '21px',
					},
				},
			},
		},
	});
};
