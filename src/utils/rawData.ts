import type {AccountGenderCodeValueType} from '@/types/accountTypes';
import type {TranslationDictionary} from '@/types/languageTypes';

/* ── Static (non-translatable) exports ── */

export const companyItemsList: Array<{ code: string; value: string }> = [
  {code: 'casa_di_lusso', value: 'Casa di Lusso'},
  {code: 'blueline_works', value: 'Blueline Works'},
];

export const deviseItemsList: string[] = ['MAD', 'EUR', 'USD'];

export const tribunalItemsList: Array<{ code: string; value: string }> = [
  {code: 'Tanger', value: 'Tanger'},
  {code: 'Casablanca', value: 'Casablanca'},
  {code: 'Rabat', value: 'Rabat'},
  {code: 'Marrakech', value: 'Marrakech'},
  {code: 'Fès', value: 'Fès'},
  {code: 'Agadir', value: 'Agadir'},
];

export type ChipColor = 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary';

const contractStatusColorsList: Array<{ code: string; color: ChipColor }> = [
  {code: 'Brouillon', color: 'default'},
  {code: 'Envoyé', color: 'info'},
  {code: 'Signé', color: 'primary'},
  {code: 'En cours', color: 'warning'},
  {code: 'Terminé', color: 'success'},
  {code: 'Annulé', color: 'error'},
  {code: 'Expiré', color: 'warning'},
];

export const getContractStatusColor = (statut: string): ChipColor => {
  return contractStatusColorsList.find((item) => item.code === statut)?.color ?? 'default';
};

/* ── Translated raw data ── */

export const getTranslatedRawData = (t: TranslationDictionary) => ({
  genderItemsList: [
    {code: 'H', value: t.rawData.genders.male},
    {code: 'F', value: t.rawData.genders.female},
  ] as Array<AccountGenderCodeValueType>,

  contractStatutItemsList: [
    {code: 'Brouillon', value: t.rawData.contractStatuses.draft},
    {code: 'Envoyé', value: t.rawData.contractStatuses.sent},
    {code: 'Signé', value: t.rawData.contractStatuses.signed},
    {code: 'En cours', value: t.rawData.contractStatuses.inProgress},
    {code: 'Terminé', value: t.rawData.contractStatuses.completed},
    {code: 'Annulé', value: t.rawData.contractStatuses.cancelled},
    {code: 'Expiré', value: t.rawData.contractStatuses.expired},
  ],

  confidentialiteItemsList: [
    {code: 'CONFIDENTIEL', value: t.rawData.confidentiality.confidential},
    {code: 'USAGE INTERNE', value: t.rawData.confidentiality.internalUse},
    {code: 'STANDARD', value: t.rawData.confidentiality.standard},
  ],

  typeContratItemsList: [
    {code: 'travaux_finition', value: t.rawData.contractTypes.travaux_finition},
    {code: 'travaux_gros_oeuvre', value: t.rawData.contractTypes.travaux_gros_oeuvre},
    {code: 'design_interieur', value: t.rawData.contractTypes.design_interieur},
    {code: 'cle_en_main', value: t.rawData.contractTypes.cle_en_main},
    {code: 'ameublement', value: t.rawData.contractTypes.ameublement},
    {code: 'maintenance', value: t.rawData.contractTypes.maintenance},
    {code: 'suivi_chantier', value: t.rawData.contractTypes.suivi_chantier},
  ],

  typeBienItemsList: [
    {code: 'appartement', value: t.rawData.propertyTypes.appartement},
    {code: 'villa', value: t.rawData.propertyTypes.villa},
    {code: 'duplex', value: t.rawData.propertyTypes.duplex},
    {code: 'residence', value: t.rawData.propertyTypes.residence},
    {code: 'hotel', value: t.rawData.propertyTypes.hotel},
    {code: 'riad_maison_traditionnelle', value: t.rawData.propertyTypes.riad_maison_traditionnelle},
    {code: 'bureau_local_commercial', value: t.rawData.propertyTypes.bureau_local_commercial},
    {code: 'commerce_local', value: t.rawData.propertyTypes.commerce_local},
    {code: 'hotel_riad_hotelier', value: t.rawData.propertyTypes.hotel_riad_hotelier},
    {code: 'immeuble', value: t.rawData.propertyTypes.immeuble},
    {code: 'autre', value: t.rawData.propertyTypes.autre},
  ],

  clientQualiteItemsList: [
    {code: 'particulier', value: t.rawData.clientQualities.particulier},
    {code: 'entreprise_societe', value: t.rawData.clientQualities.entreprise_societe},
    {code: 'investisseur_immobilier', value: t.rawData.clientQualities.investisseur_immobilier},
    {code: 'administration_institution', value: t.rawData.clientQualities.administration_institution},
  ],

  garantieItemsList: [
    {code: '1 mois', value: t.rawData.warranties['1_mois']},
    {code: '3 mois', value: t.rawData.warranties['3_mois']},
    {code: '6 mois', value: t.rawData.warranties['6_mois']},
    {code: '1 an', value: t.rawData.warranties['1_an']},
    {code: '2 ans', value: t.rawData.warranties['2_ans']},
    {code: '3 ans', value: t.rawData.warranties['3_ans']},
    {code: 'sans_garantie', value: t.rawData.warranties.sans_garantie},
  ],

  fournituresItemsList: [
    {code: 'non_incluses', value: t.rawData.supplies.non_incluses},
    {code: 'incluses', value: t.rawData.supplies.incluses},
    {code: 'partielles', value: t.rawData.supplies.partielles},
  ],

  eauElectriciteItemsList: [
    {code: 'client', value: t.rawData.waterElectricity.client},
    {code: 'entreprise', value: t.rawData.waterElectricity.entreprise},
    {code: 'partage', value: t.rawData.waterElectricity.partage},
    {code: 'selon_cas', value: t.rawData.waterElectricity.selon_cas},
  ],

  garantieUniteItemsList: [
    {code: 'mois', value: t.rawData.warrantyUnits.mois},
    {code: 'ans', value: t.rawData.warrantyUnits.ans},
  ],

  garantieTypeItemsList: [
    {code: 'defauts', value: t.rawData.warrantyTypes.defauts},
    {code: 'bonne_fin', value: t.rawData.warrantyTypes.bonne_fin},
    {code: 'decennale', value: t.rawData.warrantyTypes.decennale},
    {code: 'aucune', value: t.rawData.warrantyTypes.aucune},
  ],

  clauseResiliationItemsList: [
    {code: '30j', value: t.rawData.terminationClauses['30j']},
    {code: '15j', value: t.rawData.terminationClauses['15j']},
    {code: 'mutuel', value: t.rawData.terminationClauses.mutuel},
    {code: 'aucune', value: t.rawData.terminationClauses.aucune},
  ],

  modePaiementTexteItemsList: [
    {code: 'Virement Bancaire', value: t.rawData.paymentMethods.virement},
    {code: 'Chèque Certifié', value: t.rawData.paymentMethods.cheque},
    {code: 'Espèces', value: t.rawData.paymentMethods.especes},
    {code: 'Paiement Mixte', value: t.rawData.paymentMethods.mixte},
    {code: 'Mobile Money', value: t.rawData.paymentMethods.mobile},
    {code: 'Virement ou Chèque', value: t.rawData.paymentMethods.virementOuCheque},
  ],

  prestationNomItemsList: [
    {code: 'pose_carrelage', value: t.rawData.prestationNames.pose_carrelage},
    {code: 'pose_marbre', value: t.rawData.prestationNames.pose_marbre},
    {code: 'plan_travail_cuisine', value: t.rawData.prestationNames.plan_travail_cuisine},
    {code: 'revetement_mural_faience', value: t.rawData.prestationNames.revetement_mural_faience},
    {code: 'finitions_peinture', value: t.rawData.prestationNames.finitions_peinture},
    {code: 'pose_parquet', value: t.rawData.prestationNames.pose_parquet},
    {code: 'enduit_crepi', value: t.rawData.prestationNames.enduit_crepi},
    {code: 'joints_silicone', value: t.rawData.prestationNames.joints_silicone},
    {code: 'depose_demolition', value: t.rawData.prestationNames.depose_demolition},
    {code: 'preparation_surfaces', value: t.rawData.prestationNames.preparation_surfaces},
    {code: 'seuils_plinthes', value: t.rawData.prestationNames.seuils_plinthes},
    {code: 'douche_italienne', value: t.rawData.prestationNames.douche_italienne},
    {code: 'escalier_marbre', value: t.rawData.prestationNames.escalier_marbre},
    {code: 'terrasse_exterieure', value: t.rawData.prestationNames.terrasse_exterieure},
    {code: 'main_oeuvre', value: t.rawData.prestationNames.main_oeuvre},
    {code: 'transport_deplacement', value: t.rawData.prestationNames.transport_deplacement},
    {code: 'autre', value: t.rawData.prestationNames.autre},
  ],

  prestationUniteItemsList: [
    {code: 'm2', value: t.rawData.prestationUnits.m2},
    {code: 'ml', value: t.rawData.prestationUnits.ml},
    {code: 'm3', value: t.rawData.prestationUnits.m3},
    {code: 'unite', value: t.rawData.prestationUnits.unite},
    {code: 'forfait', value: t.rawData.prestationUnits.forfait},
    {code: 'heure', value: t.rawData.prestationUnits.heure},
    {code: 'jour', value: t.rawData.prestationUnits.jour},
    {code: 'kg', value: t.rawData.prestationUnits.kg},
  ],

  contractCategoryItemsList: [
    {code: 'standard', value: t.rawData.contractCategories.standard},
    {code: 'sous_traitance', value: t.rawData.contractCategories.sous_traitance},
  ],

  stLotTypeItemsList: [
    {code: 'gros_oeuvre', value: t.rawData.stLotTypes.gros_oeuvre},
    {code: 'electricite', value: t.rawData.stLotTypes.electricite},
    {code: 'plomberie', value: t.rawData.stLotTypes.plomberie},
    {code: 'menuiserie_alu', value: t.rawData.stLotTypes.menuiserie_alu},
    {code: 'menuiserie_bois', value: t.rawData.stLotTypes.menuiserie_bois},
    {code: 'carrelage', value: t.rawData.stLotTypes.carrelage},
    {code: 'peinture', value: t.rawData.stLotTypes.peinture},
    {code: 'etancheite', value: t.rawData.stLotTypes.etancheite},
    {code: 'ascenseur', value: t.rawData.stLotTypes.ascenseur},
    {code: 'platre', value: t.rawData.stLotTypes.platre},
    {code: 'ferronnerie', value: t.rawData.stLotTypes.ferronnerie},
    {code: 'vrd', value: t.rawData.stLotTypes.vrd},
    {code: 'climatisation', value: t.rawData.stLotTypes.climatisation},
    {code: 'cuisine', value: t.rawData.stLotTypes.cuisine},
  ],

  stProjetTypeItemsList: [
    {code: 'immeuble', value: t.rawData.stProjectTypes.immeuble},
    {code: 'villa', value: t.rawData.stProjectTypes.villa},
    {code: 'commercial', value: t.rawData.stProjectTypes.commercial},
    {code: 'industriel', value: t.rawData.stProjectTypes.industriel},
    {code: 'renovation', value: t.rawData.stProjectTypes.renovation},
    {code: 'autre', value: t.rawData.stProjectTypes.autre},
  ],

  stFormeJuridiqueItemsList: [
    {code: 'SARL', value: t.rawData.stLegalForms.SARL},
    {code: 'SA', value: t.rawData.stLegalForms.SA},
    {code: 'SARLAU', value: t.rawData.stLegalForms.SARLAU},
    {code: 'SNC', value: t.rawData.stLegalForms.SNC},
    {code: 'auto_entrepreneur', value: t.rawData.stLegalForms.auto_entrepreneur},
    {code: 'personne_physique', value: t.rawData.stLegalForms.personne_physique},
  ],

  stTypePrixItemsList: [
    {code: 'forfaitaire', value: t.rawData.stPriceTypes.forfaitaire},
    {code: 'unitaire', value: t.rawData.stPriceTypes.unitaire},
    {code: 'regie', value: t.rawData.stPriceTypes.regie},
  ],

  stDelaiUnitItemsList: [
    {code: 'mois', value: t.rawData.stDelayUnits.mois},
    {code: 'semaines', value: t.rawData.stDelayUnits.semaines},
    {code: 'jours', value: t.rawData.stDelayUnits.jours},
  ],

  dureeEstimeeUniteItemsList: [
    {code: 'jours', value: t.rawData.durationUnits.jours},
    {code: 'mois', value: t.rawData.durationUnits.mois},
  ],

  stClausesActivesList: [
    {key: 'tConfid', label: t.rawData.stActiveClauses.tConfid},
    {key: 'tNonConc', label: t.rawData.stActiveClauses.tNonConc},
    {key: 'tNonDeb', label: t.rawData.stActiveClauses.tNonDeb},
    {key: 'tCascade', label: t.rawData.stActiveClauses.tCascade},
    {key: 'tEnviro', label: t.rawData.stActiveClauses.tEnviro},
    {key: 'tPI', label: t.rawData.stActiveClauses.tPI},
    {key: 'tExclus', label: t.rawData.stActiveClauses.tExclus},
    {key: 'tRevision', label: t.rawData.stActiveClauses.tRevision},
    {key: 'tTRC', label: t.rawData.stActiveClauses.tTRC},
    {key: 'tMediat', label: t.rawData.stActiveClauses.tMediat},
    {key: 'tAnnexe', label: t.rawData.stActiveClauses.tAnnexe},
  ],
});
