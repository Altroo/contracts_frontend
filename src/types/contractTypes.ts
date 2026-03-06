export type ContractCompanyType = 'casa_di_lusso' | 'blueline_works';

export type ContractCategoryType = 'standard' | 'sous_traitance';

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

/* ── Sous-Traitance (CDL) types ── */

export type STLotType =
	| 'gros_oeuvre'
	| 'electricite'
	| 'plomberie'
	| 'menuiserie_alu'
	| 'menuiserie_bois'
	| 'carrelage'
	| 'peinture'
	| 'etancheite'
	| 'ascenseur'
	| 'platre'
	| 'ferronnerie'
	| 'vrd'
	| 'climatisation'
	| 'cuisine';

export type STProjetType =
	| 'immeuble'
	| 'villa'
	| 'commercial'
	| 'industriel'
	| 'renovation'
	| 'autre';

export type STFormeJuridiqueType =
	| 'SARL'
	| 'SA'
	| 'SARLAU'
	| 'SNC'
	| 'auto_entrepreneur'
	| 'personne_physique';

export type STTypePrixType = 'forfaitaire' | 'unitaire' | 'regie';

export type STDelaiUnitType = 'mois' | 'semaines' | 'jours';

export type STTrancheType = {
	label: string;
	pourcentage: number;
};

export type ProjectType = {
	id: number;
	company: ContractCompanyType;
	company_display: string;
	name: string;
	type: STProjetType | string;
	type_display: string;
	description: string;
	adresse: string;
	maitre_ouvrage: string;
	permis: string;
	is_predefined: boolean;
	created_by_user: number | null;
	date_created: string;
	date_updated: string;
};

export type CompanyConfigType = {
	id: number;
	company: ContractCompanyType;
	name: string;
	forme_juridique: string;
	capital: string;
	rc: string;
	ice: string;
	identifiant_fiscal: string;
	adresse: string;
	representant: string;
	qualite_representant: string;
};

export type ContractSchemaType = {
	company: ContractCompanyType;
	contract_category: ContractCategoryType;
	numero_contrat: string;
	date_contrat: string;
	client_nom?: string;
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
	/* ── Sous-Traitance (CDL) fields ── */
	st_projet?: number | null;
	st_name?: string;
	st_forme?: string;
	st_capital?: string;
	st_rc?: string;
	st_ice?: string;
	st_if?: string;
	st_cnss?: string;
	st_addr?: string;
	st_rep?: string;
	st_cin?: string;
	st_qualite?: string;
	st_tel?: string;
	st_email?: string;
	st_rib?: string;
	st_banque?: string;
	st_lot_type?: string;
	st_lot_description?: string;
	st_type_prix?: string;
	st_retenue_garantie?: number;
	st_avance?: number;
	st_penalite_taux?: number;
	st_plafond_penalite?: number;
	st_delai_paiement?: number;
	st_tranches?: STTrancheType[];
	st_delai_val?: number;
	st_delai_unit?: string;
	st_garantie_mois?: number;
	st_delai_reserves?: number;
	st_delai_med?: number;
	st_clauses_actives?: string[];
	st_observations?: string;
	globalError?: string;
};

export type ContractFormValuesType = {
	company: ContractCompanyType;
	contract_category: ContractCategoryType;
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
	/* ── Sous-Traitance (CDL) fields ── */
	st_projet: string;
	st_name: string;
	st_forme: string;
	st_capital: string;
	st_rc: string;
	st_ice: string;
	st_if: string;
	st_cnss: string;
	st_addr: string;
	st_rep: string;
	st_cin: string;
	st_qualite: string;
	st_tel: string;
	st_email: string;
	st_rib: string;
	st_banque: string;
	st_lot_type: string;
	st_lot_description: string;
	st_type_prix: string;
	st_retenue_garantie: string;
	st_avance: string;
	st_penalite_taux: string;
	st_plafond_penalite: string;
	st_delai_paiement: string;
	st_tranches: STTrancheType[];
	st_delai_val: string;
	st_delai_unit: string;
	st_garantie_mois: string;
	st_delai_reserves: string;
	st_delai_med: string;
	st_clauses_actives: string[];
	st_observations: string;
	globalError: string;
};
