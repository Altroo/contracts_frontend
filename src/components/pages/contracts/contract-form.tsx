'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
} from '@/utils/rawData';
import { CONTRACTS_LIST, CONTRACTS_VIEW } from '@/utils/routes';
import { useRouter } from 'next/navigation';
import { useToast } from '@/utils/hooks';
import { useAddContractMutation, useEditContractMutation, useGetContractQuery, useGetCodeReferenceQuery } from '@/store/services/contract';
import { contractSchema, bluelineRequired, casaDiLussoRequired } from '@/utils/formValidationSchemas';
import { INPUT_REQUIRED } from '@/utils/formValidationErrorMessages';
import { textInputTheme, customDropdownTheme, gridInputTheme, customGridDropdownTheme } from '@/utils/themes';
import { formatLocalDate } from '@/utils/helpers';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import CustomDropDownSelect from '@/components/formikElements/customDropDownSelect/customDropDownSelect';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import type { ContractFormValuesType, ContractPrestationType, ContractCompanyType, ContractTrancheType } from '@/types/contractTypes';
import type { SelectChangeEvent } from '@mui/material/Select';
import { getAccessTokenFromSession } from '@/store/session';
import Styles from '@/styles/dashboard/dashboard.module.sass';
import { Protected } from '@/components/layouts/protected/protected';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';

const inputTheme = textInputTheme();
const gridCellInputTheme = gridInputTheme();
const gridCellDropdownTheme = customGridDropdownTheme();

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

	const error = isEditMode ? dataError || editError : addError;
	const axiosError: ResponseDataInterface<ApiErrorResponseType> | undefined = useMemo(
		() => (error ? (error as ResponseDataInterface<ApiErrorResponseType>) : undefined),
		[error],
	);

	const [isPending, setIsPending] = useState(false);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

	const today = formatLocalDate(new Date());

	const formik = useFormik<ContractFormValuesType>({
		initialValues: {
			company: (rawData?.company as ContractCompanyType) ?? 'casa_di_lusso',
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
			penalite_retard: rawData?.penalite_retard != null ? String(rawData.penalite_retard) : '1.5',
			garantie: rawData?.garantie ?? '1 an',
			tribunal: rawData?.tribunal ?? 'Tanger',
			responsable_projet: rawData?.responsable_projet ?? '',
			confidentialite: rawData?.confidentialite ?? 'CONFIDENTIEL',
			mode_paiement_texte: rawData?.mode_paiement_texte ?? '',
			rib: rawData?.rib ?? '',
			/* ── Casa Di Lusso fields ── */
			services: rawData?.services ?? [],
			conditions_acces: rawData?.conditions_acces ?? '',
			tranches: rawData?.tranches ?? [],
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
			prestations: rawData?.prestations ?? [],
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
			globalError: '',
		},
		enableReinitialize: true,
		validateOnMount: true,
		validationSchema: toFormikValidationSchema(contractSchema),
		validate: (values) => {
			const errors: Partial<Record<string, string>> = {};
			const isEmpty = (val: unknown) =>
				val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (typeof val === 'number' && Number.isNaN(val));
			if (values.company === 'blueline_works') {
				bluelineRequired.forEach((key) => {
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
			const payload: Record<string, unknown> = {
				...fields,
				montant_ht: fields.montant_ht ? parseFloat(fields.montant_ht) : undefined,
				surface: fields.surface ? parseFloat(fields.surface) : undefined,
				tva: fields.tva ? parseFloat(fields.tva) : undefined,
				penalite_retard: fields.penalite_retard ? parseFloat(fields.penalite_retard) : undefined,
				mode_paiement_texte: fields.mode_paiement_texte || null,
				rib: fields.rib || null,
				/* CDL numeric conversions */
				delai_retard: !isBlueline && fields.delai_retard ? parseInt(fields.delai_retard, 10) : isBlueline ? null : 5,
				frais_redemarrage: !isBlueline && fields.frais_redemarrage ? parseFloat(fields.frais_redemarrage) : null,
				delai_reserves: !isBlueline && fields.delai_reserves ? parseInt(fields.delai_reserves, 10) : isBlueline ? null : 7,
				services: !isBlueline ? fields.services : [],
				tranches: !isBlueline ? fields.tranches : [],
				clauses_actives: !isBlueline ? fields.clauses_actives : [],
				/* Blueline numeric conversions */
				garantie_nb: isBlueline && fields.garantie_nb ? parseInt(fields.garantie_nb, 10) : null,
				acompte: isBlueline && fields.acompte ? parseFloat(fields.acompte) : null,
				tranche2: isBlueline && fields.tranche2 ? parseFloat(fields.tranche2) : null,
				prestations: isBlueline ? fields.prestations : [],
			};
			/* Clear Blueline fields when Casa di Lusso */
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
			/* Clear CDL fields when Blueline */
			if (isBlueline) {
				payload.services = [];
				payload.conditions_acces = '';
				payload.tranches = [];
				payload.delai_retard = 5;
				payload.frais_redemarrage = null;
				payload.delai_reserves = 7;
				payload.clauses_actives = [];
				payload.clause_spec = '';
				payload.exclusions = '';
				payload.architecte = '';
				payload.version_document = '';
				payload.annexes = '';
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
			numero_contrat: 'Numéro de contrat',
			date_contrat: 'Date du contrat',
			statut: 'Statut',
			type_contrat: 'Type de contrat',
			ville_signature: 'Ville de signature',
			client_nom: 'Nom du client',
			client_cin: 'CIN / N° entreprise',
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
			globalError: 'Erreur globale',
		}),
		[],
	);

	/* ── CDL: Available services and clauses ── */
	const cdlServiceOptions = useMemo(() => [
		'Design d\'intérieur', 'Travaux de finition', 'Gros œuvre',
		'Ameublement', 'Suivi de chantier', 'Plans & Visuels 3D',
		'Coordination corps de métier', 'Livraison clé en main',
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

	const validationErrors = useMemo(() => {
		const errors: Record<string, string> = {};
		if (hasAttemptedSubmit) {
			Object.entries(formik.errors).forEach(([key, value]) => {
				if (key !== 'globalError' && typeof value === 'string') {
					errors[key] = value;
				}
			});
			/* Per-cell prestation errors (array) — show a single summary message */
			if (Array.isArray(formik.errors.prestations)) {
				const hasCellErrors = (formik.errors.prestations as unknown[]).some(
					(rowErr) => rowErr && typeof rowErr === 'object' && Object.keys(rowErr as object).length > 0,
				);
				if (hasCellErrors) errors['prestations'] = 'Veuillez corriger les erreurs dans les prestations';
			}
		}
		return errors;
	}, [formik.errors, hasAttemptedSubmit]);

	const hasValidationErrors = Object.keys(validationErrors).length > 0;
	const isLoading = isAddLoading || isEditLoading || isPending || (isEditMode && isDataLoading) || (!isEditMode && isCodeLoading);
	const shouldShowError = (axiosError?.status ?? 0) > 400 && !isLoading;

	/* ── helper: resolve display value for code-based dropdowns ── */
	const typeContratDisplay = typeContratItems.find((t) => t.code === formik.values.type_contrat)?.value ?? formik.values.type_contrat;

	const isBlueline = formik.values.company === 'blueline_works';

	/* ── Required-field helpers ── */
	const isBluelineRequired = (field: string) => isBlueline && (bluelineRequired as readonly string[]).includes(field);
	const isCdlRequired = (field: string) => !isBlueline && (casaDiLussoRequired as readonly string[]).includes(field);
	const isRequired = (field: string) => isBluelineRequired(field) || isCdlRequired(field);

	/* ── Auto-add first prestation row when switching to Blueline ── */
	useEffect(() => {
		if (isBlueline && (!formik.values.prestations || formik.values.prestations.length === 0)) {
			formik.setFieldValue('prestations', [{ nom: '', description: '', quantite: 0, unite: 'm2', prix_unitaire: 0 }]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isBlueline]);

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
										if (val) formik.setFieldValue('company', val);
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
										label="Numéro de contrat *"
										value={formik.values.numero_contrat}
										onChange={formik.handleChange('numero_contrat')}
										onBlur={formik.handleBlur('numero_contrat')}
										error={formik.touched.numero_contrat && Boolean(formik.errors.numero_contrat)}
										helperText={formik.touched.numero_contrat ? formik.errors.numero_contrat : ''}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<FingerprintIcon fontSize="small" />}
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
										label="Nom du client *"
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
													: 'Entre 0.01 et 100'
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
											label="Pénalité de retard"
											value={formik.values.penalite_retard}
											onChange={formik.handleChange('penalite_retard')}
											onBlur={formik.handleBlur('penalite_retard')}
											error={formik.touched.penalite_retard && Boolean(formik.errors.penalite_retard)}
											helperText={
												formik.touched.penalite_retard && formik.errors.penalite_retard
													? (formik.errors.penalite_retard as string)
													: 'Entre 0.01 et 100'
											}
											fullWidth
											size="small"
											theme={inputTheme}
											startIcon={<PercentIcon fontSize="small" />}
											endIcon="%"
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
								</Stack>
							</CardContent>
						</Card>

						{/* ── CDL: Services ── */}
						{!isBlueline && (
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
						{!isBlueline && (
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
						{!isBlueline && (
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
									{(formik.values.tranches ?? []).length === 0 ? (
										<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
											Aucune tranche ajoutée
										</Typography>
									) : (
										<Stack spacing={2}>
											{(formik.values.tranches ?? []).map((tr, idx) => (
												<Stack key={idx} direction="row" spacing={2} alignItems="center">
													<CustomTextInput
														id={`tranches.${idx}.label`}
														type="text"
														label={`Tranche ${idx + 1} – Libellé`}
														value={tr.label}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTranche(idx, 'label', e.target.value)}
														fullWidth
														size="small"
														theme={inputTheme}
													/>
													<Box sx={{ width: 120 }}>
													<CustomTextInput
														id={`tranches.${idx}.pourcentage`}
														type="text"
														label="%"
														value={String(tr.pourcentage)}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
															if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) {
																updateTranche(idx, 'pourcentage', parseFloat(e.target.value.replace(',', '.')) || 0);
															}
														}}
														fullWidth
														size="small"
														theme={inputTheme}
													/>
												</Box>
													<IconButton color="error" onClick={() => removeTranche(idx)} size="small">
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Stack>
											))}
										</Stack>
									)}
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
													label="Frais de redémarrage (€)"
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
						{!isBlueline && (
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
						{!isBlueline && (
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
											id="version_document"
											type="text"
											label="Version du document"
											value={formik.values.version_document}
											onChange={formik.handleChange('version_document')}
											onBlur={formik.handleBlur('version_document')}
											fullWidth={false}
											size="small"
											theme={inputTheme}
											startIcon={<AttachmentIcon fontSize="small" />}
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
														: 'Entre 0.01 et 100'
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
														: 'Entre 0.01 et 100'
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

