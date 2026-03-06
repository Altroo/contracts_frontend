import type { AccountGenderCodeValueType } from '@/types/accountTypes';

export const genderItemsList: Array<AccountGenderCodeValueType> = [
	{ code: 'H', value: 'Homme' },
	{ code: 'F', value: 'Femme' },
];

/* ── Company choices ── */

export const companyItemsList: Array<{ code: string; value: string }> = [
	{ code: 'casa_di_lusso', value: 'Casa di Lusso' },
	{ code: 'blueline_works', value: 'Blueline Works' },
];

/* ── Contract statuses ── */

export type ChipColor = 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary';

export const contractStatutItemsList: string[] = [
	'Brouillon', 'Envoyé', 'Signé', 'En cours', 'Terminé', 'Annulé', 'Expiré',
];

const contractStatusColorsList: Array<{ code: string; color: ChipColor }> = [
	{ code: 'Brouillon', color: 'default' },
	{ code: 'Envoyé', color: 'info' },
	{ code: 'Signé', color: 'primary' },
	{ code: 'En cours', color: 'warning' },
	{ code: 'Terminé', color: 'success' },
	{ code: 'Annulé', color: 'error' },
	{ code: 'Expiré', color: 'warning' },
];

export const getContractStatusColor = (statut: string): ChipColor => {
	return contractStatusColorsList.find((item) => item.code === statut)?.color ?? 'default';
};

/* ── Contract types ── */

export const typeContratItemsList: Array<{ code: string; value: string }> = [
	{ code: 'travaux_finition', value: 'Travaux de Finition' },
	{ code: 'travaux_gros_oeuvre', value: 'Travaux Gros Œuvre' },
	{ code: 'design_interieur', value: 'Design Intérieur' },
	{ code: 'cle_en_main', value: 'Clé en Main' },
	{ code: 'ameublement', value: 'Ameublement' },
	{ code: 'maintenance', value: 'Maintenance' },
	{ code: 'suivi_chantier', value: 'Suivi Chantier' },
];

/* ── Type de bien ── */

export const typeBienItemsList: Array<{ code: string; value: string }> = [
	{ code: 'appartement', value: 'Appartement' },
	{ code: 'villa', value: 'Villa' },
	{ code: 'duplex', value: 'Duplex' },
	{ code: 'riad_maison_traditionnelle', value: 'Riad / Maison Traditionnelle' },
	{ code: 'bureau_local_commercial', value: 'Bureau / Local Commercial' },
	{ code: 'commerce_local', value: 'Commerce / Local' },
	{ code: 'hotel_riad_hotelier', value: 'Hôtel / Riad Hôtelier' },
	{ code: 'immeuble', value: 'Immeuble' },
	{ code: 'autre', value: 'Autre' },
];

/* ── Other dropdown lists ── */

export const deviseItemsList: string[] = ['MAD', 'EUR', 'USD'];
export const confidentialiteItemsList: string[] = ['CONFIDENTIEL', 'USAGE INTERNE', 'STANDARD'];

export const clientQualiteItemsList: Array<{ code: string; value: string }> = [
	{ code: 'particulier', value: 'Particulier' },
	{ code: 'entreprise_societe', value: 'Entreprise / Société' },
	{ code: 'investisseur_immobilier', value: 'Investisseur Immobilier' },
	{ code: 'administration_institution', value: 'Administration / Institution' },
];

export const garantieItemsList: Array<{ code: string; value: string }> = [
	{ code: '6 mois', value: '6 mois' },
	{ code: '1 an', value: '1 an' },
	{ code: '2 ans', value: '2 ans' },
	{ code: '3 ans', value: '3 ans' },
	{ code: 'sans_garantie', value: 'Sans garantie contractuelle' },
];

export const tribunalItemsList: Array<{ code: string; value: string }> = [
	{ code: 'Tanger', value: 'Tanger' },
	{ code: 'Casablanca', value: 'Casablanca' },
	{ code: 'Rabat', value: 'Rabat' },
	{ code: 'Marrakech', value: 'Marrakech' },
	{ code: 'Fès', value: 'Fès' },
	{ code: 'Agadir', value: 'Agadir' },
];

/* ── Blueline-specific choices ── */

export const fournituresItemsList: Array<{ code: string; value: string }> = [
	{ code: 'non_incluses', value: 'Non incluses (fournies par le client)' },
	{ code: 'incluses', value: 'Incluses dans le contrat' },
	{ code: 'partielles', value: 'Partiellement incluses' },
];

export const eauElectriciteItemsList: Array<{ code: string; value: string }> = [
	{ code: 'client', value: 'À la charge du client' },
	{ code: 'entreprise', value: "À la charge de l'entreprise" },
	{ code: 'partage', value: 'Partagé' },
	{ code: 'selon_cas', value: 'Selon le cas' },
];

export const garantieUniteItemsList: Array<{ code: string; value: string }> = [
	{ code: 'mois', value: 'Mois' },
	{ code: 'ans', value: 'Ans' },
];

export const garantieTypeItemsList: Array<{ code: string; value: string }> = [
	{ code: 'defauts', value: 'Garantie des défauts' },
	{ code: 'bonne_fin', value: 'Garantie de bonne fin' },
	{ code: 'decennale', value: 'Garantie décennale' },
	{ code: 'aucune', value: 'Aucune garantie' },
];

export const clauseResiliationItemsList: Array<{ code: string; value: string }> = [
	{ code: '30j', value: 'Préavis de 30 jours' },
	{ code: '15j', value: 'Préavis de 15 jours' },
	{ code: 'mutuel', value: "D'un commun accord" },
	{ code: 'aucune', value: 'Aucune clause' },
];

export const modePaiementTexteItemsList: Array<{ code: string; value: string }> = [
	{ code: 'Virement Bancaire', value: 'Virement Bancaire' },
	{ code: 'Chèque Certifié', value: 'Chèque Certifié' },
	{ code: 'Espèces', value: 'Espèces' },
	{ code: 'Paiement Mixte', value: 'Paiement Mixte' },
	{ code: 'Mobile Money', value: 'Mobile Money' },
	{ code: 'Virement ou Chèque', value: 'Virement ou Chèque' },
];

export const prestationNomItemsList: Array<{ code: string; value: string }> = [
	{ code: 'pose_carrelage', value: 'Pose de carrelage' },
	{ code: 'pose_marbre', value: 'Pose de marbre' },
	{ code: 'plan_travail_cuisine', value: 'Plan de travail cuisine' },
	{ code: 'revetement_mural_faience', value: 'Revêtement mural faïence' },
	{ code: 'finitions_peinture', value: 'Finitions peinture' },
	{ code: 'pose_parquet', value: 'Pose de parquet' },
	{ code: 'enduit_crepi', value: 'Enduit & crépi' },
	{ code: 'joints_silicone', value: 'Joints & silicone' },
	{ code: 'depose_demolition', value: 'Dépose & démolition' },
	{ code: 'preparation_surfaces', value: 'Préparation des surfaces' },
	{ code: 'seuils_plinthes', value: 'Seuils & plinthes' },
	{ code: 'douche_italienne', value: "Douche à l'italienne" },
	{ code: 'escalier_marbre', value: 'Escalier marbre' },
	{ code: 'terrasse_exterieure', value: 'Terrasse extérieure' },
	{ code: 'main_oeuvre', value: "Main d'œuvre qualifiée" },
	{ code: 'transport_deplacement', value: 'Transport & déplacement' },
	{ code: 'autre', value: 'Autre' },
];

export const prestationUniteItemsList: Array<{ code: string; value: string }> = [
	{ code: 'm2', value: 'm²' },
	{ code: 'ml', value: 'ml' },
	{ code: 'm3', value: 'm³' },
	{ code: 'unite', value: 'unité' },
	{ code: 'forfait', value: 'forfait' },
	{ code: 'heure', value: 'heure' },
	{ code: 'jour', value: 'jour' },
	{ code: 'kg', value: 'kg' },
];

/* ── Contract category ── */

export const contractCategoryItemsList: Array<{ code: string; value: string }> = [
	{ code: 'standard', value: 'Standard' },
	{ code: 'sous_traitance', value: 'Sous-Traitance' },
];

/* ── Sous-Traitance (CDL) specific choices ── */

export const stLotTypeItemsList: Array<{ code: string; value: string }> = [
	{ code: 'gros_oeuvre', value: 'Travaux de Gros Œuvre' },
	{ code: 'electricite', value: "Travaux d'Électricité" },
	{ code: 'plomberie', value: 'Travaux de Plomberie et Sanitaire' },
	{ code: 'menuiserie_alu', value: 'Travaux de Menuiserie Aluminium' },
	{ code: 'menuiserie_bois', value: 'Travaux de Menuiserie Bois' },
	{ code: 'carrelage', value: 'Travaux de Carrelage et Faïence' },
	{ code: 'peinture', value: 'Travaux de Peinture' },
	{ code: 'etancheite', value: "Travaux d'Étanchéité" },
	{ code: 'ascenseur', value: "Fourniture et Installation d'Ascenseur" },
	{ code: 'platre', value: 'Travaux de Plâtre et Faux Plafond' },
	{ code: 'ferronnerie', value: 'Travaux de Ferronnerie et Garde-Corps' },
	{ code: 'vrd', value: 'Travaux de VRD et Façade' },
	{ code: 'climatisation', value: 'Travaux de Climatisation et Ventilation' },
	{ code: 'cuisine', value: 'Fourniture et Pose de Cuisines Équipées' },
];

export const stProjetTypeItemsList: Array<{ code: string; value: string }> = [
	{ code: 'immeuble', value: 'Immeuble' },
	{ code: 'villa', value: 'Villa' },
	{ code: 'commercial', value: 'Commercial' },
	{ code: 'industriel', value: 'Industriel' },
	{ code: 'renovation', value: 'Rénovation' },
	{ code: 'autre', value: 'Autre' },
];

export const stFormeJuridiqueItemsList: Array<{ code: string; value: string }> = [
	{ code: 'SARL', value: 'SARL' },
	{ code: 'SA', value: 'SA' },
	{ code: 'SARLAU', value: 'SARLAU' },
	{ code: 'SNC', value: 'SNC' },
	{ code: 'auto_entrepreneur', value: 'Auto-entrepreneur' },
	{ code: 'personne_physique', value: 'Personne physique' },
];

export const stTypePrixItemsList: Array<{ code: string; value: string }> = [
	{ code: 'forfaitaire', value: 'Forfaitaire ferme' },
	{ code: 'unitaire', value: 'Prix unitaires' },
	{ code: 'regie', value: 'Régie' },
];

export const stDelaiUnitItemsList: Array<{ code: string; value: string }> = [
	{ code: 'mois', value: 'Mois' },
	{ code: 'semaines', value: 'Semaines' },
	{ code: 'jours', value: 'Jours' },
];

export const stClausesActivesList: Array<{ key: string; label: string }> = [
	{ key: 'tConfid', label: 'Confidentialité' },
	{ key: 'tNonConc', label: 'Non-concurrence' },
	{ key: 'tNonDeb', label: 'Non-débauchage' },
	{ key: 'tCascade', label: 'Interdiction de sous-traitance en cascade' },
	{ key: 'tEnviro', label: 'Clause environnementale' },
	{ key: 'tPI', label: 'Propriété intellectuelle' },
	{ key: 'tExclus', label: 'Exclusivité' },
	{ key: 'tRevision', label: 'Révision de prix' },
	{ key: 'tMediat', label: 'Médiation et arbitrage' },
	{ key: 'tAnnexe', label: 'Annexes' },
];
