import {
	genderItemsList,
	contractStatutItemsList,
	contractStatusColors,
	typeContratItemsList,
	deviseItemsList,
	confidentialiteItemsList,
} from './rawData';

describe('items lists', () => {
	describe('genderItemsList', () => {
		it('has two entries with correct codes and values', () => {
			expect(genderItemsList).toHaveLength(2);

			expect(genderItemsList[0]).toEqual({ code: 'H', value: 'Homme' });
			expect(genderItemsList[1]).toEqual({ code: 'F', value: 'Femme' });

			const codes = genderItemsList.map((i) => i.code);
			expect(codes).toEqual(['H', 'F']);

			const values = genderItemsList.map((i) => i.value);
			expect(values).toEqual(['Homme', 'Femme']);
		});

		it('contains unique codes', () => {
			const codes = genderItemsList.map((i) => i.code);
			const unique = Array.from(new Set(codes));
			expect(unique).toHaveLength(codes.length);
		});
	});

	describe('contractStatutItemsList', () => {
		it('has 7 statuses', () => {
			expect(contractStatutItemsList).toHaveLength(7);
		});

		it('starts with Brouillon', () => {
			expect(contractStatutItemsList[0]).toBe('Brouillon');
		});

		it('contains unique entries', () => {
			expect(new Set(contractStatutItemsList).size).toBe(contractStatutItemsList.length);
		});
	});

	describe('contractStatusColors', () => {
		it('maps every status in contractStatutItemsList', () => {
			for (const statut of contractStatutItemsList) {
				expect(contractStatusColors[statut]).toBeDefined();
			}
		});

		it('returns a valid MUI chip color for each entry', () => {
			const validColors = ['default', 'warning', 'success', 'error', 'info', 'primary', 'secondary'];
			for (const color of Object.values(contractStatusColors)) {
				expect(validColors).toContain(color);
			}
		});
	});

	describe('typeContratItemsList', () => {
		it('has 7 contract types', () => {
			expect(typeContratItemsList).toHaveLength(7);
		});

		it('each entry has code and value', () => {
			for (const item of typeContratItemsList) {
				expect(item).toHaveProperty('code');
				expect(item).toHaveProperty('value');
				expect(typeof item.code).toBe('string');
				expect(typeof item.value).toBe('string');
			}
		});

		it('contains unique codes', () => {
			const codes = typeContratItemsList.map((i) => i.code);
			expect(new Set(codes).size).toBe(codes.length);
		});
	});

	describe('deviseItemsList', () => {
		it('has 3 currencies', () => {
			expect(deviseItemsList).toEqual(['MAD', 'EUR', 'USD']);
		});
	});

	describe('confidentialiteItemsList', () => {
		it('has 3 confidentiality levels', () => {
			expect(confidentialiteItemsList).toEqual(['CONFIDENTIEL', 'USAGE INTERNE', 'STANDARD']);
		});
	});
});
