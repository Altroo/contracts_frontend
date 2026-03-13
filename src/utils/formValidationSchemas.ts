import { z } from 'zod';
import {
	INPUT_REQUIRED,
	INPUT_PASSWORD_MIN,
	INPUT_MIN,
	INPUT_MAX,
	INPUT_PHONE,
	MINI_INPUT_EMAIL,
	SHORT_INPUT_REQUIRED,
	TVA_INPUT_INVALID,
} from '@/utils/formValidationErrorMessages';


const base64ImageField = z.url().or(z.string().startsWith('data:image/')).nullable().optional();

const passwordField = z.preprocess(
	(val) => (val === undefined ? '' : val),
	z
		.string()
		.min(8, { error: INPUT_PASSWORD_MIN(8) })
		.nonempty({ error: INPUT_REQUIRED }),
);

const optionalEmailField = z.preprocess(
	(val) => (val === undefined || val === null || val === '' ? undefined : val),
	z.email({ error: MINI_INPUT_EMAIL }).optional(),
);

const optionalPhoneField = z.preprocess(
	(val) => (val === undefined || val === null || val === '' ? undefined : val),
	z
		.string()
		.regex(/^\+?\d{7,15}$/, { error: INPUT_PHONE })
		.optional(),
);

const requiredTextField = (min: number, max: number) =>
	z.preprocess(
		(val) => (val === undefined ? '' : val),
		z
			.string()
			.min(min, { error: INPUT_MIN(min) })
			.max(max, { error: INPUT_MAX(max) })
			.nonempty({ error: INPUT_REQUIRED }),
	);

const requiredChoiceTextField = () =>
	z.preprocess((val) => (val === undefined ? '' : val), z.string().nonempty({ error: INPUT_REQUIRED }));

const optionalChoiceField = () =>
	z.preprocess((val) => (val === undefined || val === null || val === '' ? undefined : val), z.string().optional());

const optionalTextField = (min: number, max: number) =>
	z.preprocess(
		(val) => (val === undefined || val === null || val === '' ? undefined : val),
		z
			.string()
			.min(min, { error: INPUT_MIN(min) })
			.max(max, { error: INPUT_MAX(max) })
			.optional(),
	);

const requiredNumberField = (min: number = 1, max?: number) =>
	z.preprocess(
		(val) => (val === undefined || val === null || val === '' ? NaN : Number(val)),
		z
			.number({ error: INPUT_REQUIRED })
			.refine((val) => !Number.isNaN(val), { error: INPUT_REQUIRED })
			.min(min, { error: INPUT_MIN(min) })
			.max(max ?? Number.MAX_SAFE_INTEGER, { error: INPUT_MAX(max ?? Number.MAX_SAFE_INTEGER) }),
	);

const optionalNumberField = (min: number = 1, max?: number) =>
	z.preprocess(
		(val) => (val === undefined || val === null || val === '' ? undefined : Number(val)),
		z
			.number()
			.refine((val) => !Number.isNaN(val), { error: INPUT_REQUIRED })
			.min(min, { error: INPUT_MIN(min) })
			.max(max ?? Number.MAX_SAFE_INTEGER, { error: INPUT_MAX(max ?? Number.MAX_SAFE_INTEGER) })
			.optional(),
	);

const optionalTVANumberField = (min: number = 0, max?: number) =>
	z.preprocess(
		(val) => {
			if (val === '') return undefined;
			if (val === undefined) return undefined;
			if (val === null) return null;
			return Number(val);
		},
		z
			.number({ message: TVA_INPUT_INVALID })
			.refine((val) => Number.isFinite(val), { message: TVA_INPUT_INVALID })
			.min(min, { message: TVA_INPUT_INVALID })
			.max(max ?? Number.MAX_SAFE_INTEGER, { message: TVA_INPUT_INVALID })
			.optional()
			.nullable(),
	);

const trancheLabelField = z.preprocess(
	(val) => (val === undefined ? '' : val),
	z.string().min(1, { error: INPUT_REQUIRED }),
);

const tranchePourcentageField = z.preprocess(
	(val) => (val === undefined || val === null || val === '' ? NaN : Number(val)),
	z
		.number({ error: INPUT_REQUIRED })
		.refine((value) => !Number.isNaN(value), { error: INPUT_REQUIRED })
		.refine((value) => value > 0, { error: INPUT_REQUIRED })
		.max(100, { error: INPUT_MAX(100) }),
);

const singleDigit = z
	.string()
	.min(1, { error: SHORT_INPUT_REQUIRED })
	.regex(/^\d$/, { error: SHORT_INPUT_REQUIRED })
	.transform((val) => Number(val));

const ECHEANCIER_TOTAL_ERROR = 'Le total des pourcentages de l\'échéancier doit être égal à 100%.';

const hasValidEcheancierTotal = (tranches?: Array<{ pourcentage: number }>) => {
	const total = (tranches ?? []).reduce((sum, tranche) => sum + tranche.pourcentage, 0);
	return Math.abs(total - 100) < 0.001;
};

export const loginSchema = z.object({
	email: z.email({ error: MINI_INPUT_EMAIL }),
	password: passwordField,
	globalError: optionalTextField(1, 500),
});

export const emailSchema = z.object({
	email: z.email({ error: MINI_INPUT_EMAIL }),
	globalError: optionalTextField(1, 500),
});

export const passwordResetConfirmationSchema = z.object({
	new_password: passwordField,
	new_password2: passwordField,
	globalError: optionalTextField(1, 500),
});

export const passwordResetCodeSchema = z.object({
	one: singleDigit,
	two: singleDigit,
	three: singleDigit,
	four: singleDigit,
	five: singleDigit,
	six: singleDigit,
	globalError: optionalTextField(1, 500),
});

export const userSchema = z.object({
	// REQUIRED FIELDS
	first_name: requiredTextField(2, 255),
	last_name: requiredTextField(2, 255),
	email: z.email({ error: MINI_INPUT_EMAIL }),
	gender: requiredChoiceTextField(),
	is_active: z.boolean(),
	is_staff: z.boolean(),
	// OPTIONAL FIELDS
	can_view: z.boolean(),
	can_print: z.boolean(),
	can_create: z.boolean(),
	can_edit: z.boolean(),
	can_delete: z.boolean(),
	avatar: base64ImageField,
	avatar_cropped: base64ImageField,
	globalError: optionalTextField(1, 500),
});

export const profilSchema = z.object({
	first_name: requiredTextField(2, 30),
	last_name: requiredTextField(2, 30),
	gender: optionalChoiceField(),
	avatar: base64ImageField,
	avatar_cropped: base64ImageField,
});

export const changePasswordSchema = z
	.object({
		old_password: z.string().min(1, INPUT_REQUIRED).min(8, INPUT_PASSWORD_MIN(8)),
		new_password: z.string().min(1, INPUT_REQUIRED).min(8, INPUT_PASSWORD_MIN(8)),
		new_password2: z.string().min(1, INPUT_REQUIRED),
		globalError: z.string().optional(),
	})
	.refine((data) => data.new_password === data.new_password2, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['new_password2'],
	});

export const casaDiLussoRequired = ['type_contrat'] as const;
export const bluelineRequired = ['fournitures', 'eau_electricite', 'acompte', 'tranche2', 'clause_resiliation'] as const;
export const stRequired = ['st_name', 'st_lot_type', 'st_type_prix'] as const;

export const contractSchema = z
	.object({
		// COMMON REQUIRED FIELDS
		company: z.enum(['casa_di_lusso', 'blueline_works']),
		contract_category: z.enum(['standard', 'sous_traitance']).optional(),
		numero_contrat: requiredTextField(1, 255),
		date_contrat: requiredTextField(1, 255),
		client_nom: optionalTextField(1, 255), // required for non-ST via superRefine
		montant_ht: requiredNumberField(0),
		// OPTIONAL FIELDS (conditionally required via superRefine)
		statut: optionalChoiceField(),
		type_contrat: optionalChoiceField(),
		ville_signature: optionalTextField(1, 255),
		client_cin: optionalTextField(1, 255),
		client_qualite: optionalTextField(1, 255),
		client_adresse: optionalTextField(1, 500),
		client_tel: optionalPhoneField,
		client_email: optionalEmailField,
		type_bien: optionalTextField(1, 255),
		surface: optionalNumberField(0),
		adresse_travaux: optionalTextField(1, 500),
		date_debut: optionalTextField(1, 255),
		duree_estimee: optionalTextField(1, 255),
		description_travaux: optionalTextField(1, 2000),
		devise: optionalChoiceField(),
		tva: optionalTVANumberField(0, 100),
		penalite_retard: optionalNumberField(0),
		garantie: optionalTextField(1, 255),
		tribunal: optionalTextField(1, 255),
		responsable_projet: optionalTextField(1, 255),
		confidentialite: optionalChoiceField(),
		mode_paiement_texte: optionalChoiceField(),
		rib: optionalTextField(1, 200),
		/* ── Casa Di Lusso fields (optional at base, managed by CDL form sections) ── */
		services: z.array(z.string()).optional(),
		conditions_acces: optionalTextField(1, 2000),
		tranches: z
			.array(
				z.object({
					label: trancheLabelField,
					pourcentage: tranchePourcentageField,
				}),
			)
			.optional(),
		delai_retard: optionalNumberField(0, 365),
		frais_redemarrage: optionalNumberField(0),
		delai_reserves: optionalNumberField(0, 365),
		clauses_actives: z.array(z.string()).optional(),
		clause_spec: optionalTextField(1, 5000),
		exclusions: optionalTextField(1, 5000),
		architecte: optionalTextField(1, 255),
		version_document: optionalTextField(1, 255),
		annexes: optionalTextField(1, 5000),
		/* ── Blueline-specific fields (optional at base, required for Blueline via superRefine) ── */
		client_ville: optionalTextField(1, 255),
		client_cp: optionalTextField(1, 10),
		chantier_ville: optionalTextField(1, 255),
		chantier_etage: optionalTextField(1, 100),
		prestations: z
			.array(
				z.object({
					nom: z.string({ error: INPUT_REQUIRED }).min(1, { error: INPUT_REQUIRED }),
					description: z.preprocess((val) => (val == null ? '' : val), z.string()),
					quantite: z.number({ error: INPUT_REQUIRED }).refine((val) => val > 0, { error: INPUT_REQUIRED }),
					unite: z.preprocess((val) => (val == null ? '' : val), z.string()),
					prix_unitaire: z.number({ error: INPUT_REQUIRED }).refine((val) => val > 0, { error: INPUT_REQUIRED }),
				}),
			)
			.optional(),
		fournitures: optionalChoiceField(),
		materiaux_detail: optionalTextField(1, 2000),
		eau_electricite: optionalChoiceField(),
		garantie_nb: optionalNumberField(0, 100),
		garantie_unite: optionalChoiceField(),
		garantie_type: optionalChoiceField(),
		exclusions_garantie: optionalTextField(1, 2000),
		acompte: optionalNumberField(0, 100),
		tranche2: optionalNumberField(0, 100),
		clause_resiliation: optionalChoiceField(),
		notes: optionalTextField(1, 5000),
		/* ── Sous-Traitance (CDL) fields ── */
		st_projet: optionalNumberField(0),
		st_name: optionalTextField(1, 255),
		st_forme: optionalChoiceField(),
		st_capital: optionalTextField(1, 255),
		st_rc: optionalTextField(1, 255),
		st_ice: optionalTextField(1, 255),
		st_if: optionalTextField(1, 255),
		st_cnss: optionalTextField(1, 255),
		st_addr: optionalTextField(1, 500),
		st_rep: optionalTextField(1, 255),
		st_cin: optionalTextField(1, 255),
		st_qualite: optionalTextField(1, 255),
		st_tel: optionalPhoneField,
		st_email: optionalEmailField,
		st_rib: optionalTextField(1, 200),
		st_banque: optionalTextField(1, 255),
		st_lot_type: optionalChoiceField(),
		st_lot_description: optionalTextField(1, 5000),
		st_type_prix: optionalChoiceField(),
		st_retenue_garantie: optionalNumberField(0, 100),
		st_avance: optionalNumberField(0, 100),
		st_penalite_taux: optionalNumberField(0, 100),
		st_plafond_penalite: optionalNumberField(0, 100),
		st_delai_paiement: optionalNumberField(0, 365),
		st_tranches: z
			.array(
				z.object({
					label: trancheLabelField,
					pourcentage: tranchePourcentageField,
				}),
			)
			.optional(),
		st_delai_val: optionalNumberField(0, 365),
		st_delai_unit: optionalChoiceField(),
		st_garantie_mois: optionalNumberField(0, 120),
		st_delai_reserves: optionalNumberField(0, 365),
		st_delai_med: optionalNumberField(0, 365),
		st_clauses_actives: z.array(z.string()).optional(),
		st_observations: optionalTextField(1, 5000),
		globalError: optionalTextField(1, 500),
	})
	.superRefine((data, ctx) => {
		const isEmpty = (val: unknown): boolean =>
			val === undefined ||
			val === null ||
			(typeof val === 'string' && val.trim() === '') ||
			(typeof val === 'number' && Number.isNaN(val));

		const isST = data.company === 'casa_di_lusso' && data.contract_category === 'sous_traitance';

		if (data.company === 'casa_di_lusso' && !isST) {
			// client_nom is required for CDL standard contracts
			if (isEmpty(data.client_nom)) {
				ctx.addIssue({ path: ['client_nom'], code: 'custom', message: INPUT_REQUIRED });
			}
			casaDiLussoRequired.forEach((key) => {
				const val = data[key];
				if (isEmpty(val)) {
					ctx.addIssue({ path: [key], code: 'custom', message: INPUT_REQUIRED });
				}
			});
		} else if (isST) {
			// client_nom is NOT required for ST contracts (no client in ST context)
			stRequired.forEach((key) => {
				const val = data[key as keyof typeof data];
				if (isEmpty(val)) {
					ctx.addIssue({ path: [key], code: 'custom', message: INPUT_REQUIRED });
				}
			});
		} else if (data.company === 'blueline_works') {
			// client_nom is required for Blueline contracts
			if (isEmpty(data.client_nom)) {
				ctx.addIssue({ path: ['client_nom'], code: 'custom', message: INPUT_REQUIRED });
			}
			bluelineRequired.forEach((key) => {
				const val = data[key];
				if (isEmpty(val)) {
					ctx.addIssue({ path: [key], code: 'custom', message: INPUT_REQUIRED });
				}
			});
			// Require at least one prestation for Blueline contracts
			if (!data.prestations || data.prestations.length === 0) {
				ctx.addIssue({ path: ['prestations'], code: 'custom', message: INPUT_REQUIRED });
			}
		}

		if (data.company === 'casa_di_lusso' && !isST && !hasValidEcheancierTotal(data.tranches)) {
			ctx.addIssue({ path: ['tranches'], code: 'custom', message: ECHEANCIER_TOTAL_ERROR });
		}

		if (isST && !hasValidEcheancierTotal(data.st_tranches)) {
			ctx.addIssue({ path: ['st_tranches'], code: 'custom', message: ECHEANCIER_TOTAL_ERROR });
		}

		// Cross-field: acompte + tranche2 must not exceed 100%
		const a = typeof data.acompte === 'number' ? data.acompte : 0;
		const t = typeof data.tranche2 === 'number' ? data.tranche2 : 0;
		if (a + t > 100) {
			const msg = 'La somme de l\'acompte et de la tranche 2 ne peut pas dépasser 100%.';
			ctx.addIssue({ path: ['acompte'], code: 'custom', message: msg });
			ctx.addIssue({ path: ['tranche2'], code: 'custom', message: msg });
		}	});
