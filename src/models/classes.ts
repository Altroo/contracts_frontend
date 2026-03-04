import type {
	ContractCompanyType,
	ContractStatutType,
	ContractTypeType,
	ContractTypeBienType,
	ContractClientQualiteType,
	ContractGarantieType,
	ContractTribunalType,
	ContractConfidentialiteType,
	ContractModePaiementTexteType,
	ContractDeviseType,
	ContractTrancheType,
	ContractFournituresType,
	ContractEauElectriciteType,
	ContractGarantieUniteType,
	ContractGarantieTypeType,
	ContractClauseResiliationType,
	ContractPrestationType,
} from '@/types/contractTypes';

export class UserClass {
	constructor(
		public readonly id: number,
		public first_name: string,
		public last_name: string,
		public email: string,
		public gender: string,
		public avatar: string | ArrayBuffer | null,
		public avatar_cropped: string | ArrayBuffer | null,
		public is_staff: boolean,
		public is_active: boolean,
		public default_password_set: boolean,
		public date_joined: string | null,
		public date_updated: string | null,
		public last_login: string | null,
		// Per-user permission flags
		public can_view: boolean,
		public can_print: boolean,
		public can_create: boolean,
		public can_edit: boolean,
		public can_delete: boolean,
	) {}
}

export class ContractClass {
	constructor(
		// Meta identifiers
		public readonly id: number,
		public numero_contrat: string,
		public readonly client_name: string | null,

		// Company
		public company: ContractCompanyType | string,
		public readonly company_display: string,

		// Client embedded fields
		public client_nom: string,
		public client_cin: string,
		public client_qualite: ContractClientQualiteType | string,
		public client_adresse: string,
		public client_tel: string,
		public client_email: string,
		public ville_signature: string,

		// Contract dates & status
		public date_contrat: string,
		public statut: ContractStatutType,

		// Project fields
		public adresse_travaux: string,
		public type_bien: ContractTypeBienType | string,
		public surface: number | null,
		public services: string[],
		public description_travaux: string,
		public date_debut: string | null,
		public duree_estimee: string,
		public conditions_acces: string,

		// Financial fields
		public montant_ht: number,
		public devise: ContractDeviseType | string,
		public tva: number,
		public readonly montant_tva: number,
		public readonly montant_ttc: number,
		public tranches: ContractTrancheType[],
		public mode_paiement_texte: ContractModePaiementTexteType | string,
		public rib: string,
		public delai_retard: number,
		public penalite_retard: number,
		public frais_redemarrage: number,

		// Clauses
		public garantie: ContractGarantieType | string,
		public delai_reserves: number,
		public tribunal: ContractTribunalType | string,
		public clauses_actives: string[],
		public clause_spec: string,
		public exclusions: string,

		// Options
		public type_contrat: ContractTypeType | string,
		public readonly type_contrat_display: string,
		public responsable_projet: string,
		public architecte: string,
		public confidentialite: ContractConfidentialiteType | string,
		public version_document: string,
		public annexes: string,

		// Blueline-specific fields
		public client_ville: string,
		public client_cp: string,
		public chantier_ville: string,
		public chantier_etage: string,
		public prestations: ContractPrestationType[] | null,
		public fournitures: ContractFournituresType | string,
		public materiaux_detail: string,
		public eau_electricite: ContractEauElectriciteType | string,
		public garantie_nb: number | null,
		public garantie_unite: ContractGarantieUniteType | string,
		public garantie_type: ContractGarantieTypeType | string,
		public exclusions_garantie: string,
		public acompte: number | null,
		public tranche2: number | null,
		public readonly solde: number | null,
		public clause_resiliation: ContractClauseResiliationType | string,
		public notes: string,

		// Meta audit
		public readonly created_by_user: number | null,
		public readonly created_by_user_id: number | null,
		public readonly created_by_user_name: string | null,
		public readonly date_created: string,
		public readonly date_updated: string,
	) {}
}
