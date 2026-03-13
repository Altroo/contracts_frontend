'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ApiErrorResponseType, ResponseDataInterface, SessionProps } from '@/types/_initTypes';
import {
	Alert,
	Box,
	Card,
	CardContent,
	Divider,
	InputAdornment,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
	Button,
	ToggleButton,
	ToggleButtonGroup,
	IconButton,
	Tooltip,
	Chip,
	Checkbox,
	FormControlLabel,
} from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Assignment as AssignmentIcon,
	Person as PersonIcon,
	Build as BuildIcon,
	AttachMoney as AttachMoneyIcon,
	Gavel as GavelIcon,
	Description as DescriptionIcon,
	Fingerprint as FingerprintIcon,
	CalendarToday as CalendarTodayIcon,
	LocationOn as LocationOnIcon,
	Phone as PhoneIcon,
	Email as EmailIcon,
	Home as HomeIcon,
	Badge as BadgeIcon,
	Straighten as StraightenIcon,
	Timer as TimerIcon,
	Notes as NotesIcon,
	Edit as EditIcon,
	Add as AddIcon,
	Warning as WarningIcon,
	Business as BusinessIcon,
	Delete as DeleteIcon,
	Plumbing as PlumbingIcon,
	Shield as ShieldIcon,
	Percent as PercentIcon,
	Flag as FlagIcon,
	Lock as LockIcon,
	Inventory as InventoryIcon,
	WaterDrop as WaterDropIcon,
	ShoppingCart as ShoppingCartIcon,
	Category as CategoryIcon,
	AccountBalance as AccountBalanceIcon,
	Checklist as ChecklistIcon,
	Architecture as ArchitectureIcon,
	Attachment as AttachmentIcon,
	PlaylistAddCheck as PlaylistAddCheckIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { setFormikAutoErrors, getLabelForKey } from '@/utils/helpers';
import {
	contractStatutItemsList as statutItems,
	typeContratItemsList as typeContratItems,
	deviseItemsList as deviseItems,
	confidentialiteItemsList as confidentialiteItems,
	companyItemsList,
	typeBienItemsList,
	fournituresItemsList,
	eauElectriciteItemsList,
	garantieUniteItemsList,
	garantieTypeItemsList,
	clauseResiliationItemsList,
	prestationNomItemsList,
	prestationUniteItemsList,
	modePaiementTexteItemsList,
	clientQualiteItemsList,
	garantieItemsList,
	tribunalItemsList,
	contractCategoryItemsList,
	stLotTypeItemsList,
	stFormeJuridiqueItemsList,
	stTypePrixItemsList,
	stDelaiUnitItemsList,
	stClausesActivesList,
} from '@/utils/rawData';
import { CONTRACTS_LIST, CONTRACTS_VIEW } from '@/utils/routes';
import { useRouter } from 'next/navigation';
import { useToast } from '@/utils/hooks';
import { useAddContractMutation, useEditContractMutation, useGetContractQuery, useGetCodeReferenceQuery, useGetProjectsListQuery } from '@/store/services/contract';
import { contractSchema, bluelineRequired, casaDiLussoRequired, stRequired } from '@/utils/formValidationSchemas';
import { INPUT_REQUIRED } from '@/utils/formValidationErrorMessages';
import { textInputTheme, customDropdownTheme, gridInputTheme, customGridDropdownTheme } from '@/utils/themes';
import { formatLocalDate } from '@/utils/helpers';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import CustomDropDownSelect from '@/components/formikElements/customDropDownSelect/customDropDownSelect';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import type { ContractFormValuesType, ContractPrestationType, ContractCompanyType, ContractCategoryType, ContractTrancheType, STTrancheType } from '@/types/contractTypes';
import type { SelectChangeEvent } from '@mui/material/Select';
import { getAccessTokenFromSession } from '@/store/session';
import Styles from '@/styles/dashboard/dashboard.module.sass';
import { Protected } from '@/components/layouts/protected/protected';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';

const inputTheme = textInputTheme();
const gridCellInputTheme = gridInputTheme();
const gridCellDropdownTheme = customGridDropdownTheme();
const ECHEANCIER_TOTAL_ERROR = 'Le total des pourcentages de l\'échéancier doit être égal à 100%.';

const getTrancheTotal = (tranches?: Array<{ pourcentage: number }>) =>
	(tranches ?? []).reduce((sum, tranche) => sum + Number(tranche.pourcentage || 0), 0);

const hasValidTrancheTotal = (tranches?: Array<{ pourcentage: number }>) => Math.abs(getTrancheTotal(tranches) - 100) < 0.001;

type FormikContentProps = {
	token: string | undefined;
	id?: number;
};

const FormikContent: React.FC<FormikContentProps> = (props: FormikContentProps) => {
	const { token, id } = props;
	const { onSuccess, onError } = useToast();
	const isEditMode = id !== undefined;
	const theme = useTheme();
	const router = useRouter();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const {
		data: rawData,
		isLoading: isDataLoading,
		error: dataError,
	} = useGetContractQuery({ id: id! }, { skip: !isEditMode || !token });

	const {
		data: generatedCodeData,
		isLoading: isCodeLoading,
	} = useGetCodeReferenceQuery(undefined, { skip: !token || isEditMode });

	const [addContract, { isLoading: isAddLoading, error: addError }] = useAddContractMutation();
	const [editContract, { isLoading: isEditLoading, error: editError }] = useEditContractMutation();

	const {
		data: projectsList,
	} = useGetProjectsListQuery({ company: 'casa_di_lusso' }, { skip: !token });

	const error = isEditMode ? dataError || editError : addError;
	const axiosError: ResponseDataInterface<ApiErrorResponseType> | undefined = useMemo(
		() => (error ? (error as ResponseDataInterface<ApiErrorResponseType>) : undefined),
		[error],
	);

	const [isPending, setIsPending] = useState(false);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

	const today = formatLocalDate(new Date());
	const initialCompany = (rawData?.company as ContractCompanyType) ?? 'casa_di_lusso';
	const initialContractCategory = (rawData?.contract_category as ContractCategoryType) ?? 'standard';
	const initialIsBlueline = initialCompany === 'blueline_works';
	const initialIsST = initialCompany === 'casa_di_lusso' && initialContractCategory === 'sous_traitance';
	const initialIsCDL = !initialIsBlueline && !initialIsST;
	const initialPrestations = rawData?.prestations?.length
		? rawData.prestations
		: initialIsBlueline
			? [{ nom: '', description: '', quantite: 0, unite: 'm2', prix_unitaire: 0 }]
			: [];
	const initialTranches = rawData?.tranches?.length
		? rawData.tranches
		: initialIsCDL
			? [{ label: '', pourcentage: 0 }]
			: [];
	const initialStTranches = rawData?.st_tranches?.length
		? rawData.st_tranches
		: initialIsST
			? [{ label: '', pourcentage: 0 }]
			: [];

	const formik = useFormik<ContractFormValuesType>({
		initialValues: {
			company: initialCompany,
			contract_category: initialContractCategory,
			numero_contrat: isEditMode ? (rawData?.numero_contrat ?? '') : (generatedCodeData?.numero_contrat ?? ''),
			date_contrat: isEditMode ? (rawData?.date_contrat ?? today) : today,
			statut: rawData?.statut ?? 'Brouillon',
			type_contrat: rawData?.type_contrat ?? 'travaux_finition',
			ville_signature: rawData?.ville_signature ?? 'Tanger',
			client_nom: rawData?.client_nom ?? '',
			client_cin: rawData?.client_cin ?? '',
			client_qualite: rawData?.client_qualite ?? '',
			client_adresse: rawData?.client_adresse ?? '',
			client_tel: rawData?.client_tel ?? '',
			client_email: rawData?.client_email ?? '',
			type_bien: rawData?.type_bien ?? '',
			surface: rawData?.surface != null ? String(rawData.surface) : '',
			adresse_travaux: rawData?.adresse_travaux ?? '',
			date_debut: rawData?.date_debut ?? today,
			duree_estimee: rawData?.duree_estimee ?? '',
			description_travaux: rawData?.description_travaux ?? '',
			montant_ht: rawData?.montant_ht != null ? String(rawData.montant_ht) : '',
			devise: rawData?.devise ?? 'MAD',
			tva: rawData?.tva != null ? String(rawData.tva) : '20',
			penalite_retard: rawData?.penalite_retard != null ? String(rawData.penalite_retard) : '100',
			garantie: rawData?.garantie ?? '1 an',
			tribunal: rawData?.tribunal ?? 'Tanger',
			responsable_projet: rawData?.responsable_projet ?? '',
			confidentialite: rawData?.confidentialite ?? 'CONFIDENTIEL',
			mode_paiement_texte: rawData?.mode_paiement_texte ?? '',
			rib: rawData?.rib ?? '',
			/* ── Casa Di Lusso fields ── */
			services: rawData?.services ?? [],
			conditions_acces: rawData?.conditions_acces ?? '',
			tranches: initialTranches,
			delai_retard: rawData?.delai_retard != null ? String(rawData.delai_retard) : '5',
			frais_redemarrage: rawData?.frais_redemarrage != null ? String(rawData.frais_redemarrage) : '',
			delai_reserves: rawData?.delai_reserves != null ? String(rawData.delai_reserves) : '7',
			clauses_actives: rawData?.clauses_actives ?? [],
			clause_spec: rawData?.clause_spec ?? '',
			exclusions: rawData?.exclusions ?? '',
			architecte: rawData?.architecte ?? '',
			version_document: rawData?.version_document ?? 'v1.0 \u2013 D\u00e9finitif',
			annexes: rawData?.annexes ?? '',
			/* ── Blueline fields ── */
			client_ville: rawData?.client_ville ?? '',
			client_cp: rawData?.client_cp ?? '',
			chantier_ville: rawData?.chantier_ville ?? '',
			chantier_etage: rawData?.chantier_etage ?? '',
			prestations: initialPrestations,
			fournitures: rawData?.fournitures ?? '',
			materiaux_detail: rawData?.materiaux_detail ?? '',
			eau_electricite: rawData?.eau_electricite ?? '',
			garantie_nb: rawData?.garantie_nb != null ? String(rawData.garantie_nb) : '',
			garantie_unite: rawData?.garantie_unite ?? '',
			garantie_type: rawData?.garantie_type ?? '',
			exclusions_garantie: rawData?.exclusions_garantie ?? '',
			acompte: rawData?.acompte != null ? String(rawData.acompte) : '',
			tranche2: rawData?.tranche2 != null ? String(rawData.tranche2) : '',
			clause_resiliation: rawData?.clause_resiliation ?? '',
			notes: rawData?.notes ?? '',
			/* ── Sous-Traitance (CDL) fields ── */
			st_projet: rawData?.st_projet != null ? String(rawData.st_projet) : '',
			st_name: rawData?.st_name ?? '',
			st_forme: rawData?.st_forme ?? '',
			st_capital: rawData?.st_capital ?? '',
			st_rc: rawData?.st_rc ?? '',
			st_ice: rawData?.st_ice ?? '',
			st_if: rawData?.st_if ?? '',
			st_cnss: rawData?.st_cnss ?? '',
			st_addr: rawData?.st_addr ?? '',
			st_rep: rawData?.st_rep ?? '',
			st_cin: rawData?.st_cin ?? '',
			st_qualite: rawData?.st_qualite ?? '',
			st_tel: rawData?.st_tel ?? '',
			st_email: rawData?.st_email ?? '',
			st_rib: rawData?.st_rib ?? '',
			st_banque: rawData?.st_banque ?? '',
			st_lot_type: rawData?.st_lot_type ?? '',
			st_lot_description: rawData?.st_lot_description ?? '',
			st_type_prix: rawData?.st_type_prix ?? 'forfaitaire',
			st_retenue_garantie: rawData?.st_retenue_garantie != null ? String(rawData.st_retenue_garantie) : '10',
			st_avance: rawData?.st_avance != null ? String(rawData.st_avance) : '',
			st_penalite_taux: rawData?.st_penalite_taux != null ? String(rawData.st_penalite_taux) : '0.5',
			st_plafond_penalite: rawData?.st_plafond_penalite != null ? String(rawData.st_plafond_penalite) : '10',
			st_delai_paiement: rawData?.st_delai_paiement != null ? String(rawData.st_delai_paiement) : '30',
			st_tranches: initialStTranches,
			st_delai_val: rawData?.st_delai_val != null ? String(rawData.st_delai_val) : '',
			st_delai_unit: rawData?.st_delai_unit ?? 'mois',
			st_garantie_mois: rawData?.st_garantie_mois != null ? String(rawData.st_garantie_mois) : '12',
			st_delai_reserves: rawData?.st_delai_reserves != null ? String(rawData.st_delai_reserves) : '30',
			st_delai_med: rawData?.st_delai_med != null ? String(rawData.st_delai_med) : '30',
			st_clauses_actives: rawData?.st_clauses_actives ?? [],
			st_observations: rawData?.st_observations ?? '',
			globalError: '',
		},
		enableReinitialize: true,
		validationSchema: toFormikValidationSchema(contractSchema),
		validate: (values) => {
			const errors: Partial<Record<string, string>> = {};
			const isEmpty = (val: unknown) =>
				val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (typeof val === 'number' && Number.isNaN(val));
			const isST = values.company === 'casa_di_lusso' && values.contract_category === 'sous_traitance';
			// client_nom: required for all companies except ST (ST has no traditional client)
			if (!isST && isEmpty(values.client_nom)) {
				errors.client_nom = INPUT_REQUIRED;
			}
			if (values.company === 'blueline_works') {
				bluelineRequired.forEach((key) => {
					if (isEmpty(values[key as keyof ContractFormValuesType])) {
						errors[key] = INPUT_REQUIRED;
					}
				});
			} else if (isST) {
				stRequired.forEach((key) => {
					if (isEmpty(values[key as keyof ContractFormValuesType])) {
						errors[key] = INPUT_REQUIRED;
					}
				});
			} else if (values.company === 'casa_di_lusso') {
				casaDiLussoRequired.forEach((key) => {
					if (isEmpty(values[key as keyof ContractFormValuesType])) {
						errors[key] = INPUT_REQUIRED;
					}
				});
			}
			return errors;
		},
		onSubmit: async (data, { setFieldError }) => {
			setHasAttemptedSubmit(true);
			setIsPending(true);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { globalError, ...fields } = data;
			const isBlueline = fields.company === 'blueline_works';
			const isST = fields.company === 'casa_di_lusso' && fields.contract_category === 'sous_traitance';
			const payload: Record<string, unknown> = {
				...fields,
				montant_ht: fields.montant_ht !== '' && fields.montant_ht != null ? parseFloat(fields.montant_ht) : undefined,
				surface: fields.surface !== '' && fields.surface != null ? parseFloat(fields.surface) : undefined,
				tva: fields.tva !== '' && fields.tva != null ? parseFloat(fields.tva) : 0,
				penalite_retard: fields.penalite_retard !== '' && fields.penalite_retard != null ? parseFloat(fields.penalite_retard) : 0,
				mode_paiement_texte: fields.mode_paiement_texte || null,
				rib: fields.rib || null,
				/* CDL numeric conversions */
				delai_retard: !isBlueline && !isST && fields.delai_retard ? parseInt(fields.delai_retard, 10) : isBlueline || isST ? null : 5,
				frais_redemarrage: !isBlueline && !isST && fields.frais_redemarrage ? parseFloat(fields.frais_redemarrage) : null,
				delai_reserves: !isBlueline && !isST && fields.delai_reserves ? parseInt(fields.delai_reserves, 10) : isBlueline || isST ? null : 7,
				services: !isBlueline && !isST ? fields.services : [],
				tranches: !isBlueline && !isST ? fields.tranches : [],
				clauses_actives: !isBlueline && !isST ? fields.clauses_actives : [],
				/* Blueline numeric conversions */
				garantie_nb: isBlueline && fields.garantie_nb ? parseInt(fields.garantie_nb, 10) : null,
				acompte: isBlueline && fields.acompte ? parseFloat(fields.acompte) : null,
				tranche2: isBlueline && fields.tranche2 ? parseFloat(fields.tranche2) : null,
				prestations: isBlueline ? fields.prestations : [],
				/* ST numeric conversions */
				st_projet: isST && fields.st_projet ? parseInt(fields.st_projet, 10) : null,
				st_retenue_garantie: isST && fields.st_retenue_garantie ? parseFloat(fields.st_retenue_garantie) : null,
				st_avance: isST && fields.st_avance ? parseFloat(fields.st_avance) : null,
				st_penalite_taux: isST && fields.st_penalite_taux ? parseFloat(fields.st_penalite_taux) : null,
				st_plafond_penalite: isST && fields.st_plafond_penalite ? parseFloat(fields.st_plafond_penalite) : null,
				st_delai_paiement: isST && fields.st_delai_paiement ? parseInt(fields.st_delai_paiement, 10) : null,
				st_tranches: isST ? fields.st_tranches : [],
				st_delai_val: isST && fields.st_delai_val ? parseInt(fields.st_delai_val, 10) : null,
				st_garantie_mois: isST && fields.st_garantie_mois ? parseInt(fields.st_garantie_mois, 10) : null,
				st_delai_reserves: isST && fields.st_delai_reserves ? parseInt(fields.st_delai_reserves, 10) : null,
				st_delai_med: isST && fields.st_delai_med ? parseInt(fields.st_delai_med, 10) : null,
				st_clauses_actives: isST ? fields.st_clauses_actives : [],
			};
			/* Clear Blueline fields when not Blueline */
			if (!isBlueline) {
				payload.client_ville = '';
				payload.client_cp = '';
				payload.chantier_ville = '';
				payload.chantier_etage = '';
				payload.prestations = [];
				payload.fournitures = '';
				payload.materiaux_detail = '';
				payload.eau_electricite = '';
				payload.garantie_nb = null;
				payload.garantie_unite = '';
				payload.garantie_type = '';
				payload.exclusions_garantie = '';
				payload.acompte = null;
				payload.tranche2 = null;
				payload.clause_resiliation = '';
				payload.notes = '';
			}
			/* Clear CDL standard fields when Blueline or ST */
			if (isBlueline || isST) {
				payload.services = [];
				payload.conditions_acces = '';
				payload.tranches = [];
				payload.delai_retard = 5;
				payload.frais_redemarrage = null;
				payload.delai_reserves = 7;
				payload.clauses_actives = [];
				payload.clause_spec = null;
				payload.exclusions = null;
				payload.architecte = null;
				payload.version_document = 'v1.0 \u2013 D\u00e9finitif';
				payload.annexes = null;
			}
			/* For ST: send null instead of empty string for optional client_nom */
			if (isST && !fields.client_nom) {
				payload.client_nom = null;
			}
			/* Clear ST fields when not ST */
			if (!isST) {
				payload.st_projet = null;
				payload.st_name = '';
				payload.st_forme = '';
				payload.st_capital = '';
				payload.st_rc = '';
				payload.st_ice = '';
				payload.st_if = '';
				payload.st_cnss = '';
				payload.st_addr = '';
				payload.st_rep = '';
				payload.st_cin = '';
				payload.st_qualite = '';
				payload.st_tel = '';
				payload.st_email = '';
				payload.st_rib = '';
				payload.st_banque = '';
				payload.st_lot_type = '';
				payload.st_lot_description = '';
				payload.st_type_prix = '';
				payload.st_retenue_garantie = null;
				payload.st_avance = null;
				payload.st_penalite_taux = null;
				payload.st_plafond_penalite = null;
				payload.st_delai_paiement = null;
				payload.st_tranches = [];
				payload.st_delai_val = null;
				payload.st_delai_unit = '';
				payload.st_garantie_mois = null;
				payload.st_delai_reserves = null;
				payload.st_delai_med = null;
				payload.st_clauses_actives = [];
				payload.st_observations = '';
			}
			try {
				if (isEditMode) {
					await editContract({ id: id!, data: payload }).unwrap();
					onSuccess('Le contrat a été mis à jour avec succès.');
					router.push(CONTRACTS_VIEW(id!));
				} else {
					const result = await addContract({ data: payload }).unwrap();
					onSuccess('Le contrat a été créé avec succès.');
					router.push(CONTRACTS_VIEW(result.id));
				}
			} catch (e) {
				if (isEditMode) {
					onError('Échec de la mise à jour du contrat.');
				} else {
					onError('Échec de la création du contrat.');
				}
				setFormikAutoErrors({ e, setFieldError });
			} finally {
				setIsPending(false);
			}
		},
	});

	const fieldLabels = useMemo<Record<string, string>>(
		() => ({
			company: 'Société',
			contract_category: 'Catégorie de contrat',
			numero_contrat: 'Numéro de contrat',
			date_contrat: 'Date du contrat',
			statut: 'Statut',
			type_contrat: 'Type de contrat',
			ville_signature: 'Ville de signature',
			client_nom: 'Nom du client',
			client_cin: 'CIN/ICE',
			client_qualite: 'Qualité',
			client_adresse: 'Adresse client',
			client_tel: 'Téléphone',
			client_email: 'Email',
			type_bien: 'Type de bien',
			surface: 'Surface',
			adresse_travaux: 'Adresse des travaux',
			date_debut: 'Date de début',
			duree_estimee: 'Durée estimée',
			description_travaux: 'Description des travaux',
			montant_ht: 'Montant HT',
			devise: 'Devise',
			tva: 'TVA',
			penalite_retard: 'Pénalité de retard',
			garantie: 'Garantie',
			tribunal: 'Tribunal compétent',
			responsable_projet: 'Responsable projet',
			confidentialite: 'Confidentialité',
			mode_paiement_texte: 'Mode de paiement',
			rib: 'RIB / Coordonnées bancaires',
			services: 'Services convenus',
			conditions_acces: 'Conditions d\u2019acc\u00e8s',
			tranches: '\u00c9ch\u00e9ancier de paiement',
			delai_retard: 'D\u00e9lai de retard tol\u00e9r\u00e9',
			frais_redemarrage: 'Frais de red\u00e9marrage',
			delai_reserves: 'D\u00e9lai r\u00e9serves',
			clauses_actives: 'Clauses actives',
			clause_spec: 'Clauses sp\u00e9cifiques',
			exclusions: 'Exclusions contractuelles',
			architecte: 'Architecte / Designer',
			version_document: 'Version du document',
			annexes: 'Annexes',
			client_ville: 'Ville du client',
			client_cp: 'Code postal du client',
			chantier_ville: 'Ville du chantier',
			chantier_etage: 'Étage du chantier',
			prestations: 'Prestations',
			fournitures: 'Fournitures',
			materiaux_detail: 'Détail matériaux',
			eau_electricite: 'Eau & Électricité',
			garantie_nb: 'Durée garantie',
			garantie_unite: 'Unité garantie',
			garantie_type: 'Type de garantie',
			exclusions_garantie: 'Exclusions garantie',
			acompte: 'Acompte (%)',
			tranche2: 'Tranche 2 (%)',
			clause_resiliation: 'Clause de résiliation',
			notes: 'Notes',
			/* ST fields */
			st_projet: 'Architecte/Designer',
			st_name: 'Raison sociale du sous-traitant',
			st_forme: 'Forme juridique',
			st_capital: 'Capital',
			st_rc: 'Registre du commerce',
			st_ice: 'ICE',
			st_if: 'Identifiant fiscal',
			st_cnss: 'CNSS',
			st_addr: 'Adresse du sous-traitant',
			st_rep: 'Représentant légal',
			st_cin: 'CIN du représentant',
			st_qualite: 'Qualité du représentant',
			st_tel: 'Téléphone du sous-traitant',
			st_email: 'Email du sous-traitant',
			st_rib: 'RIB du sous-traitant',
			st_banque: 'Banque',
			st_lot_type: 'Type de lot',
			st_lot_description: 'Description du lot',
			st_type_prix: 'Type de prix',
			st_retenue_garantie: 'Retenue de garantie (%)',
			st_avance: 'Avance (%)',
			st_penalite_taux: 'Taux de pénalité (‰/jour)',
			st_plafond_penalite: 'Plafond pénalité (%)',
			st_delai_paiement: 'Délai de paiement (jours)',
			st_tranches: 'Échéancier ST',
			st_delai_val: 'Délai d\'exécution',
			st_delai_unit: 'Unité de délai',
			st_garantie_mois: 'Garantie (mois)',
			st_delai_reserves: 'Délai levée réserves (jours)',
			st_delai_med: 'Délai mise en demeure (jours)',
			st_clauses_actives: 'Clauses actives ST',
			st_observations: 'Observations',
			globalError: 'Erreur globale',
		}),
		[],
	);

	/* ── CDL: Available services and clauses ── */
	const cdlServiceOptions = useMemo(() => [
		'Design et conception',
		'Démolition et gros œuvre intérieur',
		'Maçonnerie et structure',
		'Faux plafonds et habillages',
		'Revêtements de sols',
		'Revêtements muraux',
		'Menuiserie bois et sur mesure',
		'Menuiserie aluminium et PVC',
		'Métallerie et ferronnerie',
		'Vitrerie et miroiterie',
		'Plomberie et sanitaire',
		'Électricité',
		'Domotique et maison intelligente',
		'Climatisation, chauffage et ventilation (CVC)',
		'Isolation thermique et acoustique',
		'Peinture et finitions',
		'Plâtrerie et staff',
		'Carrelage et revêtement céramique',
		'Marbre et pierre naturelle',
		'Cuisine',
		'Salle de bain et spa',
		'Dressing et rangement',
		'Escaliers',
		'Piscine et espace aquatique',
		'Aménagement extérieur et paysager',
		'Mobilier et décoration',
		'Ascenseurs et monte-charge',
		'Sécurité et protection incendie',
		'Traitement et étanchéité',
		'Coordination et gestion de projet',
	], []);

	const cdlClauseOptions = useMemo(() => [
		{ key: 'c-comportement', label: 'Clause de comportement' },
		{ key: 'c-prop-intel', label: 'Propriété intellectuelle' },
		{ key: 'c-image', label: 'Droit à l\'image' },
		{ key: 'c-confidential', label: 'Confidentialité' },
		{ key: 'c-sous-traiter', label: 'Droit de sous-traitance' },
		{ key: 'c-materiau-prix', label: 'Révision des prix matériaux' },
		{ key: 'c-force-maj', label: 'Force majeure' },
		{ key: 'c-abandon-chant', label: 'Abandon de chantier' },
		{ key: 'c-non-debauch', label: 'Non-débauchage du personnel' },
		{ key: 'c-anti-litige', label: 'Médiation & règlement des litiges' },
	], []);

	/* ── CDL: Tranches helpers ── */
	const addTranche = useCallback(() => {
		const current = formik.values.tranches ?? [];
		formik.setFieldValue('tranches', [...current, { label: '', pourcentage: 0 }]);
	}, [formik]);

	const removeTranche = useCallback((index: number) => {
		const current = formik.values.tranches ?? [];
		formik.setFieldValue('tranches', current.filter((_, i) => i !== index));
	}, [formik]);

	const updateTranche = useCallback((index: number, field: keyof ContractTrancheType, value: string | number) => {
		const current = [...(formik.values.tranches ?? [])];
		current[index] = { ...current[index], [field]: value };
		formik.setFieldValue('tranches', current);
	}, [formik]);

	/* ── CDL: Services toggle ── */
	const toggleService = useCallback((svc: string) => {
		const current = formik.values.services ?? [];
		if (current.includes(svc)) {
			formik.setFieldValue('services', current.filter((s) => s !== svc));
		} else {
			formik.setFieldValue('services', [...current, svc]);
		}
	}, [formik]);

	/* ── CDL: Clauses toggle ── */
	const toggleClause = useCallback((key: string) => {
		const current = formik.values.clauses_actives ?? [];
		if (current.includes(key)) {
			formik.setFieldValue('clauses_actives', current.filter((c) => c !== key));
		} else {
			formik.setFieldValue('clauses_actives', [...current, key]);
		}
	}, [formik]);

	/* ── ST: Tranches helpers ── */
	const addStTranche = useCallback(() => {
		const current = formik.values.st_tranches ?? [];
		formik.setFieldValue('st_tranches', [...current, { label: '', pourcentage: 0 }]);
	}, [formik]);

	const removeStTranche = useCallback((index: number) => {
		const current = formik.values.st_tranches ?? [];
		formik.setFieldValue('st_tranches', current.filter((_: STTrancheType, i: number) => i !== index));
	}, [formik]);

	const updateStTranche = useCallback((index: number, field: keyof STTrancheType, value: string | number) => {
		const current = [...(formik.values.st_tranches ?? [])];
		current[index] = { ...current[index], [field]: value };
		formik.setFieldValue('st_tranches', current);
	}, [formik]);

	/* ── ST: Clauses toggle ── */
	const toggleStClause = useCallback((key: string) => {
		const current = formik.values.st_clauses_actives ?? [];
		if (current.includes(key)) {
			formik.setFieldValue('st_clauses_actives', current.filter((c: string) => c !== key));
		} else {
			formik.setFieldValue('st_clauses_actives', [...current, key]);
		}
	}, [formik]);

	const validationErrors = useMemo(() => {
		const errors: Record<string, string> = {};
		const currentCompany = formik.values.company;
		const currentCategory = formik.values.contract_category;
		const currentTranches = formik.values.tranches ?? [];
		const currentStTranches = formik.values.st_tranches ?? [];
		const blFields = new Set(['prestations', 'fournitures', 'eau_electricite', 'acompte', 'tranche2', 'clause_resiliation', 'client_ville', 'client_cp', 'chantier_ville', 'chantier_etage', 'garantie_nb', 'garantie_unite', 'garantie_type', 'exclusions_garantie', 'materiaux_detail', 'notes']);
		const cdlFields = new Set(['type_contrat', 'services', 'tranches', 'delai_retard', 'frais_redemarrage', 'delai_reserves', 'clauses_actives', 'clause_spec', 'exclusions', 'architecte', 'version_document', 'annexes', 'conditions_acces']);
		const stFields = new Set(['st_projet', 'st_name', 'st_forme', 'st_capital', 'st_rc', 'st_ice', 'st_if', 'st_cnss', 'st_addr', 'st_rep', 'st_cin', 'st_qualite', 'st_tel', 'st_email', 'st_rib', 'st_banque', 'st_lot_type', 'st_lot_description', 'st_type_prix', 'st_retenue_garantie', 'st_avance', 'st_penalite_taux', 'st_plafond_penalite', 'st_delai_paiement', 'st_tranches', 'st_delai_val', 'st_delai_unit', 'st_garantie_mois', 'st_delai_reserves', 'st_delai_med', 'st_clauses_actives', 'st_observations']);
		const currentIsST = currentCompany === 'casa_di_lusso' && currentCategory === 'sous_traitance';
		if (hasAttemptedSubmit) {
			Object.entries(formik.errors).forEach(([key, value]) => {
				if (key === 'globalError') return;
				/* Skip errors for the other company's / category's fields */
				if (currentCompany === 'casa_di_lusso' && blFields.has(key)) return;
				if (currentCompany === 'blueline_works' && (cdlFields.has(key) || stFields.has(key))) return;
				if (currentIsST && cdlFields.has(key)) return;
				if (!currentIsST && stFields.has(key)) return;
				if (typeof value === 'string') {
					errors[key] = value;
				}
			});
			/* Per-cell prestation errors (array) — show only for Blueline */
			if (currentCompany === 'blueline_works' && Array.isArray(formik.errors.prestations)) {
				const hasCellErrors = (formik.errors.prestations as unknown[]).some(
					(rowErr) => rowErr && typeof rowErr === 'object' && Object.keys(rowErr as object).length > 0,
				);
				if (hasCellErrors) errors['prestations'] = 'Veuillez corriger les erreurs dans les prestations';
			}
			/* Per-cell CDL tranche errors (array) — show only for standard CDL */
			if (!currentIsST && currentCompany === 'casa_di_lusso' && Array.isArray(formik.errors.tranches)) {
				const hasCellErrors = (formik.errors.tranches as unknown[]).some(
					(rowErr) => rowErr && typeof rowErr === 'object' && Object.keys(rowErr as object).length > 0,
				);
				if (!hasValidTrancheTotal(currentTranches)) {
					errors['tranches'] = ECHEANCIER_TOTAL_ERROR;
				} else if (hasCellErrors) {
					errors['tranches'] = 'Veuillez corriger les erreurs dans l\'échéancier de paiement';
				}
			}
			/* Per-cell ST tranche errors (array) — show only for ST */
			if (currentIsST && Array.isArray(formik.errors.st_tranches)) {
				const hasCellErrors = (formik.errors.st_tranches as unknown[]).some(
					(rowErr) => rowErr && typeof rowErr === 'object' && Object.keys(rowErr as object).length > 0,
				);
				if (!hasValidTrancheTotal(currentStTranches)) {
					errors['st_tranches'] = ECHEANCIER_TOTAL_ERROR;
				} else if (hasCellErrors) {
					errors['st_tranches'] = 'Veuillez corriger les erreurs dans les tranches ST';
				}
			}
		}
		return errors;
	}, [formik.errors, formik.values.company, formik.values.contract_category, formik.values.tranches, formik.values.st_tranches, hasAttemptedSubmit]);

	const hasValidationErrors = Object.keys(validationErrors).length > 0;
	const isLoading = isAddLoading || isEditLoading || isPending || (isEditMode && isDataLoading) || (!isEditMode && isCodeLoading);
	const shouldShowError = (axiosError?.status ?? 0) > 400 && !isLoading;

	/* ── helper: resolve display value for code-based dropdowns ── */
	const typeContratDisplay = typeContratItems.find((t) => t.code === formik.values.type_contrat)?.value ?? formik.values.type_contrat;

	const isBlueline = formik.values.company === 'blueline_works';
	const isST = formik.values.company === 'casa_di_lusso' && formik.values.contract_category === 'sous_traitance';
	const isCDL = !isBlueline && !isST;

	/* ── Required-field helpers ── */
	const isBluelineRequired = (field: string) => isBlueline && (bluelineRequired as readonly string[]).includes(field);
	const isCdlRequired = (field: string) => isCDL && (casaDiLussoRequired as readonly string[]).includes(field);
	const isStRequired = (field: string) => isST && (stRequired as readonly string[]).includes(field);
	const isRequired = (field: string) => isBluelineRequired(field) || isCdlRequired(field) || isStRequired(field);

	/* ── Stable ref so the effect below always sees the latest formik state ── */
	const formikRef = useRef(formik);
	useEffect(() => {
		formikRef.current = formik;
	});

	/* ── Auto-seed the required first row when the company/category changes ── */
	useEffect(() => {
		const { setFieldValue, values } = formikRef.current;
		if (isBlueline && !values.prestations?.length) {
			setFieldValue('prestations', [{ nom: '', description: '', quantite: 0, unite: 'm2', prix_unitaire: 0 }]);
		} else if (isST && !values.st_tranches?.length) {
			setFieldValue('st_tranches', [{ label: '', pourcentage: 0 }]);
		} else if (isCDL && !values.tranches?.length) {
			setFieldValue('tranches', [{ label: '', pourcentage: 0 }]);
		}
	}, [
		isBlueline,
		isST,
		isCDL,
		formik.values.prestations?.length,
		formik.values.st_tranches?.length,
		formik.values.tranches?.length,
	]);

	/* ── Prestations helpers ── */
	const addPrestation = useCallback(() => {
		const empty: ContractPrestationType = { nom: '', description: '', quantite: 0, unite: 'm2', prix_unitaire: 0 };
		const current = formik.values.prestations ?? [];
		formik.setFieldValue('prestations', [...current, { ...empty }]);
	}, [formik]);

	const removePrestation = useCallback((index: number) => {
		const current = formik.values.prestations ?? [];
		formik.setFieldValue('prestations', current.filter((_, i) => i !== index));
	}, [formik]);

	const updatePrestation = useCallback((index: number, field: keyof ContractPrestationType, value: string | number) => {
		const current = [...(formik.values.prestations ?? [])];
		current[index] = { ...current[index], [field]: value };
		formik.setFieldValue('prestations', current);
	}, [formik]);

	/* ── ST Tranche cell errors ── */
	const stTrancheCellErrors = useMemo(() => {
		const errors: Record<string, string> = {};
		const raw = formik.errors.st_tranches;
		if (Array.isArray(raw)) {
			raw.forEach((rowErr, i) => {
				if (rowErr && typeof rowErr === 'object') {
					Object.entries(rowErr as Record<string, string>).forEach(([field, msg]) => {
						errors[`${i}_${field}`] = msg;
					});
				}
			});
		}
		return errors;
	}, [formik.errors.st_tranches]);

	const trancheCellErrors = useMemo(() => {
		const errors: Record<string, string> = {};
		const raw = formik.errors.tranches;
		if (Array.isArray(raw)) {
			raw.forEach((rowErr, i) => {
				if (rowErr && typeof rowErr === 'object') {
					Object.entries(rowErr as Record<string, string>).forEach(([field, msg]) => {
						errors[`${i}_${field}`] = msg;
					});
				}
			});
		}
		return errors;
	}, [formik.errors.tranches]);

	const cdlTrancheTotalInvalid = hasAttemptedSubmit && isCDL && !hasValidTrancheTotal(formik.values.tranches);
	const stTrancheTotalInvalid = hasAttemptedSubmit && isST && !hasValidTrancheTotal(formik.values.st_tranches);

	/* ── Prestations DataGrid columns ── */
	const prestationCellErrors = useMemo(() => {
		const errors: Record<string, string> = {};
		const raw = formik.errors.prestations;
		if (Array.isArray(raw)) {
			raw.forEach((rowErr, i) => {
				if (rowErr && typeof rowErr === 'object') {
					Object.entries(rowErr as Record<string, string>).forEach(([field, msg]) => {
						errors[`${i}_${field}`] = msg;
					});
				}
			});
		}
		return errors;
	}, [formik.errors.prestations]);

	const prestationColumns: GridColDef[] = useMemo(() => [
		{
			field: 'nom',
			headerName: 'Désignation',
			flex: 1.5,
			minWidth: 150,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const p = (formik.values.prestations ?? [])[realIdx];
				if (!p) return null;
				const errKey = `${realIdx}_nom`;
				const hasError = hasAttemptedSubmit && !!prestationCellErrors[errKey];
				const errMsg = prestationCellErrors[errKey] ?? '';
				return (
					<Tooltip title={hasError ? errMsg : ''} arrow>
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
							<CustomDropDownSelect
								id={`prestations.${realIdx}.nom`}
								label=""
								items={prestationNomItemsList.map((i) => i.value)}
								value={prestationNomItemsList.find((i) => i.code === p.nom)?.value ?? p.nom}
								onChange={(e: SelectChangeEvent) => {
									const selected = prestationNomItemsList.find((i) => i.value === e.target.value);
									updatePrestation(realIdx, 'nom', selected?.code ?? e.target.value);
								}}
								size="small"
								theme={gridCellDropdownTheme}
								error={hasError}
							/>
						</Box>
					</Tooltip>
				);
			},
		},
		{
			field: 'description',
			headerName: 'Description',
			flex: 1.5,
			minWidth: 150,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const p = (formik.values.prestations ?? [])[realIdx];
				if (!p) return null;
				return (
					<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
						<CustomTextInput
							id={`prestations.${realIdx}.description`}
							type="text"
							label=""
							value={p.description}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePrestation(realIdx, 'description', e.target.value)}
							size="small"
							theme={gridCellInputTheme}
						/>
					</Box>
				);
			},
		},
		{
			field: 'quantite',
			headerName: 'Quantité',
			flex: 0.9,
			minWidth: 100,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const p = (formik.values.prestations ?? [])[realIdx];
				if (!p) return null;
				const errKey = `${realIdx}_quantite`;
				const hasError = hasAttemptedSubmit && !!prestationCellErrors[errKey];
				const errMsg = prestationCellErrors[errKey] ?? '';
				return (
					<Tooltip title={hasError ? errMsg : ''} arrow>
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
							<CustomTextInput
								id={`prestations.${realIdx}.quantite`}
								type="text"
								label=""
								value={String(p.quantite || '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) updatePrestation(realIdx, 'quantite', parseFloat(e.target.value.replace(',', '.')) || 0);
								}}
								size="small"
								theme={gridCellInputTheme}
								error={hasError}
							/>
						</Box>
					</Tooltip>
				);
			},
		},
		{
			field: 'unite',
			headerName: 'Unité',
			flex: 0.8,
			minWidth: 100,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const p = (formik.values.prestations ?? [])[realIdx];
				if (!p) return null;
				return (
					<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
						<CustomDropDownSelect
							id={`prestations.${realIdx}.unite`}
							label=""
							items={prestationUniteItemsList.map((i) => i.value)}
							value={prestationUniteItemsList.find((i) => i.code === p.unite)?.value ?? p.unite}
							onChange={(e: SelectChangeEvent) => {
								const selected = prestationUniteItemsList.find((i) => i.value === e.target.value);
								updatePrestation(realIdx, 'unite', selected?.code ?? e.target.value);
							}}
							size="small"
							theme={gridCellDropdownTheme}
						/>
					</Box>
				);
			},
		},
		{
			field: 'prix_unitaire',
			headerName: 'Prix unitaire',
			flex: 1.1,
			minWidth: 130,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const p = (formik.values.prestations ?? [])[realIdx];
				if (!p) return null;
				const errKey = `${realIdx}_prix_unitaire`;
				const hasError = hasAttemptedSubmit && !!prestationCellErrors[errKey];
				const errMsg = prestationCellErrors[errKey] ?? '';
				return (
					<Tooltip title={hasError ? errMsg : ''} arrow>
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
							<CustomTextInput
								id={`prestations.${realIdx}.prix_unitaire`}
								type="text"
								label=""
								value={String(p.prix_unitaire || '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) updatePrestation(realIdx, 'prix_unitaire', parseFloat(e.target.value.replace(',', '.')) || 0);
								}}
								size="small"
								theme={gridCellInputTheme}
								error={hasError}
								endIcon={<InputAdornment position="end">{formik.values.devise}</InputAdornment>}
							/>
						</Box>
					</Tooltip>
				);
			},
		},
		{
			field: 'total',
			headerName: 'Total',
			flex: 0.8,
			minWidth: 100,
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const p = (formik.values.prestations ?? [])[realIdx];
				if (!p) return null;
				return (
					<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
						<Typography variant="body2" fontFamily="Poppins">
							{(p.quantite * p.prix_unitaire).toLocaleString('fr-MA')} {formik.values.devise}
						</Typography>
					</Box>
				);
			},
		},
		{
			field: 'actions',
			headerName: '',
			flex: 0.4,
			minWidth: 50,
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const total = (formik.values.prestations ?? []).length;
				if (total <= 1) return null;
				return (
					<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
						<Tooltip title="Supprimer">
							<IconButton size="small" color="error" onClick={() => removePrestation(realIdx)}>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					</Box>
				);
			},
		},
	], [formik.values.prestations, formik.values.devise, updatePrestation, removePrestation, prestationCellErrors, hasAttemptedSubmit]);

	const prestationRows = useMemo(() =>
		(formik.values.prestations ?? []).map((p, i) => ({ id: i, ...p })),
		[formik.values.prestations],
	);

	/* ── CDL: Tranche DataGrid columns ── */
	const trancheColumns: GridColDef[] = useMemo(() => [
		{
			field: 'label',
			headerName: 'Tranche',
			flex: 2,
			minWidth: 200,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const tr = (formik.values.tranches ?? [])[realIdx];
				if (!tr) return null;
				const errKey = `${realIdx}_label`;
				const hasError = hasAttemptedSubmit && !!trancheCellErrors[errKey];
				const errMsg = trancheCellErrors[errKey] ?? '';
				return (
					<Tooltip title={hasError ? errMsg : ''} arrow>
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
							<CustomTextInput
								id={`tranches.${realIdx}.label`}
								type="text"
								label=""
								value={tr.label}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTranche(realIdx, 'label', e.target.value)}
								size="small"
								theme={gridCellInputTheme}
								error={hasError}
							/>
						</Box>
					</Tooltip>
				);
			},
		},
		{
			field: 'pourcentage',
			headerName: 'Pourcentage',
			flex: 1,
			minWidth: 120,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const tr = (formik.values.tranches ?? [])[realIdx];
				if (!tr) return null;
				const errKey = `${realIdx}_pourcentage`;
				const hasFieldError = hasAttemptedSubmit && !!trancheCellErrors[errKey];
				const hasError = hasFieldError || cdlTrancheTotalInvalid;
				const errMsg = hasFieldError ? (trancheCellErrors[errKey] ?? '') : ECHEANCIER_TOTAL_ERROR;
				return (
					<Tooltip title={hasError ? errMsg : ''} arrow>
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
							<CustomTextInput
								id={`tranches.${realIdx}.pourcentage`}
								type="text"
								label=""
								value={String(tr.pourcentage || '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) {
										updateTranche(realIdx, 'pourcentage', parseFloat(e.target.value.replace(',', '.')) || 0);
									}
								}}
								size="small"
								theme={gridCellInputTheme}
								error={hasError}
								endIcon={<InputAdornment position="end">%</InputAdornment>}
							/>
						</Box>
					</Tooltip>
				);
			},
		},
		{
			field: 'actions',
			headerName: '',
			flex: 0.4,
			minWidth: 50,
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const total = (formik.values.tranches ?? []).length;
				if (total <= 1) return null;
				return (
					<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
						<Tooltip title="Supprimer">
							<IconButton size="small" color="error" onClick={() => removeTranche(realIdx)}>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					</Box>
				);
			},
		},
	], [formik.values.tranches, updateTranche, removeTranche, trancheCellErrors, hasAttemptedSubmit, cdlTrancheTotalInvalid]);

	const trancheRows = useMemo(() =>
		(formik.values.tranches ?? []).map((tr, i) => ({ id: i, ...tr })),
		[formik.values.tranches],
	);

	/* ── ST: Tranche DataGrid columns ── */
	const stTrancheColumns: GridColDef[] = useMemo(() => [
		{
			field: 'label',
			headerName: 'Tranche',
			flex: 2,
			minWidth: 200,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const tr = (formik.values.st_tranches ?? [])[realIdx];
				if (!tr) return null;
				const errKey = `${realIdx}_label`;
				const hasError = hasAttemptedSubmit && !!stTrancheCellErrors[errKey];
				const errMsg = stTrancheCellErrors[errKey] ?? '';
				return (
					<Tooltip title={hasError ? errMsg : ''} arrow>
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
							<CustomTextInput
								id={`st_tranches.${realIdx}.label`}
								type="text"
								label=""
								value={tr.label}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStTranche(realIdx, 'label', e.target.value)}
								size="small"
								theme={gridCellInputTheme}
								error={hasError}
							/>
						</Box>
					</Tooltip>
				);
			},
		},
		{
			field: 'pourcentage',
			headerName: 'Pourcentage',
			flex: 1,
			minWidth: 120,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const tr = (formik.values.st_tranches ?? [])[realIdx];
				if (!tr) return null;
				const errKey = `${realIdx}_pourcentage`;
				const hasFieldError = hasAttemptedSubmit && !!stTrancheCellErrors[errKey];
				const hasError = hasFieldError || stTrancheTotalInvalid;
				const errMsg = hasFieldError ? (stTrancheCellErrors[errKey] ?? '') : ECHEANCIER_TOTAL_ERROR;
				return (
					<Tooltip title={hasError ? errMsg : ''} arrow>
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
							<CustomTextInput
								id={`st_tranches.${realIdx}.pourcentage`}
								type="text"
								label=""
								value={String(tr.pourcentage || '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) {
										updateStTranche(realIdx, 'pourcentage', parseFloat(e.target.value.replace(',', '.')) || 0);
									}
								}}
								size="small"
								theme={gridCellInputTheme}
								error={hasError}
								endIcon={<InputAdornment position="end">%</InputAdornment>}
							/>
						</Box>
					</Tooltip>
				);
			},
		},
		{
			field: 'actions',
			headerName: '',
			flex: 0.4,
			minWidth: 50,
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams) => {
				const realIdx = Number(params.id);
				const total = (formik.values.st_tranches ?? []).length;
				if (total <= 1) return null;
				return (
					<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
						<Tooltip title="Supprimer">
							<IconButton size="small" color="error" onClick={() => removeStTranche(realIdx)}>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					</Box>
				);
			},
		},
	], [formik.values.st_tranches, updateStTranche, removeStTranche, stTrancheCellErrors, hasAttemptedSubmit, stTrancheTotalInvalid]);

	const stTrancheRows = useMemo(() =>
		(formik.values.st_tranches ?? []).map((tr, i) => ({ id: i, ...tr })),
		[formik.values.st_tranches],
	);

	return (
		<Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
			<Stack direction={isMobile ? 'column' : 'row'} pt={2} justifyContent="space-between" spacing={2}>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIcon />}
					onClick={() => router.push(CONTRACTS_LIST)}
					sx={{
						whiteSpace: 'nowrap',
						px: { xs: 1.5, sm: 2, md: 3 },
						py: { xs: 0.8, sm: 1, md: 1 },
						fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
					}}
				>
					 Liste des contrats
				</Button>
			</Stack>
			{hasValidationErrors && (
				<Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
					<Typography variant="subtitle2" fontWeight={600}>
						Erreurs de validation détectées:
					</Typography>
					<ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
						{Object.entries(validationErrors).map(([key, err]) => (
							<li key={key}>
								<Typography variant="body2">
									{getLabelForKey(fieldLabels, key)} : {err}
								</Typography>
							</li>
						))}
					</ul>
				</Alert>
			)}
			{formik.errors.globalError && <span className={Styles.errorMessage}>{formik.errors.globalError}</span>}
			{isLoading ? (
				<ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B" />
			) : shouldShowError ? (
				<ApiAlert errorDetails={axiosError?.data.details} />
			) : (
				<form onSubmit={formik.handleSubmit}>
					<Stack spacing={3}>
						{/* ── Company Selector ── */}
						<Card elevation={2} sx={{ borderRadius: 2 }}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
									<BusinessIcon color="primary" />
									<Typography variant="h6" fontWeight={700}>Société</Typography>
								</Stack>
								<Divider sx={{ mb: 3 }} />
								<ToggleButtonGroup
									value={formik.values.company}
									exclusive
									onChange={(_e, val: string | null) => {
										if (val) {
											formik.setFieldValue('company', val);
											setHasAttemptedSubmit(false);
										}
									}}
									sx={{ width: '100%' }}
								>
									{companyItemsList.map((c) => (
										<ToggleButton
											key={c.code}
											value={c.code}
											sx={{
												flex: 1,
												fontFamily: 'Poppins',
												fontWeight: formik.values.company === c.code ? 700 : 400,
												textTransform: 'none',
												fontSize: '0.95rem',
											}}
										>
											{c.value}
										</ToggleButton>
									))}
								</ToggleButtonGroup>
								{formik.values.company === 'casa_di_lusso' && (
									<Box sx={{ mt: 2 }}>
										<Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
											Catégorie de contrat
										</Typography>
										<ToggleButtonGroup
											value={formik.values.contract_category}
											exclusive
											onChange={(_e, val: string | null) => {
												if (val) {
													formik.setFieldValue('contract_category', val);
													setHasAttemptedSubmit(false);
												}
											}}
											sx={{ width: '100%' }}
										>
											{contractCategoryItemsList.map((c) => (
												<ToggleButton
													key={c.code}
													value={c.code}
													sx={{
														flex: 1,
														fontFamily: 'Poppins',
														fontWeight: formik.values.contract_category === c.code ? 700 : 400,
														textTransform: 'none',
														fontSize: '0.9rem',
													}}
												>
													{c.value}
												</ToggleButton>
											))}
										</ToggleButtonGroup>
									</Box>
								)}
							</CardContent>
						</Card>

						{/* ── Identification ── */}
						<Card elevation={2} sx={{ borderRadius: 2 }}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
									<AssignmentIcon color="primary" />
									<Typography variant="h6" fontWeight={700}>Identification</Typography>
								</Stack>
								<Divider sx={{ mb: 3 }} />
								<Stack spacing={2.5}>
									<CustomTextInput
										id="numero_contrat"
										type="text"
										label="Numéro de contrat"
										value={formik.values.numero_contrat}
										onChange={formik.handleChange('numero_contrat')}
										onBlur={formik.handleBlur('numero_contrat')}
										error={formik.touched.numero_contrat && Boolean(formik.errors.numero_contrat)}
										helperText={formik.touched.numero_contrat ? formik.errors.numero_contrat : ''}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<FingerprintIcon fontSize="small" />}
										disabled
									/>
									<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
										<DatePicker
											label="Date du contrat"
											value={formik.values.date_contrat ? new Date(formik.values.date_contrat) : null}
											onChange={(date) => formik.setFieldValue('date_contrat', date ? formatLocalDate(date) : '')}
											format="dd/MM/yyyy"
											slotProps={{
												textField: {
													size: 'small',
													fullWidth: true,
													InputProps: {
														startAdornment: (
															<InputAdornment position="start">
																<CalendarTodayIcon fontSize="small" color="action" />
															</InputAdornment>
														),
													},
												},
											}}
										/>
									</LocalizationProvider>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
										<CustomDropDownSelect
											id="statut"
											label="Statut"
											items={statutItems}
											value={formik.values.statut}
											onChange={(e: SelectChangeEvent) => formik.setFieldValue('statut', e.target.value)}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<FlagIcon fontSize="small" />}
										/>
										{isCDL && (
											<CustomDropDownSelect
												id="type_contrat"
												label={`Type de contrat${isRequired('type_contrat') ? ' *' : ''}`}
												items={typeContratItems.map((t) => t.value)}
												value={typeContratDisplay}
												onChange={(e: SelectChangeEvent) => {
													const selected = typeContratItems.find((t) => t.value === e.target.value);
													formik.setFieldValue('type_contrat', selected?.code ?? e.target.value);
												}}
												size="small"
												theme={customDropdownTheme()}
												startIcon={<DescriptionIcon fontSize="small" />}
												error={formik.touched.type_contrat && Boolean(formik.errors.type_contrat)}
												helperText={formik.touched.type_contrat ? (formik.errors.type_contrat as string) : ''}
											/>
										)}
									</Stack>
									<CustomTextInput
										id="ville_signature"
										type="text"
										label="Ville de signature"
										value={formik.values.ville_signature}
										onChange={formik.handleChange('ville_signature')}
										onBlur={formik.handleBlur('ville_signature')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<LocationOnIcon fontSize="small" />}
									/>
								</Stack>
							</CardContent>
						</Card>

						{/* ── Client ── */}
						<Card elevation={2} sx={{ borderRadius: 2 }}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
									<PersonIcon color="primary" />
									<Typography variant="h6" fontWeight={700}>Client</Typography>
								</Stack>
								<Divider sx={{ mb: 3 }} />
								<Stack spacing={2.5}>
									<CustomTextInput
										id="client_nom"
										type="text"
										label={isST ? 'Nom du client / MOA (optionnel)' : 'Nom du client *'}
										value={formik.values.client_nom}
										onChange={formik.handleChange('client_nom')}
										onBlur={formik.handleBlur('client_nom')}
										error={formik.touched.client_nom && Boolean(formik.errors.client_nom)}
										helperText={formik.touched.client_nom ? formik.errors.client_nom : ''}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<PersonIcon fontSize="small" />}
									/>
									<CustomTextInput
										id="client_cin"
										type="text"
										label="CIN / N° entreprise"
										value={formik.values.client_cin}
										onChange={formik.handleChange('client_cin')}
										onBlur={formik.handleBlur('client_cin')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<BadgeIcon fontSize="small" />}
									/>
									<CustomDropDownSelect
										id="client_qualite"
										label="Qualité"
										items={clientQualiteItemsList.map((q) => q.value)}
										value={clientQualiteItemsList.find((q) => q.code === formik.values.client_qualite)?.value ?? formik.values.client_qualite}
										onChange={(e: SelectChangeEvent) => {
											const selected = clientQualiteItemsList.find((q) => q.value === e.target.value);
											formik.setFieldValue('client_qualite', selected?.code ?? e.target.value);
										}}
										size="small"
										theme={customDropdownTheme()}
										startIcon={<DescriptionIcon fontSize="small" />}
									/>
									<CustomTextInput
										id="client_tel"
										type="text"
										label="Téléphone"
										value={formik.values.client_tel}
										onChange={formik.handleChange('client_tel')}
										onBlur={formik.handleBlur('client_tel')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<PhoneIcon fontSize="small" />}
									/>
									<CustomTextInput
										id="client_email"
										type="email"
										label="Email"
										value={formik.values.client_email}
										onChange={formik.handleChange('client_email')}
										onBlur={formik.handleBlur('client_email')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<EmailIcon fontSize="small" />}
									/>
									<CustomTextInput
										id="client_adresse"
										type="text"
										label="Adresse"
										value={formik.values.client_adresse}
										onChange={formik.handleChange('client_adresse')}
										onBlur={formik.handleBlur('client_adresse')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<HomeIcon fontSize="small" />}
									/>
								</Stack>
							</CardContent>
						</Card>

						{/* ── Travaux ── */}
						<Card elevation={2} sx={{ borderRadius: 2 }}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
									<BuildIcon color="primary" />
									<Typography variant="h6" fontWeight={700}>Travaux</Typography>
								</Stack>
								<Divider sx={{ mb: 3 }} />
								<Stack spacing={2.5}>
									<CustomDropDownSelect
										id="type_bien"
										label="Type de bien"
										items={typeBienItemsList.map((i) => i.value)}
										value={typeBienItemsList.find((i) => i.code === formik.values.type_bien)?.value ?? formik.values.type_bien}
										onChange={(e: SelectChangeEvent) => {
											const selected = typeBienItemsList.find((i) => i.value === e.target.value);
											formik.setFieldValue('type_bien', selected?.code ?? e.target.value);
										}}
										size="small"
										theme={customDropdownTheme()}
										startIcon={<HomeIcon fontSize="small" />}
									/>
									<CustomTextInput
										id="surface"
										type="text"
										label="Surface (m²)"
										value={formik.values.surface}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('surface', e.target.value);
										}}
										onBlur={formik.handleBlur('surface')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<StraightenIcon fontSize="small" />}
										slotProps={{ input: { inputProps: { inputMode: 'decimal' } } }}
									/>
									<CustomTextInput
										id="adresse_travaux"
										type="text"
										label="Adresse des travaux"
										value={formik.values.adresse_travaux}
										onChange={formik.handleChange('adresse_travaux')}
										onBlur={formik.handleBlur('adresse_travaux')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<LocationOnIcon fontSize="small" />}
									/>
									<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
										<DatePicker
											label="Date de début"
											value={formik.values.date_debut ? new Date(formik.values.date_debut) : null}
											onChange={(date) => formik.setFieldValue('date_debut', date ? formatLocalDate(date) : '')}
											format="dd/MM/yyyy"
											slotProps={{
												textField: {
													size: 'small',
													fullWidth: true,
													InputProps: {
														startAdornment: (
															<InputAdornment position="start">
																<CalendarTodayIcon fontSize="small" color="action" />
															</InputAdornment>
														),
													},
												},
											}}
										/>
									</LocalizationProvider>
									<CustomTextInput
										id="duree_estimee"
										type="text"
										label="Durée estimée"
										value={formik.values.duree_estimee}
										onChange={formik.handleChange('duree_estimee')}
										onBlur={formik.handleBlur('duree_estimee')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<TimerIcon fontSize="small" />}
									/>
									{!isBlueline && (
										<CustomTextInput
											id="responsable_projet"
											type="text"
											label="Responsable projet"
											value={formik.values.responsable_projet}
											onChange={formik.handleChange('responsable_projet')}
											onBlur={formik.handleBlur('responsable_projet')}
											fullWidth={false}
											size="small"
											theme={inputTheme}
											startIcon={<PersonIcon fontSize="small" />}
										/>
									)}
									<CustomTextInput
										id="description_travaux"
										type="text"
										label="Description des travaux"
										value={formik.values.description_travaux}
										onChange={formik.handleChange('description_travaux')}
										onBlur={formik.handleBlur('description_travaux')}
										multiline
										rows={3}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<NotesIcon fontSize="small" />}
									/>
								</Stack>
							</CardContent>
						</Card>

						{/* ── Financier ── */}
						<Card elevation={2} sx={{ borderRadius: 2 }}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
									<AttachMoneyIcon color="primary" />
									<Typography variant="h6" fontWeight={700}>Financier</Typography>
								</Stack>
								<Divider sx={{ mb: 3 }} />
								<Stack spacing={2.5}>
									<CustomTextInput
										id="montant_ht"
										type="text"
										label="Montant HT *"
										value={formik.values.montant_ht}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('montant_ht', e.target.value);
										}}
										onBlur={formik.handleBlur('montant_ht')}
										error={formik.touched.montant_ht && Boolean(formik.errors.montant_ht)}
										helperText={formik.touched.montant_ht ? formik.errors.montant_ht : ''}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<AttachMoneyIcon fontSize="small" />}
										slotProps={{ input: { inputProps: { inputMode: 'decimal' } } }}
									/>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
										<CustomDropDownSelect
											id="devise"
											label="Devise"
											items={deviseItems}
											value={formik.values.devise}
											onChange={(e: SelectChangeEvent) => formik.setFieldValue('devise', e.target.value)}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<AttachMoneyIcon fontSize="small" />}
										/>
									</Stack>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
										<CustomTextInput
											id="tva"
											type="number"
											label="TVA"
											value={formik.values.tva}
											onChange={formik.handleChange('tva')}
											onBlur={formik.handleBlur('tva')}
											error={formik.touched.tva && Boolean(formik.errors.tva)}
											helperText={
												formik.touched.tva && formik.errors.tva
													? (formik.errors.tva as string)
													: 'Entre 0 et 100'
											}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<PercentIcon fontSize="small" />}
											endIcon="%"
										/>
										<CustomTextInput
											id="penalite_retard"
											type="number"
											label="Pénalité de retard (MAD/j)"
											value={formik.values.penalite_retard}
											onChange={formik.handleChange('penalite_retard')}
											onBlur={formik.handleBlur('penalite_retard')}
											error={formik.touched.penalite_retard && Boolean(formik.errors.penalite_retard)}
											helperText={
												formik.touched.penalite_retard && formik.errors.penalite_retard
													? (formik.errors.penalite_retard as string)
													: ''
											}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<AttachMoneyIcon fontSize="small" />}
											endIcon="MAD/j"
										/>
									</Stack>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomDropDownSelect
												id="mode_paiement_texte"
												label="Mode de paiement"
												items={modePaiementTexteItemsList.map((i) => i.value)}
												value={modePaiementTexteItemsList.find((i) => i.code === formik.values.mode_paiement_texte)?.value ?? formik.values.mode_paiement_texte}
												onChange={(e: SelectChangeEvent) => {
													const selected = modePaiementTexteItemsList.find((i) => i.value === e.target.value);
													formik.setFieldValue('mode_paiement_texte', selected?.code ?? e.target.value);
												}}
												size="small"
												theme={customDropdownTheme()}
												startIcon={<AttachMoneyIcon fontSize="small" />}
											/>
										</Box>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="rib"
												type="text"
												label="RIB / Coordonnées bancaires"
												value={formik.values.rib}
												onChange={formik.handleChange('rib')}
												onBlur={formik.handleBlur('rib')}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<AccountBalanceIcon fontSize="small" />}
											/>
										</Box>
									</Stack>
								</Stack>
							</CardContent>
						</Card>

						{/* ── Clauses ── */}
						<Card elevation={2} sx={{ borderRadius: 2 }}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
									<GavelIcon color="primary" />
									<Typography variant="h6" fontWeight={700}>Clauses</Typography>
								</Stack>
								<Divider sx={{ mb: 3 }} />
								<Stack spacing={2.5}>
									{!isBlueline && (
										<CustomDropDownSelect
											id="garantie"
											label="Garantie"
											items={garantieItemsList.map((g) => g.value)}
											value={garantieItemsList.find((g) => g.code === formik.values.garantie)?.value ?? formik.values.garantie}
											onChange={(e: SelectChangeEvent) => {
												const selected = garantieItemsList.find((g) => g.value === e.target.value);
												formik.setFieldValue('garantie', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<GavelIcon fontSize="small" />}
										/>
									)}
									<CustomDropDownSelect
										id="tribunal"
										label="Tribunal compétent"
										items={tribunalItemsList.map((t) => t.value)}
										value={tribunalItemsList.find((t) => t.code === formik.values.tribunal)?.value ?? formik.values.tribunal}
										onChange={(e: SelectChangeEvent) => {
											const selected = tribunalItemsList.find((t) => t.value === e.target.value);
											formik.setFieldValue('tribunal', selected?.code ?? e.target.value);
										}}
										size="small"
										theme={customDropdownTheme()}
										startIcon={<GavelIcon fontSize="small" />}
									/>
									{!isBlueline && (
										<CustomDropDownSelect
											id="confidentialite"
											label="Confidentialité"
											items={confidentialiteItems}
											value={formik.values.confidentialite}
											onChange={(e: SelectChangeEvent) => formik.setFieldValue('confidentialite', e.target.value)}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<LockIcon fontSize="small" />}
										/>
									)}
								</Stack>
							</CardContent>
						</Card>

						{/* ── CDL: Services ── */}
						{isCDL && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<ChecklistIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Services CDL</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
										{cdlServiceOptions.map((svc) => (
											<Chip
												key={svc}
												label={svc}
												color={(formik.values.services ?? []).includes(svc) ? 'primary' : 'default'}
												variant={(formik.values.services ?? []).includes(svc) ? 'filled' : 'outlined'}
												onClick={() => toggleService(svc)}
												sx={{ fontFamily: 'Poppins', cursor: 'pointer' }}
											/>
										))}
									</Box>
								</CardContent>
							</Card>
						)}

						{/* ── CDL: Projet ── */}
						{isCDL && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<ArchitectureIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Projet CDL</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<CustomTextInput
											id="architecte"
											type="text"
											label="Architecte"
											value={formik.values.architecte}
											onChange={formik.handleChange('architecte')}
											onBlur={formik.handleBlur('architecte')}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<ArchitectureIcon fontSize="small" />}
										/>
										<CustomTextInput
											id="conditions_acces"
											type="text"
											label="Conditions d'accès"
											multiline
											rows={3}
											value={formik.values.conditions_acces}
											onChange={formik.handleChange('conditions_acces')}
											onBlur={formik.handleBlur('conditions_acces')}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<LockIcon fontSize="small" />}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── CDL: Échéancier (Tranches) ── */}
						{isCDL && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
										<Stack direction="row" spacing={2} alignItems="center">
											<PlaylistAddCheckIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>Échéancier CDL</Typography>
										</Stack>
										<Button
											variant="contained"
											size="small"
											startIcon={<AddIcon />}
											onClick={() => addTranche()}
										>
											Ajouter une tranche
										</Button>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Box sx={{ width: '100%' }}>
										<DataGrid
											rows={trancheRows}
											columns={trancheColumns}
											localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
											rowHeight={52}
											disableColumnMenu
											disableRowSelectionOnClick
											hideFooter={(formik.values.tranches ?? []).length <= 5}
											pageSizeOptions={[5, 10, 25]}
											initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
											sx={{
												border: 1,
												borderColor: 'divider',
												borderRadius: 2,
												'& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
												'& .MuiDataGrid-columnHeaders': { fontFamily: 'Poppins', fontWeight: 700 },
											}}
										/>
									</Box>
									<Divider sx={{ my: 3 }} />
									<Stack spacing={2.5}>
										<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
											<Box sx={{ width: 200 }}>
												<CustomTextInput
													id="delai_retard"
													type="text"
													label="Délai de retard (jours)"
													value={formik.values.delai_retard}
													onChange={formik.handleChange('delai_retard')}
													onBlur={formik.handleBlur('delai_retard')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<TimerIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ width: 200 }}>
												<CustomTextInput
													id="frais_redemarrage"
													type="text"
													label={`Frais de redémarrage (${formik.values.devise || 'MAD'})`}
													value={formik.values.frais_redemarrage}
													onChange={formik.handleChange('frais_redemarrage')}
													onBlur={formik.handleBlur('frais_redemarrage')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<AttachMoneyIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ width: 200 }}>
												<CustomTextInput
													id="delai_reserves"
													type="text"
													label="Délai levée réserves (jours)"
													value={formik.values.delai_reserves}
													onChange={formik.handleChange('delai_reserves')}
													onBlur={formik.handleBlur('delai_reserves')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<TimerIcon fontSize="small" />}
												/>
											</Box>
										</Box>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── CDL: Clauses actives ── */}
						{isCDL && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<GavelIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Clauses actives CDL</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
										{cdlClauseOptions.map((opt) => (
											<FormControlLabel
												key={opt.key}
												control={
													<Checkbox
														checked={(formik.values.clauses_actives ?? []).includes(opt.key)}
														onChange={() => toggleClause(opt.key)}
														size="small"
													/>
												}
												label={<Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>{opt.label}</Typography>}
											/>
										))}
									</Box>
								</CardContent>
							</Card>
						)}

						{/* ── CDL: Clauses additionnelles ── */}
						{isCDL && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<AttachmentIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Détails additionnels CDL</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<CustomTextInput
											id="clause_spec"
											type="text"
											label="Clause spécifique"
											multiline
											rows={3}
											value={formik.values.clause_spec}
											onChange={formik.handleChange('clause_spec')}
											onBlur={formik.handleBlur('clause_spec')}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<GavelIcon fontSize="small" />}
										/>
										<CustomTextInput
											id="exclusions"
											type="text"
											label="Exclusions"
											multiline
											rows={3}
											value={formik.values.exclusions}
											onChange={formik.handleChange('exclusions')}
											onBlur={formik.handleBlur('exclusions')}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<ShieldIcon fontSize="small" />}
										/>
										<CustomTextInput
											id="annexes"
											type="text"
											label="Annexes"
											multiline
											rows={3}
											value={formik.values.annexes}
											onChange={formik.handleChange('annexes')}
											onBlur={formik.handleBlur('annexes')}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<AttachmentIcon fontSize="small" />}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── ST: Sous-Traitant Identity ── */}
						{isST && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<PersonIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Sous-Traitant</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										{projectsList && projectsList.length > 0 && (
											<CustomDropDownSelect
												id="st_projet"
												label="Architecte/Designer"
												items={projectsList.map((p) => p.name)}
												value={projectsList.find((p) => String(p.id) === formik.values.st_projet)?.name ?? ''}
												onChange={(e: SelectChangeEvent) => {
													const selected = projectsList.find((p) => p.name === e.target.value);
													formik.setFieldValue('st_projet', selected ? String(selected.id) : '');
												}}
												size="small"
												theme={customDropdownTheme()}
												startIcon={<ArchitectureIcon fontSize="small" />}
											/>
										)}
										<CustomTextInput
											id="st_name"
											type="text"
											label={`Raison sociale du sous-traitant${isRequired('st_name') ? ' *' : ''}`}
											value={formik.values.st_name}
											onChange={formik.handleChange('st_name')}
											onBlur={formik.handleBlur('st_name')}
											error={formik.touched.st_name && Boolean(formik.errors.st_name)}
											helperText={formik.touched.st_name ? formik.errors.st_name : ''}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<BusinessIcon fontSize="small" />}
										/>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomDropDownSelect
													id="st_forme"
													label="Forme juridique"
													items={stFormeJuridiqueItemsList.map((i) => i.value)}
													value={stFormeJuridiqueItemsList.find((i) => i.code === formik.values.st_forme)?.value ?? formik.values.st_forme}
													onChange={(e: SelectChangeEvent) => {
														const selected = stFormeJuridiqueItemsList.find((i) => i.value === e.target.value);
														formik.setFieldValue('st_forme', selected?.code ?? e.target.value);
													}}
													size="small"
													theme={customDropdownTheme()}
													startIcon={<DescriptionIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_capital"
													type="text"
													label="Capital"
													value={formik.values.st_capital}
													onChange={formik.handleChange('st_capital')}
													onBlur={formik.handleBlur('st_capital')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<AttachMoneyIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_rc"
													type="text"
													label={`Registre du commerce${isRequired('st_rc') ? ' *' : ''}`}
													value={formik.values.st_rc}
													onChange={formik.handleChange('st_rc')}
													onBlur={formik.handleBlur('st_rc')}
													error={formik.touched.st_rc && Boolean(formik.errors.st_rc)}
													helperText={formik.touched.st_rc ? formik.errors.st_rc : ''}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<BadgeIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_ice"
													type="text"
													label="ICE"
													value={formik.values.st_ice}
													onChange={formik.handleChange('st_ice')}
													onBlur={formik.handleBlur('st_ice')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<FingerprintIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_if"
													type="text"
													label="Identifiant fiscal"
													value={formik.values.st_if}
													onChange={formik.handleChange('st_if')}
													onBlur={formik.handleBlur('st_if')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<BadgeIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_cnss"
													type="text"
													label="CNSS"
													value={formik.values.st_cnss}
													onChange={formik.handleChange('st_cnss')}
													onBlur={formik.handleBlur('st_cnss')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<ShieldIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
										<CustomTextInput
											id="st_addr"
											type="text"
											label={`Adresse du sous-traitant${isRequired('st_addr') ? ' *' : ''}`}
											value={formik.values.st_addr}
											onChange={formik.handleChange('st_addr')}
											onBlur={formik.handleBlur('st_addr')}
											error={formik.touched.st_addr && Boolean(formik.errors.st_addr)}
											helperText={formik.touched.st_addr ? formik.errors.st_addr : ''}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<HomeIcon fontSize="small" />}
										/>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_rep"
													type="text"
													label={`Représentant légal${isRequired('st_rep') ? ' *' : ''}`}
													value={formik.values.st_rep}
													onChange={formik.handleChange('st_rep')}
													onBlur={formik.handleBlur('st_rep')}
													error={formik.touched.st_rep && Boolean(formik.errors.st_rep)}
													helperText={formik.touched.st_rep ? formik.errors.st_rep : ''}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<PersonIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_cin"
													type="text"
													label="CIN du représentant"
													value={formik.values.st_cin}
													onChange={formik.handleChange('st_cin')}
													onBlur={formik.handleBlur('st_cin')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<BadgeIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
										<CustomTextInput
											id="st_qualite"
											type="text"
											label="Qualité du représentant"
											value={formik.values.st_qualite}
											onChange={formik.handleChange('st_qualite')}
											onBlur={formik.handleBlur('st_qualite')}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<DescriptionIcon fontSize="small" />}
										/>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_tel"
													type="text"
													label="Téléphone"
													value={formik.values.st_tel}
													onChange={formik.handleChange('st_tel')}
													onBlur={formik.handleBlur('st_tel')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<PhoneIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_email"
													type="email"
													label="Email"
													value={formik.values.st_email}
													onChange={formik.handleChange('st_email')}
													onBlur={formik.handleBlur('st_email')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<EmailIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_rib"
													type="text"
													label="RIB"
													value={formik.values.st_rib}
													onChange={formik.handleChange('st_rib')}
													onBlur={formik.handleBlur('st_rib')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<AccountBalanceIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_banque"
													type="text"
													label="Banque"
													value={formik.values.st_banque}
													onChange={formik.handleChange('st_banque')}
													onBlur={formik.handleBlur('st_banque')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<AccountBalanceIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── ST: Lot & Type ── */}
						{isST && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<CategoryIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Lot & Type</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<CustomDropDownSelect
											id="st_lot_type"
											label={`Type de lot${isRequired('st_lot_type') ? ' *' : ''}`}
											items={stLotTypeItemsList.map((i) => i.value)}
											value={stLotTypeItemsList.find((i) => i.code === formik.values.st_lot_type)?.value ?? formik.values.st_lot_type}
											onChange={(e: SelectChangeEvent) => {
												const selected = stLotTypeItemsList.find((i) => i.value === e.target.value);
												formik.setFieldValue('st_lot_type', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<CategoryIcon fontSize="small" />}
											error={formik.touched.st_lot_type && Boolean(formik.errors.st_lot_type)}
											helperText={formik.touched.st_lot_type ? (formik.errors.st_lot_type as string) : ''}
										/>
										<CustomTextInput
											id="st_lot_description"
											type="text"
											label="Description du lot"
											multiline
											rows={3}
											value={formik.values.st_lot_description}
											onChange={formik.handleChange('st_lot_description')}
											onBlur={formik.handleBlur('st_lot_description')}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<NotesIcon fontSize="small" />}
										/>
										<CustomDropDownSelect
											id="st_type_prix"
											label={`Type de prix${isRequired('st_type_prix') ? ' *' : ''}`}
											items={stTypePrixItemsList.map((i) => i.value)}
											value={stTypePrixItemsList.find((i) => i.code === formik.values.st_type_prix)?.value ?? formik.values.st_type_prix}
											onChange={(e: SelectChangeEvent) => {
												const selected = stTypePrixItemsList.find((i) => i.value === e.target.value);
												formik.setFieldValue('st_type_prix', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<AttachMoneyIcon fontSize="small" />}
											error={formik.touched.st_type_prix && Boolean(formik.errors.st_type_prix)}
											helperText={formik.touched.st_type_prix ? (formik.errors.st_type_prix as string) : ''}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── ST: Financial ── */}
						{isST && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<AttachMoneyIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Financier ST</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_retenue_garantie"
													type="text"
													label="Retenue de garantie"
													value={formik.values.st_retenue_garantie}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_retenue_garantie', e.target.value);
													}}
													onBlur={formik.handleBlur('st_retenue_garantie')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<PercentIcon fontSize="small" />}
													endIcon="%"
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_avance"
													type="text"
													label="Avance"
													value={formik.values.st_avance}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_avance', e.target.value);
													}}
													onBlur={formik.handleBlur('st_avance')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<PercentIcon fontSize="small" />}
													endIcon="%"
												/>
											</Box>
										</Stack>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_penalite_taux"
													type="text"
													label="Taux de pénalité (‰/jour)"
													value={formik.values.st_penalite_taux}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_penalite_taux', e.target.value);
													}}
													onBlur={formik.handleBlur('st_penalite_taux')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<PercentIcon fontSize="small" />}
													endIcon="‰"
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_plafond_penalite"
													type="text"
													label="Plafond pénalité"
													value={formik.values.st_plafond_penalite}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_plafond_penalite', e.target.value);
													}}
													onBlur={formik.handleBlur('st_plafond_penalite')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<PercentIcon fontSize="small" />}
													endIcon="%"
												/>
											</Box>
										</Stack>
										<CustomTextInput
											id="st_delai_paiement"
											type="text"
											label="Délai de paiement (jours)"
											value={formik.values.st_delai_paiement}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_delai_paiement', e.target.value);
											}}
											onBlur={formik.handleBlur('st_delai_paiement')}
											fullWidth={false}
											size="small"
											theme={inputTheme}
											startIcon={<TimerIcon fontSize="small" />}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── ST: Échéancier (Tranches) ── */}
						{isST && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
										<Stack direction="row" spacing={2} alignItems="center">
											<PlaylistAddCheckIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>Échéancier ST</Typography>
										</Stack>
										<Button
											variant="contained"
											size="small"
											startIcon={<AddIcon />}
											onClick={() => addStTranche()}
										>
											Ajouter une tranche
										</Button>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Box sx={{ width: '100%' }}>
										<DataGrid
											rows={stTrancheRows}
											columns={stTrancheColumns}
											localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
											rowHeight={52}
											disableColumnMenu
											disableRowSelectionOnClick
											hideFooter={(formik.values.st_tranches ?? []).length <= 5}
											pageSizeOptions={[5, 10, 25]}
											initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
											sx={{
												border: 1,
												borderColor: 'divider',
												borderRadius: 2,
												'& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
												'& .MuiDataGrid-columnHeaders': { fontFamily: 'Poppins', fontWeight: 700 },
											}}
										/>
									</Box>
								</CardContent>
							</Card>
						)}

						{/* ── ST: Délais ── */}
						{isST && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<TimerIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Délais & Garantie ST</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_delai_val"
													type="text"
													label={`Délai d'exécution${isRequired('st_delai_val') ? ' *' : ''}`}
													value={formik.values.st_delai_val}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_delai_val', e.target.value);
													}}
													onBlur={formik.handleBlur('st_delai_val')}
													error={formik.touched.st_delai_val && Boolean(formik.errors.st_delai_val)}
													helperText={formik.touched.st_delai_val ? formik.errors.st_delai_val : ''}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<TimerIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomDropDownSelect
													id="st_delai_unit"
													label="Unité de délai"
													items={stDelaiUnitItemsList.map((i) => i.value)}
													value={stDelaiUnitItemsList.find((i) => i.code === formik.values.st_delai_unit)?.value ?? formik.values.st_delai_unit}
													onChange={(e: SelectChangeEvent) => {
														const selected = stDelaiUnitItemsList.find((i) => i.value === e.target.value);
														formik.setFieldValue('st_delai_unit', selected?.code ?? e.target.value);
													}}
													size="small"
													theme={customDropdownTheme()}
													startIcon={<TimerIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_garantie_mois"
													type="text"
													label="Garantie (mois)"
													value={formik.values.st_garantie_mois}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_garantie_mois', e.target.value);
													}}
													onBlur={formik.handleBlur('st_garantie_mois')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<ShieldIcon fontSize="small" />}
												/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<CustomTextInput
													id="st_delai_reserves"
													type="text"
													label="Délai levée réserves (jours)"
													value={formik.values.st_delai_reserves}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_delai_reserves', e.target.value);
													}}
													onBlur={formik.handleBlur('st_delai_reserves')}
													fullWidth
													size="small"
													theme={inputTheme}
													startIcon={<TimerIcon fontSize="small" />}
												/>
											</Box>
										</Stack>
										<CustomTextInput
											id="st_delai_med"
											type="text"
											label="Délai mise en demeure (jours)"
											value={formik.values.st_delai_med}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_delai_med', e.target.value);
											}}
											onBlur={formik.handleBlur('st_delai_med')}
											fullWidth={false}
											size="small"
											theme={inputTheme}
											startIcon={<GavelIcon fontSize="small" />}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── ST: Clauses actives ── */}
						{isST && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<GavelIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Clauses actives ST</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
										{stClausesActivesList.map((opt) => (
											<FormControlLabel
												key={opt.key}
												control={
													<Checkbox
														checked={(formik.values.st_clauses_actives ?? []).includes(opt.key)}
														onChange={() => toggleStClause(opt.key)}
														size="small"
													/>
												}
												label={<Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>{opt.label}</Typography>}
											/>
										))}
									</Box>
								</CardContent>
							</Card>
						)}

						{/* ── ST: Observations ── */}
						{isST && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<NotesIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Observations</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<CustomTextInput
										id="st_observations"
										type="text"
										label="Observations"
										multiline
										rows={4}
										value={formik.values.st_observations}
										onChange={formik.handleChange('st_observations')}
										onBlur={formik.handleBlur('st_observations')}
										fullWidth
										size="small"
										theme={inputTheme}
										startIcon={<NotesIcon fontSize="small" />}
									/>
								</CardContent>
							</Card>
						)}

						{/* ── Blueline: Prestations ── */}
						{isBlueline && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
										<Stack direction="row" spacing={2} alignItems="center">
											<ShoppingCartIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>Prestations</Typography>
										</Stack>
										<Button
											variant="contained"
											size="small"
											startIcon={<AddIcon />}
											onClick={addPrestation}
										>
											Ajouter une prestation
										</Button>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									{formik.errors.prestations && typeof formik.errors.prestations === 'string' && formik.touched.prestations && (
										<Typography variant="body2" color="error" sx={{ mb: 1 }}>
											{formik.errors.prestations}
										</Typography>
									)}
									<Box sx={{ width: '100%' }}>
										<DataGrid
											rows={prestationRows}
											columns={prestationColumns}
											localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
											rowHeight={52}
											disableColumnMenu
											disableRowSelectionOnClick
											hideFooter={(formik.values.prestations ?? []).length <= 5}
											pageSizeOptions={[5, 10, 25]}
											initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
											sx={{
												border: 1,
												borderColor: 'divider',
												borderRadius: 2,
												'& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
												'& .MuiDataGrid-columnHeaders': { fontFamily: 'Poppins', fontWeight: 700 },
											}}
										/>
									</Box>
								</CardContent>
							</Card>
						)}

						{/* ── Blueline: Fournitures & Eau/Elec ── */}
						{isBlueline && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<PlumbingIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Fournitures & Eau / Électricité</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<CustomDropDownSelect
											id="fournitures"
											label={`Fournitures${isBluelineRequired('fournitures') ? ' *' : ''}`}
											items={fournituresItemsList.map((i) => i.value)}
											value={fournituresItemsList.find((i) => i.code === formik.values.fournitures)?.value ?? formik.values.fournitures}
											onChange={(e: SelectChangeEvent) => {
												const selected = fournituresItemsList.find((i) => i.value === e.target.value);
												formik.setFieldValue('fournitures', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<InventoryIcon fontSize="small" />}
											error={formik.touched.fournitures && Boolean(formik.errors.fournitures)}
											helperText={formik.touched.fournitures ? (formik.errors.fournitures as string) : ''}
										/>
										<CustomTextInput
											id="materiaux_detail"
											type="text"
											label="Détail des matériaux"
											value={formik.values.materiaux_detail}
											onChange={formik.handleChange('materiaux_detail')}
											onBlur={formik.handleBlur('materiaux_detail')}
											multiline
											rows={2}
											fullWidth={false}
											size="small"
											theme={inputTheme}
											startIcon={<NotesIcon fontSize="small" />}
										/>
										<CustomDropDownSelect
											id="eau_electricite"
											label={`Eau & Électricité${isBluelineRequired('eau_electricite') ? ' *' : ''}`}
											items={eauElectriciteItemsList.map((i) => i.value)}
											value={eauElectriciteItemsList.find((i) => i.code === formik.values.eau_electricite)?.value ?? formik.values.eau_electricite}
											onChange={(e: SelectChangeEvent) => {
												const selected = eauElectriciteItemsList.find((i) => i.value === e.target.value);
												formik.setFieldValue('eau_electricite', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<WaterDropIcon fontSize="small" />}
											error={formik.touched.eau_electricite && Boolean(formik.errors.eau_electricite)}
											helperText={formik.touched.eau_electricite ? (formik.errors.eau_electricite as string) : ''}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── Blueline: Garantie BL ── */}
						{isBlueline && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<ShieldIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Garantie (Blueline)</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="garantie_nb"
												type="text"
												label="Durée"
												value={formik.values.garantie_nb}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
													if (/^\d*$/.test(e.target.value)) formik.setFieldValue('garantie_nb', e.target.value);
												}}
												onBlur={formik.handleBlur('garantie_nb')}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<TimerIcon fontSize="small" />}
											/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomDropDownSelect
												id="garantie_unite"
												label="Unité"
												items={garantieUniteItemsList.map((i) => i.value)}
												value={garantieUniteItemsList.find((i) => i.code === formik.values.garantie_unite)?.value ?? formik.values.garantie_unite}
												onChange={(e: SelectChangeEvent) => {
													const selected = garantieUniteItemsList.find((i) => i.value === e.target.value);
													formik.setFieldValue('garantie_unite', selected?.code ?? e.target.value);
												}}
												size="small"
												theme={customDropdownTheme()}
												startIcon={<StraightenIcon fontSize="small" />}
											/>
											</Box>
										</Stack>
										<CustomDropDownSelect
											id="garantie_type"
											label="Type de garantie"
											items={garantieTypeItemsList.map((i) => i.value)}
											value={garantieTypeItemsList.find((i) => i.code === formik.values.garantie_type)?.value ?? formik.values.garantie_type}
											onChange={(e: SelectChangeEvent) => {
												const selected = garantieTypeItemsList.find((i) => i.value === e.target.value);
												formik.setFieldValue('garantie_type', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<CategoryIcon fontSize="small" />}
										/>
										<CustomTextInput
											id="exclusions_garantie"
											type="text"
											label="Exclusions de garantie"
											value={formik.values.exclusions_garantie}
											onChange={formik.handleChange('exclusions_garantie')}
											onBlur={formik.handleBlur('exclusions_garantie')}
											multiline
											rows={2}
											fullWidth={false}
											size="small"
											theme={inputTheme}
											startIcon={<NotesIcon fontSize="small" />}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── Blueline: Paiement & Résiliation ── */}
						{isBlueline && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<PercentIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Échéancier & Résiliation</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="acompte"
												type="number"
												label={`Acompte${isBluelineRequired('acompte') ? ' *' : ''}`}
												value={formik.values.acompte}
												onChange={formik.handleChange('acompte')}
												onBlur={formik.handleBlur('acompte')}
												error={formik.touched.acompte && Boolean(formik.errors.acompte)}
												helperText={
													formik.touched.acompte && formik.errors.acompte
														? (formik.errors.acompte as string)
														: 'Entre 0 et 100'
												}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<PercentIcon fontSize="small" />}
												endIcon="%"
											/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="tranche2"
												type="number"
												label={`Tranche 2${isBluelineRequired('tranche2') ? ' *' : ''}`}
												value={formik.values.tranche2}
												onChange={formik.handleChange('tranche2')}
												onBlur={formik.handleBlur('tranche2')}
												error={formik.touched.tranche2 && Boolean(formik.errors.tranche2)}
												helperText={
													formik.touched.tranche2 && formik.errors.tranche2
														? (formik.errors.tranche2 as string)
														: 'Entre 0 et 100'
												}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<PercentIcon fontSize="small" />}
												endIcon="%"
											/>
											</Box>
										</Stack>
										{(formik.values.acompte || formik.values.tranche2) && (
											<Typography variant="body2" color="text.secondary" fontFamily="Poppins">
												Solde : {100 - (parseFloat(formik.values.acompte) || 0) - (parseFloat(formik.values.tranche2) || 0)}%
											</Typography>
										)}
										<CustomDropDownSelect
											id="clause_resiliation"
											label={`Clause de résiliation${isBluelineRequired('clause_resiliation') ? ' *' : ''}`}
											items={clauseResiliationItemsList.map((i) => i.value)}
											value={clauseResiliationItemsList.find((i) => i.code === formik.values.clause_resiliation)?.value ?? formik.values.clause_resiliation}
											onChange={(e: SelectChangeEvent) => {
												const selected = clauseResiliationItemsList.find((i) => i.value === e.target.value);
												formik.setFieldValue('clause_resiliation', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
											startIcon={<GavelIcon fontSize="small" />}
											error={formik.touched.clause_resiliation && Boolean(formik.errors.clause_resiliation)}
											helperText={formik.touched.clause_resiliation ? (formik.errors.clause_resiliation as string) : ''}
										/>
										<CustomTextInput
											id="notes"
											type="text"
											label="Notes"
											value={formik.values.notes}
											onChange={formik.handleChange('notes')}
											onBlur={formik.handleBlur('notes')}
											multiline
											rows={3}
											fullWidth={false}
											size="small"
											theme={inputTheme}
											startIcon={<NotesIcon fontSize="small" />}
										/>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── Blueline: Client extra fields ── */}
						{isBlueline && (
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<PersonIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>Client (Blueline)</Typography>
									</Stack>
									<Divider sx={{ mb: 3 }} />
									<Stack spacing={2.5}>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="client_ville"
												type="text"
												label="Ville"
												value={formik.values.client_ville}
												onChange={formik.handleChange('client_ville')}
												onBlur={formik.handleBlur('client_ville')}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<LocationOnIcon fontSize="small" />}
											/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="client_cp"
												type="text"
												label="Code postal"
												value={formik.values.client_cp}
												onChange={formik.handleChange('client_cp')}
												onBlur={formik.handleBlur('client_cp')}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<HomeIcon fontSize="small" />}
											/>
											</Box>
										</Stack>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="chantier_ville"
												type="text"
												label="Ville du chantier"
												value={formik.values.chantier_ville}
												onChange={formik.handleChange('chantier_ville')}
												onBlur={formik.handleBlur('chantier_ville')}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<LocationOnIcon fontSize="small" />}
											/>
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
											<CustomTextInput
												id="chantier_etage"
												type="text"
												label="Étage"
												value={formik.values.chantier_etage}
												onChange={formik.handleChange('chantier_etage')}
												onBlur={formik.handleBlur('chantier_etage')}
												fullWidth
												size="small"
												theme={inputTheme}
												startIcon={<HomeIcon fontSize="small" />}
											/>
											</Box>
										</Stack>
									</Stack>
								</CardContent>
							</Card>
						)}

						{/* ── Submit ── */}
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
							<PrimaryLoadingButton
								buttonText={isEditMode ? 'Mettre à jour' : 'Créer le contrat'}
								active={!isPending}
								type="submit"
								loading={isPending}
								startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									setHasAttemptedSubmit(true);
									if (!formik.isValid) {
										e.preventDefault();
										formik.handleSubmit();
										onError('Veuillez corriger les erreurs de validation avant de soumettre.');
										window.scrollTo({ top: 0, behavior: 'smooth' });
									}
								}}
								cssClass={`${Styles.maxWidth} ${Styles.mobileButton} ${Styles.submitButton}`}
							/>
						</Box>
					</Stack>
				</form>
			)}
		</Stack>
	);
};

interface Props extends SessionProps {
	id?: number;
}

const ContractFormClient: React.FC<Props> = ({ session, id }: Props) => {
	const token = getAccessTokenFromSession(session);
	const isEditMode = id !== undefined;

	return (
		<Stack direction="column" sx={{ position: 'relative' }}>
			<NavigationBar title={isEditMode ? 'Modifier le contrat' : 'Ajouter un contrat'}>
				<main className={`${Styles.main} ${Styles.fixMobile}`}>
					<Protected>
						<Box sx={{ width: '100%' }}>
							<FormikContent token={token} id={id} />
						</Box>
					</Protected>
				</main>
			</NavigationBar>
		</Stack>
	);
};

export default ContractFormClient;

