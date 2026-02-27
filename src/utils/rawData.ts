import type { AccountGenderCodeValueType } from '@/types/accountTypes';

export const genderItemsList: Array<AccountGenderCodeValueType> = [
	{ code: 'H', value: 'Homme' },
	{ code: 'F', value: 'Femme' },
];

/* ── Contract statuses ── */

export type ChipColor = 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary';

export const contractStatutItemsList: string[] = [
	'Brouillon', 'Envoyé', 'Signé', 'En cours', 'Terminé', 'Annulé', 'Expiré',
];

export const contractStatusColors: Record<string, ChipColor> = {
	Brouillon: 'default',
	Envoye: 'info',
	Signe: 'primary',
	'En cours': 'warning',
	Termine: 'success',
	Annule: 'error',
	Expire: 'error',
};

/* ── Contract types ── */

export const typeContratItemsList: Array<{ code: string; value: string }> = [
	{ code: 'travaux_finition', value: 'Travaux de finition' },
	{ code: 'travaux_gros_oeuvre', value: 'Travaux gros oeuvre' },
	{ code: 'design_interieur', value: 'Design interieur' },
	{ code: 'cle_en_main', value: 'Cle en main' },
	{ code: 'ameublement', value: 'Ameublement' },
	{ code: 'maintenance', value: 'Maintenance' },
	{ code: 'suivi_chantier', value: 'Suivi de chantier' },
];

/* ── Other dropdown lists ── */

export const deviseItemsList: string[] = ['MAD', 'EUR', 'USD'];
export const confidentialiteItemsList: string[] = ['CONFIDENTIEL', 'USAGE INTERNE', 'STANDARD'];
