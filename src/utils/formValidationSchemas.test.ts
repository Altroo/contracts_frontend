import {
	userSchema,
	profilSchema,
	changePasswordSchema,
	contractSchema,
} from './formValidationSchemas';

describe('Zod Schema Validation', () => {
	// ✅ userSchema
	describe('userSchema', () => {
		it('validates required fields', () => {
			expect(() =>
				userSchema.parse({
					first_name: 'Al',
					last_name: 'User',
					email: 'al@example.com',
					gender: 'H',
					is_staff: false,
					can_view: true,
					can_print: true,
					can_create: false,
					can_edit: false,
					can_delete: false,
				}),
			).not.toThrow();
		});
		it('fails with invalid email', () => {
			expect(() =>
				userSchema.parse({
					first_name: 'Al',
					last_name: 'User',
					email: 'invalid-email',
					gender: 'H',
					is_staff: false,
					can_view: true,
					can_print: true,
					can_create: false,
					can_edit: false,
					can_delete: false,
				}),
			).toThrow();
		});
		it('fails with missing first_name', () => {
			expect(() =>
				userSchema.parse({
					last_name: 'User',
					email: 'al@example.com',
					is_staff: false,
					can_view: true,
					can_print: true,
					can_create: false,
					can_edit: false,
					can_delete: false,
				}),
			).toThrow();
		});
		it('fails when passwords do not match', () => {
			const result = userSchema.safeParse({
				first_name: 'Al',
				last_name: 'User',
				email: 'al@example.com',
				is_staff: false,
				can_view: true,
				can_print: true,
				can_create: false,
				can_edit: false,
				can_delete: false,
				password1: 'securePass1',
				password2: 'differentPass',
			});
			expect(result.success).toBe(false);
		});
		it('passes when passwords match', () => {
			expect(() =>
				userSchema.parse({
					first_name: 'Al',
					last_name: 'User',
					email: 'al@example.com',
					is_staff: false,
					can_view: true,
					can_print: true,
					can_create: false,
					can_edit: false,
					can_delete: false,
					password1: 'securePass1',
					password2: 'securePass1',
				}),
			).not.toThrow();
		});
	});

	// ✅ profilSchema
	describe('profilSchema', () => {
		it('validates minimal profile', () => {
			expect(() => profilSchema.parse({ first_name: 'Al', last_name: 'User' })).not.toThrow();
		});
		it('fails with empty first name', () => {
			expect(() => profilSchema.parse({ first_name: '', last_name: 'User' })).toThrow();
		});
		it('fails with missing last name', () => {
			expect(() => profilSchema.parse({ first_name: 'Al' })).toThrow();
		});
	});

	// ✅ changePasswordSchema
	describe('changePasswordSchema', () => {
		it('validates all password fields', () => {
			expect(() =>
				changePasswordSchema.parse({
					old_password: 'oldPass123',
					new_password: 'newPass123',
					new_password2: 'newPass123',
				}),
			).not.toThrow();
		});
		it('fails with short old password', () => {
			expect(() =>
				changePasswordSchema.parse({
					old_password: 'short',
					new_password: 'newPass123',
					new_password2: 'newPass123',
				}),
			).toThrow();
		});
		it('fails with empty new password', () => {
			expect(() =>
				changePasswordSchema.parse({
					old_password: 'oldPass123',
					new_password: '',
					new_password2: '',
				}),
			).toThrow();
		});
		it('fails when new passwords do not match', () => {
			const result = changePasswordSchema.safeParse({
				old_password: 'oldPass123',
				new_password: 'newPass123',
				new_password2: 'differentPass',
			});
			expect(result.success).toBe(false);
		});
	});

	// ✅ contractSchema
	describe('contractSchema', () => {
		const validContract = {
			numero_contrat: 'CTR-001',
			date_contrat: '2024-01-01',
			statut: 'Brouillon',
			type_contrat: 'travaux_finition',
			ville_signature: 'Casablanca',
			client_nom: 'Jean Dupont',
			client_cin: 'AB123456',
			client_qualite: 'Propriétaire',
			client_adresse: '123 Rue Example',
			client_tel: '0600000000',
			client_email: 'jean@example.com',
			type_bien: 'Appartement',
			surface: '120',
			adresse_travaux: '456 Rue Travaux',
			date_debut: '2024-02-01',
			duree_estimee: '6 mois',
			description_travaux: 'Rénovation complète',
			montant_ht: '50000',
			devise: 'MAD',
			tva: '20',
			garantie: '12 mois',
			tribunal: 'Tribunal de Casablanca',
			responsable_projet: 'Ahmed',
			confidentialite: 'Confidentiel',
		};

		it('validates complete contract', () => {
			expect(() => contractSchema.parse(validContract)).not.toThrow();
		});
		it('fails with missing numero_contrat', () => {
			expect(() => contractSchema.parse({ ...validContract, numero_contrat: '' })).toThrow();
		});
		it('fails with missing client_nom', () => {
			expect(() => contractSchema.parse({ ...validContract, client_nom: '' })).toThrow();
		});
		it('fails with missing montant_ht', () => {
			expect(() => contractSchema.parse({ ...validContract, montant_ht: '' })).toThrow();
		});
	});
});
