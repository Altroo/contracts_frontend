import { z } from 'zod';
import {
	INPUT_REQUIRED,
	INPUT_PASSWORD_MIN,
	INPUT_MIN,
	INPUT_MAX,
	INPUT_PHONE,
	INPUT_URL_INVALID,
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

const optionalUrlField = z.preprocess(
	(val) => (val === undefined || val === null || val === '' ? undefined : val),
	z.url({ error: INPUT_URL_INVALID }).optional(),
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
			.min(min, { message: INPUT_MIN(min) })
			.max(max ?? Number.MAX_SAFE_INTEGER, { message: INPUT_MAX(max ?? Number.MAX_SAFE_INTEGER) })
			.optional()
			.nullable(),
	);

const singleDigit = z
	.string()
	.min(1, { error: SHORT_INPUT_REQUIRED })
	.regex(/^\d$/, { error: SHORT_INPUT_REQUIRED })
	.transform((val) => Number(val));

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

export const contractSchema = z.object({
	// REQUIRED FIELDS
	numero_contrat: requiredTextField(1, 255),
	client_nom: requiredTextField(1, 255),
	montant_ht: requiredNumberField(0),
	// OPTIONAL FIELDS
	date_contrat: optionalTextField(1, 255),
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
	garantie: optionalTextField(1, 255),
	tribunal: optionalTextField(1, 255),
	responsable_projet: optionalTextField(1, 255),
	confidentialite: optionalChoiceField(),
	globalError: optionalTextField(1, 500),
});
