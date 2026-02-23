export type ContractStatutType =
	| 'Brouillon'
	| 'Envoyé'
	| 'Signé'
	| 'En cours'
	| 'Terminé'
	| 'Annulé'
	| 'Expiré';

export type ContractTypeType =
	| 'travaux_finition'
	| 'travaux_gros_oeuvre'
	| 'design_interieur'
	| 'cle_en_main'
	| 'ameublement'
	| 'maintenance'
	| 'suivi_chantier';

export type ContractTypeBienType =
	| 'appartement'
	| 'villa'
	| 'riad_maison_traditionnelle'
	| 'bureau_local_commercial'
	| 'hotel_riad_hotelier'
	| 'autre';

export type ContractClientQualiteType =
	| 'particulier'
	| 'entreprise_societe'
	| 'investisseur_immobilier'
	| 'administration_institution';

export type ContractGarantieType = '6 mois' | '1 an' | '2 ans' | '3 ans' | 'sans_garantie';

export type ContractTribunalType = 'Tanger' | 'Casablanca' | 'Rabat' | 'Marrakech' | 'Fès' | 'Agadir';

export type ContractConfidentialiteType = 'CONFIDENTIEL' | 'USAGE INTERNE' | 'STANDARD';

export type ContractModePaiementTexteType =
	| 'Virement Bancaire'
	| 'Chèque Certifié'
	| 'Espèces'
	| 'Paiement Mixte';

export type ContractDeviseType = 'MAD' | 'EUR' | 'USD';

export type ContractTrancheType = {
	label: string;
	pourcentage: number;
};
