export type ContractCompanyType = 'casa_di_lusso' | 'blueline_works';

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
	| 'duplex'
	| 'riad_maison_traditionnelle'
	| 'bureau_local_commercial'
	| 'commerce_local'
	| 'hotel_riad_hotelier'
	| 'immeuble'
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
	| 'Paiement Mixte'
	| 'Mobile Money'
	| 'Virement ou Chèque';

export type ContractDeviseType = 'MAD' | 'EUR' | 'USD';

export type ContractTrancheType = {
	label: string;
	pourcentage: number;
};

/* ── Blueline-specific types ── */

export type ContractFournituresType = 'non_incluses' | 'incluses' | 'partielles';
export type ContractEauElectriciteType = 'client' | 'entreprise' | 'partage' | 'selon_cas';
export type ContractGarantieUniteType = 'mois' | 'ans';
export type ContractGarantieTypeType = 'defauts' | 'bonne_fin' | 'decennale' | 'aucune';
export type ContractClauseResiliationType = '30j' | '15j' | 'mutuel' | 'aucune';

export type ContractPrestationType = {
	nom: string;
	description: string;
	quantite: number;
	unite: string;
	prix_unitaire: number;
};

export type ContractSchemaType = {
	company: ContractCompanyType;
	numero_contrat: string;
	date_contrat: string;
	client_nom: string;
	montant_ht: number;
	statut?: string;
	type_contrat?: string;
	ville_signature?: string;
	client_cin?: string;
	client_qualite?: string;
	client_adresse?: string;
	client_tel?: string;
	client_email?: string;
	type_bien?: string;
	surface?: number;
	adresse_travaux?: string;
	date_debut?: string;
	duree_estimee?: string;
	description_travaux?: string;
	devise?: string;
	tva?: number | null;
	penalite_retard?: number;
	garantie?: string;
	tribunal?: string;
	responsable_projet?: string;
	confidentialite?: string;
	mode_paiement_texte?: string;
	rib?: string;
	/* ── Casa Di Lusso-specific fields ── */
	services?: string[];
	conditions_acces?: string;
	tranches?: ContractTrancheType[];
	delai_retard?: number;
	frais_redemarrage?: number;
	delai_reserves?: number;
	clauses_actives?: string[];
	clause_spec?: string;
	exclusions?: string;
	architecte?: string;
	version_document?: string;
	annexes?: string;
	/* ── Blueline-specific fields ── */
	client_ville?: string;
	client_cp?: string;
	chantier_ville?: string;
	chantier_etage?: string;
	prestations?: ContractPrestationType[];
	fournitures?: string;
	materiaux_detail?: string;
	eau_electricite?: string;
	garantie_nb?: number;
	garantie_unite?: string;
	garantie_type?: string;
	exclusions_garantie?: string;
	acompte?: number;
	tranche2?: number;
	clause_resiliation?: string;
	notes?: string;
	globalError?: string;
};

export type ContractFormValuesType = {
	company: ContractCompanyType;
	numero_contrat: string;
	date_contrat: string;
	statut: ContractStatutType;
	type_contrat: string;
	ville_signature: string;
	client_nom: string;
	client_cin: string;
	client_qualite: string;
	client_adresse: string;
	client_tel: string;
	client_email: string;
	type_bien: string;
	surface: string;
	adresse_travaux: string;
	date_debut: string;
	duree_estimee: string;
	description_travaux: string;
	montant_ht: string;
	devise: string;
	tva: string;
	penalite_retard: string;
	garantie: string;
	tribunal: string;
	responsable_projet: string;
	confidentialite: string;
	mode_paiement_texte: string;
	rib: string;
	/* ── Casa Di Lusso-specific fields ── */
	services: string[];
	conditions_acces: string;
	tranches: ContractTrancheType[];
	delai_retard: string;
	frais_redemarrage: string;
	delai_reserves: string;
	clauses_actives: string[];
	clause_spec: string;
	exclusions: string;
	architecte: string;
	version_document: string;
	annexes: string;
	/* ── Blueline-specific fields ── */
	client_ville: string;
	client_cp: string;
	chantier_ville: string;
	chantier_etage: string;
	prestations: ContractPrestationType[];
	fournitures: string;
	materiaux_detail: string;
	eau_electricite: string;
	garantie_nb: string;
	garantie_unite: string;
	garantie_type: string;
	exclusions_garantie: string;
	acompte: string;
	tranche2: string;
	clause_resiliation: string;
	notes: string;
	globalError: string;
};
