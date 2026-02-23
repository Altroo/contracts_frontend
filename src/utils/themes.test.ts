import { getDefaultTheme, navigationBarTheme, CustomTheme } from './themes';

describe('getDefaultTheme', () => {
	it('returns a MUI theme object', () => {
		const theme = getDefaultTheme();
		expect(theme).toBeDefined();
		expect(typeof theme.palette).toBe('object');
	});

	it('sets primary colour to #0D070B', () => {
		const theme = getDefaultTheme();
		expect(theme.palette.primary.main).toBe('#0D070B');
	});

	it('sets custom breakpoint md to 992', () => {
		const theme = getDefaultTheme();
		expect(theme.breakpoints.values.md).toBe(992);
	});
});

describe('navigationBarTheme', () => {
	it('returns a MUI theme object', () => {
		const theme = navigationBarTheme();
		expect(theme).toBeDefined();
		expect(typeof theme.palette).toBe('object');
	});

	it('sets primary colour to #1a1a2e', () => {
		const theme = navigationBarTheme();
		expect(theme.palette.primary.main).toBe('#1a1a2e');
	});

	it('accepts an optional primary colour without throwing', () => {
		expect(() => navigationBarTheme('#ff0000')).not.toThrow();
	});
});

describe('CustomTheme', () => {
	it('returns a MUI theme object', () => {
		const theme = CustomTheme();
		expect(theme).toBeDefined();
		expect(typeof theme.palette).toBe('object');
	});

	it('returns a theme when given a hex primary colour', () => {
		const theme = CustomTheme('#3a86ff');
		expect(theme).toBeDefined();
	});

	it('returns a theme when given white (#FFFFFF)', () => {
		const theme = CustomTheme('#FFFFFF');
		expect(theme).toBeDefined();
	});

	it('returns a theme with no primary colour argument', () => {
		const theme = CustomTheme(undefined);
		expect(theme).toBeDefined();
	});
});
