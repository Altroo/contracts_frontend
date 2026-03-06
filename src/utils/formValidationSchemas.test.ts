import {
	loginSchema,
	emailSchema,
	passwordResetConfirmationSchema,
	passwordResetCodeSchema,
	userSchema,
	profilSchema,
	changePasswordSchema,
	contractSchema,
} from './formValidationSchemas';

describe('Zod Schema Validation', () => {
	// ── loginSchema ──
	describe('loginSchema', () => {
		it('validates correct credentials', () => {
			expect(() =>
				loginSchema.parse({ email: 'user@example.com', password: 'securePass1' }),
			).not.toThrow();
		});
		it('fails with invalid email', () => {
			expect(() =>
				loginSchema.parse({ email: 'bad-email', password: 'securePass1' }),
			).toThrow();
		});
		it('fails with short password', () => {
			expect(() =>
				loginSchema.parse({ email: 'user@example.com', password: 'short' }),
			).toThrow();
		});
		it('fails with missing email', () => {
			expect(() => loginSchema.parse({ password: 'securePass1' })).toThrow();
		});
		it('fails with empty password', () => {
			expect(() =>
				loginSchema.parse({ email: 'user@example.com', password: '' }),
			).toThrow();
		});
		it('handles undefined password via preprocess', () => {
			expect(() =>
				loginSchema.parse({ email: 'user@example.com', password: undefined }),
			).toThrow();
		});
		it('accepts optional globalError', () => {
			expect(() =>
				loginSchema.parse({ email: 'user@example.com', password: 'securePass1', globalError: 'some error' }),
			).not.toThrow();
		});
	});

	// ── emailSchema ──
	describe('emailSchema', () => {
		it('validates correct email', () => {
			expect(() => emailSchema.parse({ email: 'user@example.com' })).not.toThrow();
		});
		it('fails with invalid email', () => {
			expect(() => emailSchema.parse({ email: 'not-an-email' })).toThrow();
		});
		it('fails with missing email', () => {
			expect(() => emailSchema.parse({})).toThrow();
		});
	});

	// ── passwordResetConfirmationSchema ──
	describe('passwordResetConfirmationSchema', () => {
		it('validates matching passwords', () => {
			expect(() =>
				passwordResetConfirmationSchema.parse({ new_password: 'newPass123', new_password2: 'newPass123' }),
			).not.toThrow();
		});
		it('fails with short password', () => {
			expect(() =>
				passwordResetConfirmationSchema.parse({ new_password: 'short', new_password2: 'short' }),
			).toThrow();
		});
		it('handles undefined via preprocess', () => {
			expect(() =>
				passwordResetConfirmationSchema.parse({ new_password: undefined, new_password2: undefined }),
			).toThrow();
		});
	});

	// ── passwordResetCodeSchema ──
	describe('passwordResetCodeSchema', () => {
		it('validates 6 single digits', () => {
			expect(() =>
				passwordResetCodeSchema.parse({ one: '1', two: '2', three: '3', four: '4', five: '5', six: '6' }),
			).not.toThrow();
		});
		it('fails with non-digit character', () => {
			expect(() =>
				passwordResetCodeSchema.parse({ one: 'a', two: '2', three: '3', four: '4', five: '5', six: '6' }),
			).toThrow();
		});
		it('fails with empty string', () => {
			expect(() =>
				passwordResetCodeSchema.parse({ one: '', two: '2', three: '3', four: '4', five: '5', six: '6' }),
			).toThrow();
		});
		it('fails with multi-digit string', () => {
			expect(() =>
				passwordResetCodeSchema.parse({ one: '12', two: '2', three: '3', four: '4', five: '5', six: '6' }),
			).toThrow();
		});
	});

	// ── userSchema ──
	describe('userSchema', () => {
		const validUser = {
			first_name: 'Al',
			last_name: 'User',
			email: 'al@example.com',
			gender: 'H',
			is_active: true,
			is_staff: false,
			can_view: true,
			can_print: true,
			can_create: false,
			can_edit: false,
			can_delete: false,
		};

		it('validates required fields', () => {
			expect(() => userSchema.parse(validUser)).not.toThrow();
		});
		it('fails with invalid email', () => {
			expect(() => userSchema.parse({ ...validUser, email: 'invalid-email' })).toThrow();
		});
		it('fails with missing first_name', () => {
			expect(() => userSchema.parse({ ...validUser, first_name: undefined })).toThrow();
		});
		it('fails with empty first_name', () => {
			expect(() => userSchema.parse({ ...validUser, first_name: '' })).toThrow();
		});
		it('fails with missing last_name', () => {
			expect(() => userSchema.parse({ ...validUser, last_name: undefined })).toThrow();
		});
		it('fails with short first_name (min 2)', () => {
			expect(() => userSchema.parse({ ...validUser, first_name: 'A' })).toThrow();
		});
		it('fails with missing gender', () => {
			expect(() => userSchema.parse({ ...validUser, gender: undefined })).toThrow();
		});
		it('handles undefined first_name via preprocess (becomes empty → fails)', () => {
			const result = userSchema.safeParse({ ...validUser, first_name: undefined });
			expect(result.success).toBe(false);
		});
		it('accepts optional avatar fields', () => {
			expect(() =>
				userSchema.parse({ ...validUser, avatar: null, avatar_cropped: null }),
			).not.toThrow();
		});
		it('accepts base64 image avatar', () => {
			expect(() =>
				userSchema.parse({ ...validUser, avatar: 'data:image/png;base64,abc', avatar_cropped: 'data:image/png;base64,def' }),
			).not.toThrow();
		});
	});

	// ── profilSchema ──
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
		it('accepts optional gender', () => {
			expect(() =>
				profilSchema.parse({ first_name: 'Al', last_name: 'User', gender: 'H' }),
			).not.toThrow();
		});
		it('handles undefined gender via preprocess', () => {
			expect(() =>
				profilSchema.parse({ first_name: 'Al', last_name: 'User', gender: undefined }),
			).not.toThrow();
		});
		it('handles empty gender via preprocess', () => {
			expect(() =>
				profilSchema.parse({ first_name: 'Al', last_name: 'User', gender: '' }),
			).not.toThrow();
		});
		it('accepts null avatar fields', () => {
			expect(() =>
				profilSchema.parse({ first_name: 'Al', last_name: 'User', avatar: null, avatar_cropped: null }),
			).not.toThrow();
		});
	});

	// ── changePasswordSchema ──
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

	// ── contractSchema ──
	describe('contractSchema', () => {
		const validContract = {
			company: 'casa_di_lusso',
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

		// Undefined handling (the preprocess helpers)
		it('handles undefined optional fields via preprocess', () => {
			const minimalContract = {
				company: 'casa_di_lusso',
				numero_contrat: 'CTR-001',
				date_contrat: '2024-01-01',
				client_nom: 'Jean Dupont',
				montant_ht: '50000',
				type_contrat: 'travaux_finition',
			};
			expect(() => contractSchema.parse(minimalContract)).not.toThrow();
		});
		it('handles all optional fields as undefined', () => {
			const result = contractSchema.safeParse({
				company: 'casa_di_lusso',
				numero_contrat: 'CTR-001',
				date_contrat: '2024-01-01',
				client_nom: 'Jean',
				montant_ht: '100',
				type_contrat: 'travaux_finition',
				statut: undefined,
				ville_signature: undefined,
				client_cin: undefined,
				client_qualite: undefined,
				client_adresse: undefined,
				client_tel: undefined,
				client_email: undefined,
				type_bien: undefined,
				surface: undefined,
				adresse_travaux: undefined,
				date_debut: undefined,
				duree_estimee: undefined,
				description_travaux: undefined,
				devise: undefined,
				tva: undefined,
				garantie: undefined,
				tribunal: undefined,
				responsable_projet: undefined,
				confidentialite: undefined,
			});
			expect(result.success).toBe(true);
		});
		it('handles null optional fields via preprocess', () => {
			const result = contractSchema.safeParse({
				company: 'casa_di_lusso',
				numero_contrat: 'CTR-001',
				date_contrat: '2024-01-01',
				client_nom: 'Jean',
				montant_ht: '100',
				type_contrat: 'travaux_finition',
				statut: null,
				devise: null,
				confidentialite: null,
			});
			expect(result.success).toBe(true);
		});
		it('handles empty string optional choice fields via preprocess', () => {
			const result = contractSchema.safeParse({
				company: 'casa_di_lusso',
				numero_contrat: 'CTR-001',
				date_contrat: '2024-01-01',
				client_nom: 'Jean',
				montant_ht: '100',
				type_contrat: 'travaux_finition',
				statut: '',
				devise: '',
				confidentialite: '',
			});
			expect(result.success).toBe(true);
		});
		it('fails when required field is undefined (preprocess converts to empty)', () => {
			const result = contractSchema.safeParse({
				company: 'casa_di_lusso',
				numero_contrat: undefined,
				client_nom: 'Jean',
				montant_ht: '100',
			});
			expect(result.success).toBe(false);
		});
	});

	// ── contractSchema (Sous-Traitance) ──
	describe('contractSchema – Sous-Traitance category', () => {
		const validSTContract = {
			company: 'casa_di_lusso',
			contract_category: 'sous_traitance',
			numero_contrat: 'CTR-ST-001',
			date_contrat: '2024-06-01',
			client_nom: 'Client ST',
			montant_ht: '75000',
			st_name: 'Sub Corp SARL',
			st_lot_type: 'gros_oeuvre',
			st_type_prix: 'forfaitaire',
		};

		it('validates a complete sous-traitance contract', () => {
			expect(() => contractSchema.parse(validSTContract)).not.toThrow();
		});

		it('fails when st_name is missing for sous-traitance', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_name: '',
			});
			expect(result.success).toBe(false);
		});

		it('fails when st_lot_type is missing for sous-traitance', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_lot_type: '',
			});
			expect(result.success).toBe(false);
		});

		it('fails when st_type_prix is missing for sous-traitance', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_type_prix: '',
			});
			expect(result.success).toBe(false);
		});

		it('does NOT require type_contrat for sous-traitance', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				type_contrat: undefined,
			});
			expect(result.success).toBe(true);
		});

		it('accepts optional ST numeric fields', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_retenue_garantie: '10',
				st_avance: '15',
				st_penalite_taux: '2',
				st_plafond_penalite: '10',
				st_delai_paiement: '30',
				st_delai_val: '3',
				st_garantie_mois: '12',
				st_delai_reserves: '30',
				st_delai_med: '60',
			});
			expect(result.success).toBe(true);
		});

		it('accepts ST tranches array', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_tranches: [
					{ label: 'Acompte', pourcentage: 30 },
					{ label: 'Intermédiaire', pourcentage: 40 },
					{ label: 'Solde', pourcentage: 30 },
				],
			});
			expect(result.success).toBe(true);
		});

		it('accepts ST clauses actives array', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_clauses_actives: ['tConfid', 'tNonConc'],
			});
			expect(result.success).toBe(true);
		});

		it('accepts optional ST text fields', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_forme: 'SARL',
				st_capital: '100000',
				st_rc: 'RC-12345',
				st_ice: '001234567890123',
				st_if: 'IF12345',
				st_cnss: 'CNSS-789',
				st_addr: '45 Rue des Ateliers, Casablanca',
				st_rep: 'Mohammed El Amrani',
				st_cin: 'BE654321',
				st_qualite: 'Gérant',
				st_tel: '0600000000',
				st_email: 'sub@example.com',
				st_rib: 'MA76 XXXX XXXX XXXX',
				st_banque: 'Banque Populaire',
				st_lot_description: 'Lot de gros oeuvre principal',
				st_observations: 'Observations de test',
				st_delai_unit: 'mois',
			});
			expect(result.success).toBe(true);
		});

		it('handles undefined for all optional ST fields', () => {
			const result = contractSchema.safeParse({
				...validSTContract,
				st_forme: undefined,
				st_capital: undefined,
				st_rc: undefined,
				st_ice: undefined,
				st_if: undefined,
				st_cnss: undefined,
				st_addr: undefined,
				st_rep: undefined,
				st_cin: undefined,
				st_qualite: undefined,
				st_tel: undefined,
				st_email: undefined,
				st_rib: undefined,
				st_banque: undefined,
				st_lot_description: undefined,
				st_observations: undefined,
				st_delai_unit: undefined,
				st_retenue_garantie: undefined,
				st_avance: undefined,
				st_penalite_taux: undefined,
				st_plafond_penalite: undefined,
				st_delai_paiement: undefined,
				st_delai_val: undefined,
				st_garantie_mois: undefined,
				st_delai_reserves: undefined,
				st_delai_med: undefined,
			});
			expect(result.success).toBe(true);
		});

		it('standard CDL still requires type_contrat', () => {
			const result = contractSchema.safeParse({
				company: 'casa_di_lusso',
				contract_category: 'standard',
				numero_contrat: 'CTR-CDL-001',
				date_contrat: '2024-01-01',
				client_nom: 'Jean',
				montant_ht: '100',
				type_contrat: undefined,
			});
			expect(result.success).toBe(false);
		});

		it('contract_category is optional (defaults to standard behavior)', () => {
			const result = contractSchema.safeParse({
				company: 'casa_di_lusso',
				numero_contrat: 'CTR-001',
				date_contrat: '2024-01-01',
				client_nom: 'Jean',
				montant_ht: '100',
				type_contrat: 'travaux_finition',
			});
			expect(result.success).toBe(true);
		});
	});
});
