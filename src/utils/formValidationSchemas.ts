import { z } from 'zod';
import {
	INPUT_REQUIRED,
	INPUT_PASSWORD_MIN,
	MINI_INPUT_EMAIL,
} from '@/utils/formValidationErrorMessages';

export const userSchema = z
	.object({
		first_name: z.string().min(1, INPUT_REQUIRED),
		last_name: z.string().min(1, INPUT_REQUIRED),
		email: z.string().min(1, INPUT_REQUIRED).email(MINI_INPUT_EMAIL),
		gender: z.string().optional(),
		password1: z.string().optional(),
		password2: z.string().optional(),
		is_staff: z.boolean(),
		can_view: z.boolean(),
		can_print: z.boolean(),
		can_create: z.boolean(),
		can_edit: z.boolean(),
		can_delete: z.boolean(),
		globalError: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.password1 || data.password2) {
				return data.password1 === data.password2;
			}
			return true;
		},
		{
			message: 'Les mots de passe ne correspondent pas',
			path: ['password2'],
		},
	);

export const profilSchema = z.object({
	first_name: z.string().min(1, INPUT_REQUIRED),
	last_name: z.string().min(1, INPUT_REQUIRED),
	gender: z.string().optional(),
	globalError: z.string().optional(),
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
	numero_contrat: z.string().min(1, INPUT_REQUIRED),
	date_contrat: z.string(),
	statut: z.string(),
	type_contrat: z.string(),
	ville_signature: z.string(),
	client_nom: z.string().min(1, INPUT_REQUIRED),
	client_cin: z.string(),
	client_qualite: z.string(),
	client_adresse: z.string(),
	client_tel: z.string(),
	client_email: z.string(),
	type_bien: z.string(),
	surface: z.string(),
	adresse_travaux: z.string(),
	date_debut: z.string(),
	duree_estimee: z.string(),
	description_travaux: z.string(),
	montant_ht: z.string().min(1, 'Le montant HT est requis'),
	devise: z.string(),
	tva: z.string(),
	garantie: z.string(),
	tribunal: z.string(),
	responsable_projet: z.string(),
	confidentialite: z.string(),
	globalError: z.string().optional(),
});
