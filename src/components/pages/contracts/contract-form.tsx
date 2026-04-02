'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ApiErrorResponseType, ResponseDataInterface, SessionProps} from '@/types/_initTypes';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  Architecture as ArchitectureIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Attachment as AttachmentIcon,
  AttachMoney as AttachMoneyIcon,
  Badge as BadgeIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
  Checklist as ChecklistIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Gavel as GavelIcon,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationOnIcon,
  Lock as LockIcon,
  Notes as NotesIcon,
  Percent as PercentIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Plumbing as PlumbingIcon,
  Shield as ShieldIcon,
  ShoppingCart as ShoppingCartIcon,
  Straighten as StraightenIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';
import type {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {DataGrid} from '@mui/x-data-grid';
import {frFR} from '@mui/x-data-grid/locales';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {fr} from 'date-fns/locale';
import {useFormik} from 'formik';
import {toFormikValidationSchema} from 'zod-formik-adapter';
import {formatLocalDate, getLabelForKey, setFormikAutoErrors} from '@/utils/helpers';
import {
  companyItemsList,
  deviseItemsList as deviseItems,
  getTranslatedRawData,
  tribunalItemsList,
} from '@/utils/rawData';
import {CONTRACTS_LIST, CONTRACTS_VIEW} from '@/utils/routes';
import {useRouter} from 'next/navigation';
import {useToast, useLanguage} from '@/utils/hooks';
import {
  useAddContractMutation,
  useEditContractMutation,
  useGetCodeReferenceQuery,
  useGetContractQuery,
  useGetProjectsListQuery
} from '@/store/services/contract';
import {bluelineRequired, casaDiLussoRequired, contractSchema, stRequired} from '@/utils/formValidationSchemas';
import {INPUT_REQUIRED} from '@/utils/formValidationErrorMessages';
import {customDropdownTheme, customGridDropdownTheme, gridInputTheme, textInputTheme} from '@/utils/themes';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import CustomDropDownSelect from '@/components/formikElements/customDropDownSelect/customDropDownSelect';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import type {
  ContractCategoryType,
  ContractCompanyType,
  ContractFormValuesType,
  ContractPrestationType,
  ContractTrancheType,
  STTrancheType
} from '@/types/contractTypes';
import type {SelectChangeEvent} from '@mui/material/Select';
import {useInitAccessToken} from '@/contexts/InitContext';
import Styles from '@/styles/dashboard/dashboard.module.sass';
import {Protected} from '@/components/layouts/protected/protected';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';

const inputTheme = textInputTheme();
const gridCellInputTheme = gridInputTheme();
const gridCellDropdownTheme = customGridDropdownTheme();

const getTrancheTotal = (tranches?: Array<{ pourcentage: number }>) =>
  (tranches ?? []).reduce((sum, tranche) => sum + Number(tranche.pourcentage || 0), 0);

const hasValidTrancheTotal = (tranches?: Array<{
  pourcentage: number
}>) => Math.abs(getTrancheTotal(tranches) - 100) < 0.001;

type FormikContentProps = {
  token: string | undefined;
  id?: number;
};

const FormikContent: React.FC<FormikContentProps> = (props: FormikContentProps) => {
  const {token, id} = props;
  const {onSuccess, onError} = useToast();
  const {t} = useLanguage();
  const {
    clauseResiliationItemsList,
    clientQualiteItemsList,
    confidentialiteItemsList: confidentialiteItems,
    contractCategoryItemsList,
    contractStatutItemsList: statutItems,
    dureeEstimeeUniteItemsList,
    eauElectriciteItemsList,
    fournituresItemsList,
    garantieItemsList,
    garantieTypeItemsList,
    garantieUniteItemsList,
    modePaiementTexteItemsList,
    prestationNomItemsList,
    prestationUniteItemsList,
    stClausesActivesList,
    stDelaiUnitItemsList,
    stFormeJuridiqueItemsList,
    stLotTypeItemsList,
    stTypePrixItemsList,
    typeBienItemsList,
    typeContratItemsList: typeContratItems,
  } = getTranslatedRawData(t);
  const isEditMode = id !== undefined;
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    data: rawData,
    isLoading: isDataLoading,
    error: dataError,
  } = useGetContractQuery({id: id!}, {skip: !isEditMode || !token});

  const {
    data: generatedCodeData,
    isLoading: isCodeLoading,
  } = useGetCodeReferenceQuery(undefined, {skip: !token || isEditMode});

  const [addContract, {isLoading: isAddLoading, error: addError}] = useAddContractMutation();
  const [editContract, {isLoading: isEditLoading, error: editError}] = useEditContractMutation();

  const {
    data: projectsList,
  } = useGetProjectsListQuery({company: 'casa_di_lusso'}, {skip: !token});

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
      ? [{nom: '', description: '', quantite: 0, unite: 'm2', prix_unitaire: 0}]
      : [];
  const initialTranches = rawData?.tranches?.length
    ? rawData.tranches
    : initialIsCDL
      ? [{label: '', pourcentage: 0}]
      : [];
  const initialStTranches = rawData?.st_tranches?.length
    ? rawData.st_tranches
    : initialIsST
      ? [{label: '', pourcentage: 0, delai_jours: 0}]
      : [];

  // Parse "30 jours" / "6 mois" format from backend into separate value + unit fields
  let parsedDuree = '';
  let parsedDureeUnite = 'jours';
  if (rawData?.duree_estimee) {
    const match = rawData.duree_estimee.trim().match(/^(\d+)\s*(jours|mois)$/i);
    if (match) {
      parsedDuree = match[1];
      parsedDureeUnite = match[2].toLowerCase();
    } else {
      parsedDuree = rawData.duree_estimee;
    }
  }

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
      duree_estimee: parsedDuree,
      duree_estimee_unite: parsedDureeUnite,
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
      st_lot_type: Array.isArray(rawData?.st_lot_type) ? rawData.st_lot_type : rawData?.st_lot_type ? [rawData.st_lot_type as string] : [],
      st_lot_description: rawData?.st_lot_description ?? '',
      st_type_prix: Array.isArray(rawData?.st_type_prix) ? rawData.st_type_prix : rawData?.st_type_prix ? [rawData.st_type_prix as string] : [],
      st_retenue_garantie: rawData?.st_retenue_garantie != null ? String(rawData.st_retenue_garantie) : '10',
      st_avance: rawData?.st_avance != null ? String(rawData.st_avance) : '',
      st_penalite_taux: rawData?.st_penalite_taux != null ? String(rawData.st_penalite_taux) : '',
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
        val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (typeof val === 'number' && Number.isNaN(val)) || (Array.isArray(val) && val.length === 0);
      const isST = values.company === 'casa_di_lusso' && values.contract_category === 'sous_traitance';
      // client_nom: required for all companies except ST (ST has no traditional client)
      if (!isST && isEmpty(values.client_nom)) {
        errors.client_nom = INPUT_REQUIRED();
      }
      if (values.company === 'blueline_works') {
        bluelineRequired.forEach((key) => {
          if (isEmpty(values[key as keyof ContractFormValuesType])) {
            errors[key] = INPUT_REQUIRED();
          }
        });
      } else if (isST) {
        stRequired.forEach((key) => {
          if (isEmpty(values[key as keyof ContractFormValuesType])) {
            errors[key] = INPUT_REQUIRED();
          }
        });
      } else if (values.company === 'casa_di_lusso') {
        casaDiLussoRequired.forEach((key) => {
          if (isEmpty(values[key as keyof ContractFormValuesType])) {
            errors[key] = INPUT_REQUIRED();
          }
        });
      }
      return errors;
    },
    onSubmit: async (data, {setFieldError}) => {
      setHasAttemptedSubmit(true);
      setIsPending(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {globalError, duree_estimee_unite, ...fields} = data;
      const isBlueline = fields.company === 'blueline_works';
      const isST = fields.company === 'casa_di_lusso' && fields.contract_category === 'sous_traitance';
      const payload: Record<string, unknown> = {
        ...fields,
        duree_estimee: fields.duree_estimee && duree_estimee_unite
          ? `${fields.duree_estimee} ${duree_estimee_unite}`
          : (fields.duree_estimee || ''),
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
        payload.st_lot_type = [];
        payload.st_lot_description = '';
        payload.st_type_prix = [];
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
          await editContract({id: id!, data: payload}).unwrap();
          onSuccess(t.contracts.contractUpdatedSuccess);
          router.push(CONTRACTS_VIEW(id!));
        } else {
          const result = await addContract({data: payload}).unwrap();
          onSuccess(t.contracts.contractCreatedSuccess);
          router.push(CONTRACTS_VIEW(result.id));
        }
      } catch (e) {
        if (isEditMode) {
          onError(t.contracts.contractUpdateError);
        } else {
          onError(t.contracts.contractCreateError);
        }
        setFormikAutoErrors({e, setFieldError});
      } finally {
        setIsPending(false);
      }
    },
  });

  const fieldLabels = useMemo<Record<string, string>>(
    () => ({
      company: t.contracts.company,
      contract_category: t.contracts.category,
      numero_contrat: t.contracts.contractNumber,
      date_contrat: t.contracts.contractDate,
      statut: t.contracts.status,
      type_contrat: t.contracts.contractType,
      ville_signature: t.contracts.signatureCity,
      client_nom: t.contracts.clientName,
      client_cin: t.contracts.cinNumber,
      client_qualite: t.contracts.quality,
      client_adresse: t.contracts.address,
      client_tel: t.contracts.phone,
      client_email: t.contracts.email,
      type_bien: t.contracts.propertyType,
      surface: t.contracts.surface,
      adresse_travaux: t.contracts.workAddress,
      date_debut: t.contracts.startDate,
      duree_estimee: t.contracts.estimatedDuration,
      description_travaux: t.contracts.workDescription,
      montant_ht: t.contracts.amountHT,
      devise: t.contracts.currency,
      tva: t.contracts.tva,
      penalite_retard: t.contracts.latePenalty,
      garantie: t.contracts.warranty,
      tribunal: t.contracts.competentCourt,
      responsable_projet: t.contracts.projectManager,
      confidentialite: t.contracts.confidentiality,
      mode_paiement_texte: t.contracts.paymentMethod,
      rib: t.contracts.ribCoordinates,
      services: t.contracts.agreedServices,
      conditions_acces: t.contracts.accessConditions,
      tranches: t.contracts.paymentSchedule,
      delai_retard: t.contracts.toleratedDelay,
      frais_redemarrage: t.contracts.restartFees,
      delai_reserves: t.contracts.reserveDelay,
      clauses_actives: t.contracts.activeClausesLabel,
      clause_spec: t.contracts.specificClause,
      exclusions: t.contracts.contractualExclusions,
      architecte: t.contracts.architectDesigner,
      annexes: t.contracts.annexes,
      client_ville: t.contracts.clientCity,
      client_cp: t.contracts.clientPostalCode,
      chantier_ville: t.contracts.constructionCity,
      chantier_etage: t.contracts.constructionFloor,
      prestations: t.contracts.prestations,
      fournitures: t.contracts.supplies,
      materiaux_detail: t.contracts.materialsDetail,
      eau_electricite: t.contracts.waterElectricity,
      garantie_nb: t.contracts.duration,
      garantie_unite: t.contracts.warrantyUnit,
      garantie_type: t.contracts.warrantyType,
      exclusions_garantie: t.contracts.warrantyExclusions,
      acompte: t.contracts.deposit,
      tranche2: t.contracts.tranche2,
      clause_resiliation: t.contracts.terminationClause,
      notes: t.contracts.notes,
      /* ST fields */
      st_projet: t.contracts.architectDesigner,
      st_name: t.contracts.stSubcontractorName,
      st_forme: t.contracts.stLegalForm,
      st_capital: t.contracts.stCapital,
      st_rc: t.contracts.stTradeRegister,
      st_ice: t.contracts.stICE,
      st_if: t.contracts.stTaxId,
      st_cnss: t.contracts.stCNSS,
      st_addr: t.contracts.stSubcontractorAddress,
      st_rep: t.contracts.stLegalRep,
      st_cin: t.contracts.stRepCIN,
      st_qualite: t.contracts.stRepQuality,
      st_tel: t.contracts.stPhone,
      st_email: t.contracts.stEmail,
      st_rib: t.contracts.stRIB,
      st_banque: t.contracts.stBank,
      st_lot_type: t.contracts.stLotType,
      st_lot_description: t.contracts.stLotDescription,
      st_type_prix: t.contracts.stPriceType,
      st_retenue_garantie: t.contracts.stRetentionGuarantee,
      st_avance: t.contracts.stAdvance,
      st_penalite_taux: t.contracts.stLatePenaltyRate,
      st_plafond_penalite: t.contracts.stPenaltyCeiling,
      st_delai_paiement: t.contracts.stPaymentDelay,
      st_tranches: t.contracts.scheduleST,
      st_delai_val: t.contracts.stExecutionDelay,
      st_delai_unit: t.contracts.stDelayUnit,
      st_garantie_mois: t.contracts.stWarrantyMonths,
      st_delai_reserves: t.contracts.stReserveDelay,
      st_delai_med: t.contracts.stFormalNoticeDelay,
      st_clauses_actives: t.contracts.activeClausesST,
      st_observations: t.contracts.stObservations,
      globalError: t.contracts.globalError,
    }),
    [t],
  );

  /* ── CDL: Available services and clauses ── */
  const cdlServiceOptions = useMemo(() => [
    t.contracts.svcDesign,
    t.contracts.svcDemolition,
    t.contracts.svcMasonry,
    t.contracts.svcCeilings,
    t.contracts.svcFloorCoatings,
    t.contracts.svcWallCoatings,
    t.contracts.svcWoodwork,
    t.contracts.svcAluminium,
    t.contracts.svcMetalwork,
    t.contracts.svcGlasswork,
    t.contracts.svcPlumbing,
    t.contracts.svcElectricity,
    t.contracts.svcHomeAutomation,
    t.contracts.svcHVAC,
    t.contracts.svcInsulation,
    t.contracts.svcPainting,
    t.contracts.svcPlastering,
    t.contracts.svcTiling,
    t.contracts.svcMarble,
    t.contracts.svcKitchen,
    t.contracts.svcBathroom,
    t.contracts.svcDressing,
    t.contracts.svcStairs,
    t.contracts.svcPool,
    t.contracts.svcLandscaping,
    t.contracts.svcFurniture,
    t.contracts.svcElevators,
    t.contracts.svcFireSafety,
    t.contracts.svcWaterproofing,
    t.contracts.svcProjectManagement,
  ], [t]);

  const cdlClauseOptions = useMemo(() => [
    {key: 'c-comportement', label: t.contracts.clauseBehavior},
    {key: 'c-prop-intel', label: t.contracts.clauseIP},
    {key: 'c-image', label: t.contracts.clauseImage},
    {key: 'c-confidential', label: t.contracts.clauseConfidentiality},
    {key: 'c-sous-traiter', label: t.contracts.clauseSubcontracting},
    {key: 'c-materiau-prix', label: t.contracts.clauseMaterialPrices},
    {key: 'c-force-maj', label: t.contracts.clauseForceMajeure},
    {key: 'c-abandon-chant', label: t.contracts.clauseSiteAbandonment},
    {key: 'c-non-debauch', label: t.contracts.clauseNonPoaching},
    {key: 'c-anti-litige', label: t.contracts.clauseMediation},
  ], [t]);

  /* ── CDL: Tranches helpers ── */
  const addTranche = useCallback(() => {
    const current = formik.values.tranches ?? [];
    formik.setFieldValue('tranches', [...current, {label: '', pourcentage: 0}]);
  }, [formik]);

  const removeTranche = useCallback((index: number) => {
    const current = formik.values.tranches ?? [];
    formik.setFieldValue('tranches', current.filter((_, i) => i !== index));
  }, [formik]);

  const updateTranche = useCallback((index: number, field: keyof ContractTrancheType, value: string | number) => {
    const current = [...(formik.values.tranches ?? [])];
    current[index] = {...current[index], [field]: value};
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
    formik.setFieldValue('st_tranches', [...current, {label: '', pourcentage: 0, delai_jours: 0}]);
  }, [formik]);

  const removeStTranche = useCallback((index: number) => {
    const current = formik.values.st_tranches ?? [];
    formik.setFieldValue('st_tranches', current.filter((_: STTrancheType, i: number) => i !== index));
  }, [formik]);

  const updateStTranche = useCallback((index: number, field: keyof STTrancheType, value: string | number) => {
    const current = [...(formik.values.st_tranches ?? [])];
    current[index] = {...current[index], [field]: value};
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

  /* ── ST: Lot & Type prix toggles ── */
  const toggleStLotType = useCallback((code: string) => {
    const current = formik.values.st_lot_type ?? [];
    if (current.includes(code)) {
      formik.setFieldValue('st_lot_type', current.filter((c) => c !== code));
    } else {
      formik.setFieldValue('st_lot_type', [...current, code]);
    }
  }, [formik]);

  const toggleStTypePrix = useCallback((code: string) => {
    const current = formik.values.st_type_prix ?? [];
    if (current.includes(code)) {
      formik.setFieldValue('st_type_prix', current.filter((c) => c !== code));
    } else {
      formik.setFieldValue('st_type_prix', [...current, code]);
    }
  }, [formik]);

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const currentCompany = formik.values.company;
    const currentCategory = formik.values.contract_category;
    const currentTranches = formik.values.tranches ?? [];
    const currentStTranches = formik.values.st_tranches ?? [];
    const blFields = new Set(['prestations', 'fournitures', 'eau_electricite', 'acompte', 'tranche2', 'clause_resiliation', 'client_ville', 'client_cp', 'chantier_ville', 'chantier_etage', 'garantie_nb', 'garantie_unite', 'garantie_type', 'exclusions_garantie', 'materiaux_detail', 'notes']);
    const cdlFields = new Set(['type_contrat', 'services', 'tranches', 'delai_retard', 'frais_redemarrage', 'delai_reserves', 'clauses_actives', 'clause_spec', 'exclusions', 'architecte', 'annexes', 'conditions_acces']);
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
        if (hasCellErrors) errors['prestations'] = t.contracts.fixPrestationErrors;
      }
      /* Per-cell CDL tranche errors (array) — show only for standard CDL */
      if (!currentIsST && currentCompany === 'casa_di_lusso' && Array.isArray(formik.errors.tranches)) {
        const hasCellErrors = (formik.errors.tranches as unknown[]).some(
          (rowErr) => rowErr && typeof rowErr === 'object' && Object.keys(rowErr as object).length > 0,
        );
        if (!hasValidTrancheTotal(currentTranches)) {
          errors['tranches'] = t.contracts.echeancierTotalError;
        } else if (hasCellErrors) {
          errors['tranches'] = t.contracts.fixScheduleErrors;
        }
      }
      /* Per-cell ST tranche errors (array) — show only for ST */
      if (currentIsST && Array.isArray(formik.errors.st_tranches)) {
        const hasCellErrors = (formik.errors.st_tranches as unknown[]).some(
          (rowErr) => rowErr && typeof rowErr === 'object' && Object.keys(rowErr as object).length > 0,
        );
        if (!hasValidTrancheTotal(currentStTranches)) {
          errors['st_tranches'] = t.contracts.echeancierTotalError;
        } else if (hasCellErrors) {
          errors['st_tranches'] = t.contracts.fixStTrancheErrors;
        }
      }
    }
    return errors;
  }, [formik.errors, formik.values.company, formik.values.contract_category, formik.values.tranches, formik.values.st_tranches, hasAttemptedSubmit, t]);

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
    const {setFieldValue, values} = formikRef.current;
    if (isBlueline && !values.prestations?.length) {
      setFieldValue('prestations', [{nom: '', description: '', quantite: 0, unite: 'm2', prix_unitaire: 0}]);
    } else if (isST && !values.st_tranches?.length) {
      setFieldValue('st_tranches', [{label: '', pourcentage: 0}]);
    } else if (isCDL && !values.tranches?.length) {
      setFieldValue('tranches', [{label: '', pourcentage: 0}]);
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
    const empty: ContractPrestationType = {nom: '', description: '', quantite: 0, unite: 'm2', prix_unitaire: 0};
    const current = formik.values.prestations ?? [];
    formik.setFieldValue('prestations', [...current, {...empty}]);
  }, [formik]);

  const removePrestation = useCallback((index: number) => {
    const current = formik.values.prestations ?? [];
    formik.setFieldValue('prestations', current.filter((_, i) => i !== index));
  }, [formik]);

  const updatePrestation = useCallback((index: number, field: keyof ContractPrestationType, value: string | number) => {
    const current = [...(formik.values.prestations ?? [])];
    current[index] = {...current[index], [field]: value};
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
      headerName: t.contracts.designation,
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
            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      headerName: t.contracts.description,
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const realIdx = Number(params.id);
        const p = (formik.values.prestations ?? [])[realIdx];
        if (!p) return null;
        return (
          <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      headerName: t.contracts.quantity,
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
            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      headerName: t.contracts.unit,
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => {
        const realIdx = Number(params.id);
        const p = (formik.values.prestations ?? [])[realIdx];
        if (!p) return null;
        return (
          <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      headerName: t.contracts.unitPrice,
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
            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      headerName: t.contracts.total,
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const realIdx = Number(params.id);
        const p = (formik.values.prestations ?? [])[realIdx];
        if (!p) return null;
        return (
          <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
        return (
          <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
            <Tooltip title={total > 1 ? t.common.delete : ''}>
              <span>
                <IconButton size="small" color="error" onClick={() => removePrestation(realIdx)} disabled={total <= 1}>
                  <DeleteIcon/>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [formik.values.prestations, formik.values.devise, updatePrestation, removePrestation, prestationCellErrors, hasAttemptedSubmit, t, prestationNomItemsList, prestationUniteItemsList]);

  const prestationRows = useMemo(() =>
      (formik.values.prestations ?? []).map((p, i) => ({id: i, ...p})),
    [formik.values.prestations],
  );

  /* ── CDL: Tranche DataGrid columns ── */
  const trancheColumns: GridColDef[] = useMemo(() => [
    {
      field: 'label',
      headerName: t.contracts.installmentLabel,
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
            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      headerName: t.contracts.percentage,
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const realIdx = Number(params.id);
        const tr = (formik.values.tranches ?? [])[realIdx];
        if (!tr) return null;
        const errKey = `${realIdx}_pourcentage`;
        const hasFieldError = hasAttemptedSubmit && !!trancheCellErrors[errKey];
        const hasError = hasFieldError || cdlTrancheTotalInvalid;
        const errMsg = hasFieldError ? (trancheCellErrors[errKey] ?? '') : t.contracts.echeancierTotalError;
        return (
          <Tooltip title={hasError ? errMsg : ''} arrow>
            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
        return (
          <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
            <Tooltip title={total > 1 ? t.common.delete : ''}>
              <span>
                <IconButton size="small" color="error" onClick={() => removeTranche(realIdx)} disabled={total <= 1}>
                  <DeleteIcon/>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [formik.values.tranches, updateTranche, removeTranche, trancheCellErrors, hasAttemptedSubmit, cdlTrancheTotalInvalid, t]);

  const trancheRows = useMemo(() =>
      (formik.values.tranches ?? []).map((tr, i) => ({id: i, ...tr})),
    [formik.values.tranches],
  );

  /* ── ST: Tranche DataGrid columns ── */
  const stTrancheColumns: GridColDef[] = useMemo(() => [
    {
      field: 'label',
      headerName: t.contracts.installmentLabel,
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
            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      headerName: t.contracts.percentage,
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const realIdx = Number(params.id);
        const tr = (formik.values.st_tranches ?? [])[realIdx];
        if (!tr) return null;
        const errKey = `${realIdx}_pourcentage`;
        const hasFieldError = hasAttemptedSubmit && !!stTrancheCellErrors[errKey];
        const hasError = hasFieldError || stTrancheTotalInvalid;
        const errMsg = hasFieldError ? (stTrancheCellErrors[errKey] ?? '') : t.contracts.echeancierTotalError;
        return (
          <Tooltip title={hasError ? errMsg : ''} arrow>
            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
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
      field: 'delai_jours',
      headerName: t.contracts.delayDays,
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const realIdx = Number(params.id);
        const tr = (formik.values.st_tranches ?? [])[realIdx];
        if (!tr) return null;
        return (
          <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
            <CustomTextInput
              id={`st_tranches.${realIdx}.delai_jours`}
              type="text"
              label=""
              value={String(tr.delai_jours ?? '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (/^\d*$/.test(e.target.value)) {
                  updateStTranche(realIdx, 'delai_jours', parseInt(e.target.value, 10) || 0);
                }
              }}
              size="small"
              theme={gridCellInputTheme}
              endIcon={<InputAdornment position="end">j</InputAdornment>}
            />
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
        const total = (formik.values.st_tranches ?? []).length;
        return (
          <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center'}}>
            <Tooltip title={total > 1 ? t.common.delete : ''}>
              <span>
                <IconButton size="small" color="error" onClick={() => removeStTranche(realIdx)} disabled={total <= 1}>
                  <DeleteIcon/>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [formik.values.st_tranches, updateStTranche, removeStTranche, stTrancheCellErrors, hasAttemptedSubmit, stTrancheTotalInvalid, t]);

  const stTrancheRows = useMemo(() =>
      (formik.values.st_tranches ?? []).map((tr, i) => ({id: i, ...tr})),
    [formik.values.st_tranches],
  );

  return (
    <Stack spacing={3} sx={{p: {xs: 2, md: 3}}}>
      <Stack direction={isMobile ? 'column' : 'row'} pt={2} justifyContent="space-between" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon/>}
          onClick={() => router.push(CONTRACTS_LIST)}
          sx={{
            whiteSpace: 'nowrap',
            px: {xs: 1.5, sm: 2, md: 3},
            py: {xs: 0.8, sm: 1, md: 1},
            fontSize: {xs: '0.85rem', sm: '0.9rem', md: '1rem'},
          }}
        >
          {t.navigation.contractsList}
        </Button>
      </Stack>
      {hasValidationErrors && (
        <Alert severity="error" icon={<WarningIcon/>} sx={{mb: 2}}>
          <Typography variant="subtitle2" fontWeight={600}>
            {t.common.validationErrorsDetected}
          </Typography>
          <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
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
        <ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B"/>
      ) : shouldShowError ? (
        <ApiAlert errorDetails={axiosError?.data.details}/>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            {/* ── Company Selector ── */}
            <Card elevation={2} sx={{borderRadius: 2}}>
              <CardContent sx={{p: 3}}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                  <BusinessIcon color="primary"/>
                  <Typography variant="h6" fontWeight={700}>{t.contracts.company}</Typography>
                </Stack>
                <Divider sx={{mb: 3}}/>
                <ToggleButtonGroup
                  value={formik.values.company}
                  exclusive
                  onChange={(_e, val: string | null) => {
                    if (val) {
                      formik.setFieldValue('company', val as ContractCompanyType);
                      formik.setFieldValue('tranches', []);
                      formik.setFieldValue('st_tranches', []);
                      formik.setFieldValue('prestations', []);
                      void formik.setTouched({}, false);
                      setHasAttemptedSubmit(false);
                    }
                  }}
                  sx={{width: '100%'}}
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
                  <Box sx={{mt: 2}}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{mb: 1}}>
                      {t.contracts.contractCategoryLabel}
                    </Typography>
                    <ToggleButtonGroup
                      value={formik.values.contract_category}
                      exclusive
                      onChange={(_e, val: string | null) => {
                        if (val) {
                          formik.setFieldValue('contract_category', val as ContractCategoryType);
                          formik.setFieldValue('tranches', []);
                          formik.setFieldValue('st_tranches', []);
                          void formik.setTouched({}, false);
                          setHasAttemptedSubmit(false);
                        }
                      }}
                      sx={{width: '100%'}}
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
            <Card elevation={2} sx={{borderRadius: 2}}>
              <CardContent sx={{p: 3}}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                  <AssignmentIcon color="primary"/>
                  <Typography variant="h6" fontWeight={700}>{t.contracts.identification}</Typography>
                </Stack>
                <Divider sx={{mb: 3}}/>
                <Stack spacing={2.5}>
                  <CustomTextInput
                    id="numero_contrat"
                    type="text"
                    label={t.contracts.contractNumber}
                    value={formik.values.numero_contrat}
                    onChange={formik.handleChange('numero_contrat')}
                    onBlur={formik.handleBlur('numero_contrat')}
                    error={formik.touched.numero_contrat && Boolean(formik.errors.numero_contrat)}
                    helperText={formik.touched.numero_contrat ? formik.errors.numero_contrat : ''}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<FingerprintIcon fontSize="small"/>}
                    disabled
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      label={t.contracts.contractDate}
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
                                <CalendarTodayIcon fontSize="small" color="action"/>
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                    <CustomDropDownSelect
                      id="statut"
                      label={t.contracts.status}
                      items={isEditMode ? statutItems.map((s) => s.value) : [statutItems.find((s) => s.code === 'Brouillon')?.value ?? 'Brouillon']}
                      value={statutItems.find((s) => s.code === formik.values.statut)?.value ?? formik.values.statut}
                      onChange={(e: SelectChangeEvent) => {
                        const selected = statutItems.find((s) => s.value === e.target.value);
                        formik.setFieldValue('statut', selected?.code ?? e.target.value);
                      }}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<FlagIcon fontSize="small"/>}
                      disabled={!isEditMode}
                    />
                    {isCDL && (
                      <CustomDropDownSelect
                        id="type_contrat"
                        label={`${t.contracts.contractType}${isRequired('type_contrat') ? ' *' : ''}`}
                        items={typeContratItems.map((t) => t.value)}
                        value={typeContratDisplay}
                        onChange={(e: SelectChangeEvent) => {
                          const selected = typeContratItems.find((t) => t.value === e.target.value);
                          formik.setFieldValue('type_contrat', selected?.code ?? e.target.value);
                        }}
                        size="small"
                        theme={customDropdownTheme()}
                        startIcon={<DescriptionIcon fontSize="small"/>}
                        error={formik.touched.type_contrat && Boolean(formik.errors.type_contrat)}
                        helperText={formik.touched.type_contrat ? (formik.errors.type_contrat as string) : ''}
                      />
                    )}
                  </Stack>
                  <CustomTextInput
                    id="ville_signature"
                    type="text"
                    label={t.contracts.signingCity}
                    value={formik.values.ville_signature}
                    onChange={formik.handleChange('ville_signature')}
                    onBlur={formik.handleBlur('ville_signature')}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<LocationOnIcon fontSize="small"/>}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* ── Client ── */}
            <Card elevation={2} sx={{borderRadius: 2}}>
              <CardContent sx={{p: 3}}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                  <PersonIcon color="primary"/>
                  <Typography variant="h6" fontWeight={700}>{t.contracts.client}</Typography>
                </Stack>
                <Divider sx={{mb: 3}}/>
                <Stack spacing={2.5}>
                  <CustomTextInput
                    id="client_nom"
                    type="text"
                    label={isST ? t.contracts.clientNameOptional : t.contracts.clientNameRequired}
                    value={formik.values.client_nom}
                    onChange={formik.handleChange('client_nom')}
                    onBlur={formik.handleBlur('client_nom')}
                    error={formik.touched.client_nom && Boolean(formik.errors.client_nom)}
                    helperText={formik.touched.client_nom ? formik.errors.client_nom : ''}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<PersonIcon fontSize="small"/>}
                  />
                  <CustomTextInput
                    id="client_cin"
                    type="text"
                    label={t.contracts.cinNumber}
                    value={formik.values.client_cin}
                    onChange={formik.handleChange('client_cin')}
                    onBlur={formik.handleBlur('client_cin')}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<BadgeIcon fontSize="small"/>}
                  />
                  <CustomDropDownSelect
                    id="client_qualite"
                    label={t.contracts.quality}
                    items={clientQualiteItemsList.map((q) => q.value)}
                    value={clientQualiteItemsList.find((q) => q.code === formik.values.client_qualite)?.value ?? formik.values.client_qualite}
                    onChange={(e: SelectChangeEvent) => {
                      const selected = clientQualiteItemsList.find((q) => q.value === e.target.value);
                      formik.setFieldValue('client_qualite', selected?.code ?? e.target.value);
                    }}
                    size="small"
                    theme={customDropdownTheme()}
                    startIcon={<DescriptionIcon fontSize="small"/>}
                  />
                  <CustomTextInput
                    id="client_tel"
                    type="tel"
                    label={t.contracts.phone}
                    value={formik.values.client_tel}
                    onChange={formik.handleChange('client_tel')}
                    onBlur={formik.handleBlur('client_tel')}
                    error={formik.touched.client_tel && Boolean(formik.errors.client_tel)}
                    helperText={formik.touched.client_tel ? (formik.errors.client_tel as string) : ''}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<PhoneIcon fontSize="small"/>}
                  />
                  <CustomTextInput
                    id="client_email"
                    type="email"
                    label={t.contracts.email}
                    value={formik.values.client_email}
                    onChange={formik.handleChange('client_email')}
                    onBlur={formik.handleBlur('client_email')}
                    error={formik.touched.client_email && Boolean(formik.errors.client_email)}
                    helperText={formik.touched.client_email ? (formik.errors.client_email as string) : ''}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<EmailIcon fontSize="small"/>}
                  />
                  <CustomTextInput
                    id="client_adresse"
                    type="text"
                    label={t.contracts.address}
                    value={formik.values.client_adresse}
                    onChange={formik.handleChange('client_adresse')}
                    onBlur={formik.handleBlur('client_adresse')}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<HomeIcon fontSize="small"/>}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* ── Travaux ── */}
            <Card elevation={2} sx={{borderRadius: 2}}>
              <CardContent sx={{p: 3}}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                  <BuildIcon color="primary"/>
                  <Typography variant="h6" fontWeight={700}>{t.contracts.works}</Typography>
                </Stack>
                <Divider sx={{mb: 3}}/>
                <Stack spacing={2.5}>
                  <CustomDropDownSelect
                    id="type_bien"
                    label={t.contracts.propertyType}
                    items={typeBienItemsList.map((i) => i.value)}
                    value={typeBienItemsList.find((i) => i.code === formik.values.type_bien)?.value ?? formik.values.type_bien}
                    onChange={(e: SelectChangeEvent) => {
                      const selected = typeBienItemsList.find((i) => i.value === e.target.value);
                      formik.setFieldValue('type_bien', selected?.code ?? e.target.value);
                    }}
                    size="small"
                    theme={customDropdownTheme()}
                    startIcon={<HomeIcon fontSize="small"/>}
                  />
                  <CustomTextInput
                    id="surface"
                    type="text"
                    label={t.contracts.surface}
                    value={formik.values.surface}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (/^-?(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('surface', e.target.value);
                    }}
                    onBlur={formik.handleBlur('surface')}
                    error={formik.touched.surface && Boolean(formik.errors.surface)}
                    helperText={formik.touched.surface ? (formik.errors.surface as string) : ''}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<StraightenIcon fontSize="small"/>}
                    slotProps={{input: {inputProps: {inputMode: 'decimal'}}}}
                  />
                  <CustomTextInput
                    id="adresse_travaux"
                    type="text"
                    label={t.contracts.worksAddress}
                    value={formik.values.adresse_travaux}
                    onChange={formik.handleChange('adresse_travaux')}
                    onBlur={formik.handleBlur('adresse_travaux')}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<LocationOnIcon fontSize="small"/>}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      label={t.contracts.startDate}
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
                                <CalendarTodayIcon fontSize="small" color="action"/>
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{flex: '1 1 120px', minWidth: 100}}>
                      <CustomTextInput
                        id="duree_estimee"
                        type="text"
                        label={t.contracts.estimatedDuration}
                        value={formik.values.duree_estimee}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (/^\d*$/.test(e.target.value)) formik.setFieldValue('duree_estimee', e.target.value);
                        }}
                        onBlur={formik.handleBlur('duree_estimee')}
                        fullWidth
                        size="small"
                        theme={inputTheme}
                        startIcon={<TimerIcon fontSize="small"/>}
                      />
                    </Box>
                    <Box sx={{flex: '0 0 110px'}}>
                      <CustomDropDownSelect
                        id="duree_estimee_unite"
                        label={t.contracts.unit}
                        items={dureeEstimeeUniteItemsList.map((i) => i.value)}
                        value={dureeEstimeeUniteItemsList.find((i) => i.code === formik.values.duree_estimee_unite)?.value ?? formik.values.duree_estimee_unite}
                        onChange={(e: SelectChangeEvent) => {
                          const selected = dureeEstimeeUniteItemsList.find((i) => i.value === e.target.value);
                          formik.setFieldValue('duree_estimee_unite', selected?.code ?? e.target.value);
                        }}
                        size="small"
                        theme={customDropdownTheme()}
                      />
                    </Box>
                  </Stack>
                  {!isBlueline && (
                    <CustomTextInput
                      id="responsable_projet"
                      type="text"
                      label={t.contracts.projectManager}
                      value={formik.values.responsable_projet}
                      onChange={formik.handleChange('responsable_projet')}
                      onBlur={formik.handleBlur('responsable_projet')}
                      fullWidth={false}
                      size="small"
                      theme={inputTheme}
                      startIcon={<PersonIcon fontSize="small"/>}
                    />
                  )}
                  <CustomTextInput
                    id="description_travaux"
                    type="text"
                    label={t.contracts.worksDescription}
                    value={formik.values.description_travaux}
                    onChange={formik.handleChange('description_travaux')}
                    onBlur={formik.handleBlur('description_travaux')}
                    multiline
                    rows={3}
                    fullWidth={false}
                    size="small"
                    theme={inputTheme}
                    startIcon={<NotesIcon fontSize="small"/>}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* ── Financier ── */}
            <Card elevation={2} sx={{borderRadius: 2}}>
              <CardContent sx={{p: 3}}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                  <AttachMoneyIcon color="primary"/>
                  <Typography variant="h6" fontWeight={700}>{t.contracts.financial}</Typography>
                </Stack>
                <Divider sx={{mb: 3}}/>
                <Stack spacing={2.5}>
                  <CustomTextInput
                    id="montant_ht"
                    type="text"
                    label={`${t.contracts.amountHT} *`}
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
                    startIcon={<AttachMoneyIcon fontSize="small"/>}
                    slotProps={{input: {inputProps: {inputMode: 'decimal'}}}}
                  />
                  <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                    <CustomDropDownSelect
                      id="devise"
                      label={t.contracts.currency}
                      items={deviseItems}
                      value={formik.values.devise}
                      onChange={(e: SelectChangeEvent) => formik.setFieldValue('devise', e.target.value)}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<AttachMoneyIcon fontSize="small"/>}
                    />
                  </Stack>
                  <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                    <CustomTextInput
                      id="tva"
                      type="number"
                      label={t.contracts.tva}
                      value={formik.values.tva}
                      onChange={formik.handleChange('tva')}
                      onBlur={formik.handleBlur('tva')}
                      error={(hasAttemptedSubmit || formik.touched.tva) && Boolean(formik.errors.tva)}
                      helperText={
                        (hasAttemptedSubmit || formik.touched.tva) && formik.errors.tva
                          ? (formik.errors.tva as string)
                          : t.contracts.between0and100
                      }
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<PercentIcon fontSize="small"/>}
                      endIcon="%"
                    />
                    <CustomTextInput
                      id="penalite_retard"
                      type="number"
                      label={t.contracts.latePenalty}
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
                      startIcon={<AttachMoneyIcon fontSize="small"/>}
                      endIcon="MAD/j"
                    />
                  </Stack>
                  <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                    <Box sx={{flex: 1, minWidth: 0}}>
                      <CustomDropDownSelect
                        id="mode_paiement_texte"
                        label={t.contracts.paymentMethod}
                        items={modePaiementTexteItemsList.map((i) => i.value)}
                        value={modePaiementTexteItemsList.find((i) => i.code === formik.values.mode_paiement_texte)?.value ?? formik.values.mode_paiement_texte}
                        onChange={(e: SelectChangeEvent) => {
                          const selected = modePaiementTexteItemsList.find((i) => i.value === e.target.value);
                          formik.setFieldValue('mode_paiement_texte', selected?.code ?? e.target.value);
                        }}
                        size="small"
                        theme={customDropdownTheme()}
                        startIcon={<AttachMoneyIcon fontSize="small"/>}
                      />
                    </Box>
                    <Box sx={{flex: 1, minWidth: 0}}>
                      <CustomTextInput
                        id="rib"
                        type="text"
                        label={t.contracts.ribCoordinates}
                        value={formik.values.rib}
                        onChange={formik.handleChange('rib')}
                        onBlur={formik.handleBlur('rib')}
                        fullWidth
                        size="small"
                        theme={inputTheme}
                        startIcon={<AccountBalanceIcon fontSize="small"/>}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* ── Clauses ── */}
            <Card elevation={2} sx={{borderRadius: 2}}>
              <CardContent sx={{p: 3}}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                  <GavelIcon color="primary"/>
                  <Typography variant="h6" fontWeight={700}>{t.contracts.clausesSection}</Typography>
                </Stack>
                <Divider sx={{mb: 3}}/>
                <Stack spacing={2.5}>
                  {!isBlueline && (
                    <CustomDropDownSelect
                      id="garantie"
                      label={t.contracts.warranty}
                      items={garantieItemsList.map((g) => g.value)}
                      value={garantieItemsList.find((g) => g.code === formik.values.garantie)?.value ?? formik.values.garantie}
                      onChange={(e: SelectChangeEvent) => {
                        const selected = garantieItemsList.find((g) => g.value === e.target.value);
                        formik.setFieldValue('garantie', selected?.code ?? e.target.value);
                      }}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<GavelIcon fontSize="small"/>}
                    />
                  )}
                  <CustomDropDownSelect
                    id="tribunal"
                    label={t.contracts.competentCourt}
                    items={tribunalItemsList.map((t) => t.value)}
                    value={tribunalItemsList.find((t) => t.code === formik.values.tribunal)?.value ?? formik.values.tribunal}
                    onChange={(e: SelectChangeEvent) => {
                      const selected = tribunalItemsList.find((t) => t.value === e.target.value);
                      formik.setFieldValue('tribunal', selected?.code ?? e.target.value);
                    }}
                    size="small"
                    theme={customDropdownTheme()}
                    startIcon={<GavelIcon fontSize="small"/>}
                  />
                  {!isBlueline && (
                    <CustomDropDownSelect
                      id="confidentialite"
                      label={t.contracts.confidentiality}
                      items={confidentialiteItems.map((c) => c.value)}
                      value={confidentialiteItems.find((c) => c.code === formik.values.confidentialite)?.value ?? formik.values.confidentialite}
                      onChange={(e: SelectChangeEvent) => {
                        const selected = confidentialiteItems.find((c) => c.value === e.target.value);
                        formik.setFieldValue('confidentialite', selected?.code ?? e.target.value);
                      }}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<LockIcon fontSize="small"/>}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* ── CDL: Services ── */}
            {isCDL && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <ChecklistIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.servicesCDL}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                    {cdlServiceOptions.map((svc) => (
                      <Chip
                        key={svc}
                        label={svc}
                        color={(formik.values.services ?? []).includes(svc) ? 'primary' : 'default'}
                        variant={(formik.values.services ?? []).includes(svc) ? 'filled' : 'outlined'}
                        onClick={() => toggleService(svc)}
                        sx={{fontFamily: 'Poppins', cursor: 'pointer'}}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* ── CDL: Projet ── */}
            {isCDL && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <ArchitectureIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.projectCDL}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <CustomTextInput
                      id="architecte"
                      type="text"
                      label={t.contracts.architect}
                      value={formik.values.architecte}
                      onChange={formik.handleChange('architecte')}
                      onBlur={formik.handleBlur('architecte')}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<ArchitectureIcon fontSize="small"/>}
                    />
                    <CustomTextInput
                      id="conditions_acces"
                      type="text"
                      label={t.contracts.accessConditions}
                      multiline
                      rows={3}
                      value={formik.values.conditions_acces}
                      onChange={formik.handleChange('conditions_acces')}
                      onBlur={formik.handleBlur('conditions_acces')}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<LockIcon fontSize="small"/>}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── CDL: Échéancier (Tranches) ── */}
            {isCDL && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{mb: 2}}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PlaylistAddCheckIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>{t.contracts.scheduleCDL}</Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon/>}
                      onClick={() => addTranche()}
                    >
                      {t.contracts.addInstallment}
                    </Button>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Box sx={{width: '100%'}}>
                    <DataGrid
                      rows={trancheRows}
                      columns={trancheColumns}
                      localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                      rowHeight={52}
                      disableColumnMenu
                      disableRowSelectionOnClick
                      hideFooter={(formik.values.tranches ?? []).length <= 5}
                      pageSizeOptions={[5, 10, 25]}
                      initialState={{pagination: {paginationModel: {pageSize: 5}}}}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        '& .MuiDataGrid-cell': {display: 'flex', alignItems: 'center'},
                        '& .MuiDataGrid-columnHeaders': {fontFamily: 'Poppins', fontWeight: 700},
                      }}
                    />
                  </Box>
                  <Box sx={{mt: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1}}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        (formik.values.tranches ?? []).reduce((s, t) => s + (t.pourcentage || 0), 0) === 100
                          ? 'success.main'
                          : cdlTrancheTotalInvalid
                            ? 'error.main'
                            : 'text.secondary'
                      }
                    >
                      Total : {(formik.values.tranches ?? []).reduce((s, t) => s + (t.pourcentage || 0), 0)
                        .toLocaleString('fr-MA', {minimumFractionDigits: 0, maximumFractionDigits: 2})} % / 100 %
                    </Typography>
                  </Box>
                  <Divider sx={{my: 3}}/>
                  <Stack spacing={2.5}>
                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                      <Box sx={{width: 200}}>
                        <CustomTextInput
                          id="delai_retard"
                          type="text"
                          label={t.contracts.delayPenaltyDays}
                          value={formik.values.delai_retard}
                          onChange={formik.handleChange('delai_retard')}
                          onBlur={formik.handleBlur('delai_retard')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<TimerIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{width: 200}}>
                        <CustomTextInput
                          id="frais_redemarrage"
                          type="text"
                          label={t.common.restartFeesLabel(formik.values.devise || 'MAD')}
                          value={formik.values.frais_redemarrage}
                          onChange={formik.handleChange('frais_redemarrage')}
                          onBlur={formik.handleBlur('frais_redemarrage')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<AttachMoneyIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{width: 200}}>
                        <CustomTextInput
                          id="delai_reserves"
                          type="text"
                          label={t.contracts.reserveLiftingDelay}
                          value={formik.values.delai_reserves}
                          onChange={formik.handleChange('delai_reserves')}
                          onBlur={formik.handleBlur('delai_reserves')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<TimerIcon fontSize="small"/>}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── CDL: Clauses actives ── */}
            {isCDL && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <GavelIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.activeClausesCDL}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1}}>
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
                        label={<Typography variant="body2" sx={{fontFamily: 'Poppins'}}>{opt.label}</Typography>}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* ── CDL: Clauses additionnelles ── */}
            {isCDL && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <AttachmentIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.additionalDetails}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <CustomTextInput
                      id="clause_spec"
                      type="text"
                      label={t.contracts.specificClause}
                      multiline
                      rows={3}
                      value={formik.values.clause_spec}
                      onChange={formik.handleChange('clause_spec')}
                      onBlur={formik.handleBlur('clause_spec')}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<GavelIcon fontSize="small"/>}
                    />
                    <CustomTextInput
                      id="exclusions"
                      type="text"
                      label={t.contracts.exclusions}
                      multiline
                      rows={3}
                      value={formik.values.exclusions}
                      onChange={formik.handleChange('exclusions')}
                      onBlur={formik.handleBlur('exclusions')}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<ShieldIcon fontSize="small"/>}
                    />
                    <CustomTextInput
                      id="annexes"
                      type="text"
                      label={t.contracts.annexes}
                      multiline
                      rows={3}
                      value={formik.values.annexes}
                      onChange={formik.handleChange('annexes')}
                      onBlur={formik.handleBlur('annexes')}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<AttachmentIcon fontSize="small"/>}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── ST: Sous-Traitant Identity ── */}
            {isST && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <PersonIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.subcontractorSection}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    {projectsList && projectsList.length > 0 && (
                      <CustomDropDownSelect
                        id="st_projet"
                        label={t.contracts.architectDesigner}
                        items={projectsList.map((p) => p.name)}
                        value={projectsList.find((p) => String(p.id) === formik.values.st_projet)?.name ?? ''}
                        onChange={(e: SelectChangeEvent) => {
                          const selected = projectsList.find((p) => p.name === e.target.value);
                          formik.setFieldValue('st_projet', selected ? String(selected.id) : '');
                        }}
                        size="small"
                        theme={customDropdownTheme()}
                        startIcon={<ArchitectureIcon fontSize="small"/>}
                      />
                    )}
                    <CustomTextInput
                      id="st_name"
                      type="text"
                      label={`${t.contracts.stSubcontractorNameLabel}${isRequired('st_name') ? ' *' : ''}`}
                      value={formik.values.st_name}
                      onChange={formik.handleChange('st_name')}
                      onBlur={formik.handleBlur('st_name')}
                      error={formik.touched.st_name && Boolean(formik.errors.st_name)}
                      helperText={formik.touched.st_name ? formik.errors.st_name : ''}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<BusinessIcon fontSize="small"/>}
                    />
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomDropDownSelect
                          id="st_forme"
                          label={t.contracts.legalForm}
                          items={stFormeJuridiqueItemsList.map((i) => i.value)}
                          value={stFormeJuridiqueItemsList.find((i) => i.code === formik.values.st_forme)?.value ?? formik.values.st_forme}
                          onChange={(e: SelectChangeEvent) => {
                            const selected = stFormeJuridiqueItemsList.find((i) => i.value === e.target.value);
                            formik.setFieldValue('st_forme', selected?.code ?? e.target.value);
                          }}
                          size="small"
                          theme={customDropdownTheme()}
                          startIcon={<DescriptionIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_capital"
                          type="text"
                          label={t.contracts.capital}
                          value={formik.values.st_capital}
                          onChange={formik.handleChange('st_capital')}
                          onBlur={formik.handleBlur('st_capital')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<AttachMoneyIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_rc"
                          type="text"
                          label={`${t.contracts.stTradeRegisterLabel}${isRequired('st_rc') ? ' *' : ''}`}
                          value={formik.values.st_rc}
                          onChange={formik.handleChange('st_rc')}
                          onBlur={formik.handleBlur('st_rc')}
                          error={formik.touched.st_rc && Boolean(formik.errors.st_rc)}
                          helperText={formik.touched.st_rc ? formik.errors.st_rc : ''}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<BadgeIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_ice"
                          type="text"
                          label={t.contracts.stICE}
                          value={formik.values.st_ice}
                          onChange={formik.handleChange('st_ice')}
                          onBlur={formik.handleBlur('st_ice')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<FingerprintIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_if"
                          type="text"
                          label={t.contracts.taxId}
                          value={formik.values.st_if}
                          onChange={formik.handleChange('st_if')}
                          onBlur={formik.handleBlur('st_if')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<BadgeIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_cnss"
                          type="text"
                          label={t.contracts.stCNSS}
                          value={formik.values.st_cnss}
                          onChange={formik.handleChange('st_cnss')}
                          onBlur={formik.handleBlur('st_cnss')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<ShieldIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <CustomTextInput
                      id="st_addr"
                      type="text"
                      label={`${t.contracts.stSubcontractorAddressLabel}${isRequired('st_addr') ? ' *' : ''}`}
                      value={formik.values.st_addr}
                      onChange={formik.handleChange('st_addr')}
                      onBlur={formik.handleBlur('st_addr')}
                      error={formik.touched.st_addr && Boolean(formik.errors.st_addr)}
                      helperText={formik.touched.st_addr ? formik.errors.st_addr : ''}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<HomeIcon fontSize="small"/>}
                    />
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_rep"
                          type="text"
                          label={`${t.contracts.stLegalRepLabel}${isRequired('st_rep') ? ' *' : ''}`}
                          value={formik.values.st_rep}
                          onChange={formik.handleChange('st_rep')}
                          onBlur={formik.handleBlur('st_rep')}
                          error={formik.touched.st_rep && Boolean(formik.errors.st_rep)}
                          helperText={formik.touched.st_rep ? formik.errors.st_rep : ''}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PersonIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_cin"
                          type="text"
                          label={t.contracts.stRepCIN}
                          value={formik.values.st_cin}
                          onChange={formik.handleChange('st_cin')}
                          onBlur={formik.handleBlur('st_cin')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<BadgeIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <CustomTextInput
                      id="st_qualite"
                      type="text"
                      label={t.contracts.representativeQuality}
                      value={formik.values.st_qualite}
                      onChange={formik.handleChange('st_qualite')}
                      onBlur={formik.handleBlur('st_qualite')}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<DescriptionIcon fontSize="small"/>}
                    />
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_tel"
                          type="text"
                          label={t.contracts.phone}
                          value={formik.values.st_tel}
                          onChange={formik.handleChange('st_tel')}
                          onBlur={formik.handleBlur('st_tel')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PhoneIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_email"
                          type="email"
                          label={t.contracts.email}
                          value={formik.values.st_email}
                          onChange={formik.handleChange('st_email')}
                          onBlur={formik.handleBlur('st_email')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<EmailIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_rib"
                          type="text"
                          label={t.contracts.stRIB}
                          value={formik.values.st_rib}
                          onChange={formik.handleChange('st_rib')}
                          onBlur={formik.handleBlur('st_rib')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<AccountBalanceIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_banque"
                          type="text"
                          label={t.contracts.bank}
                          value={formik.values.st_banque}
                          onChange={formik.handleChange('st_banque')}
                          onBlur={formik.handleBlur('st_banque')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<AccountBalanceIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── ST: Lot & Type ── */}
            {isST && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <CategoryIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.lotAndType}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="body2" sx={{mb: 1, fontWeight: 600, color: (formik.touched.st_lot_type && formik.errors.st_lot_type) ? 'error.main' : 'text.primary'}}>
                        {`${t.contracts.stLotType}${isRequired('st_lot_type') ? ' *' : ''}`}
                        {formik.touched.st_lot_type && formik.errors.st_lot_type && (
                          <Typography component="span" color="error" variant="caption" sx={{ml: 1}}>
                            {formik.errors.st_lot_type as string}
                          </Typography>
                        )}
                      </Typography>
                      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                        {stLotTypeItemsList.map((item) => {
                          const selected = (formik.values.st_lot_type ?? []).includes(item.code);
                          return (
                            <Chip
                              key={item.code}
                              label={item.value}
                              variant={selected ? 'filled' : 'outlined'}
                              color={selected ? 'primary' : 'default'}
                              onClick={() => toggleStLotType(item.code)}
                              sx={{cursor: 'pointer'}}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                    <CustomTextInput
                      id="st_lot_description"
                      type="text"
                      label={t.contracts.lotDescription}
                      multiline
                      rows={3}
                      value={formik.values.st_lot_description}
                      onChange={formik.handleChange('st_lot_description')}
                      onBlur={formik.handleBlur('st_lot_description')}
                      fullWidth
                      size="small"
                      theme={inputTheme}
                      startIcon={<NotesIcon fontSize="small"/>}
                    />
                    <Box>
                      <Typography variant="body2" sx={{mb: 1, fontWeight: 600, color: (formik.touched.st_type_prix && formik.errors.st_type_prix) ? 'error.main' : 'text.primary'}}>
                        {`${t.contracts.stPriceType}${isRequired('st_type_prix') ? ' *' : ''}`}
                        {formik.touched.st_type_prix && formik.errors.st_type_prix && (
                          <Typography component="span" color="error" variant="caption" sx={{ml: 1}}>
                            {formik.errors.st_type_prix as string}
                          </Typography>
                        )}
                      </Typography>
                      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                        {stTypePrixItemsList.map((item) => {
                          const selected = (formik.values.st_type_prix ?? []).includes(item.code);
                          return (
                            <Chip
                              key={item.code}
                              label={item.value}
                              variant={selected ? 'filled' : 'outlined'}
                              color={selected ? 'primary' : 'default'}
                              onClick={() => toggleStTypePrix(item.code)}
                              sx={{cursor: 'pointer'}}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── ST: Financial ── */}
            {isST && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <AttachMoneyIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.financialST}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_retenue_garantie"
                          type="text"
                          label={t.contracts.warrantyRetention}
                          value={formik.values.st_retenue_garantie}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_retenue_garantie', e.target.value);
                          }}
                          onBlur={formik.handleBlur('st_retenue_garantie')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PercentIcon fontSize="small"/>}
                          endIcon="%"
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_avance"
                          type="text"
                          label={t.contracts.advance}
                          value={formik.values.st_avance}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_avance', e.target.value);
                          }}
                          onBlur={formik.handleBlur('st_avance')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PercentIcon fontSize="small"/>}
                          endIcon="%"
                        />
                      </Box>
                    </Stack>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_penalite_taux"
                          type="text"
                          label={t.contracts.stLatePenaltyLabel}
                          value={formik.values.st_penalite_taux}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_penalite_taux', e.target.value);
                          }}
                          onBlur={formik.handleBlur('st_penalite_taux')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PercentIcon fontSize="small"/>}
                          endIcon="MAD/j"
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_plafond_penalite"
                          type="text"
                          label={t.contracts.penaltyCeiling}
                          value={formik.values.st_plafond_penalite}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (/^(0|[1-9]\d*)?([.,]\d*)?$/.test(e.target.value)) formik.setFieldValue('st_plafond_penalite', e.target.value);
                          }}
                          onBlur={formik.handleBlur('st_plafond_penalite')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PercentIcon fontSize="small"/>}
                          endIcon="%"
                        />
                      </Box>
                    </Stack>
                    <CustomTextInput
                      id="st_delai_paiement"
                      type="text"
                      label={t.contracts.paymentDelay}
                      value={formik.values.st_delai_paiement}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_delai_paiement', e.target.value);
                      }}
                      onBlur={formik.handleBlur('st_delai_paiement')}
                      fullWidth={false}
                      size="small"
                      theme={inputTheme}
                      startIcon={<TimerIcon fontSize="small"/>}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── ST: Échéancier (Tranches) ── */}
            {isST && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{mb: 2}}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PlaylistAddCheckIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>{t.contracts.scheduleST}</Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon/>}
                      onClick={() => addStTranche()}
                    >
                      {t.contracts.addInstallment}
                    </Button>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Box sx={{width: '100%'}}>
                    <DataGrid
                      rows={stTrancheRows}
                      columns={stTrancheColumns}
                      localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                      rowHeight={52}
                      disableColumnMenu
                      disableRowSelectionOnClick
                      hideFooter={(formik.values.st_tranches ?? []).length <= 5}
                      pageSizeOptions={[5, 10, 25]}
                      initialState={{pagination: {paginationModel: {pageSize: 5}}}}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        '& .MuiDataGrid-cell': {display: 'flex', alignItems: 'center'},
                        '& .MuiDataGrid-columnHeaders': {fontFamily: 'Poppins', fontWeight: 700},
                      }}
                    />
                  </Box>
                  <Box sx={{mt: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1}}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        (formik.values.st_tranches ?? []).reduce((s, t) => s + (t.pourcentage || 0), 0) === 100
                          ? 'success.main'
                          : stTrancheTotalInvalid
                            ? 'error.main'
                            : 'text.secondary'
                      }
                    >
                      Total : {(formik.values.st_tranches ?? []).reduce((s, t) => s + (t.pourcentage || 0), 0)
                        .toLocaleString('fr-MA', {minimumFractionDigits: 0, maximumFractionDigits: 2})} % / 100 %
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
            {isST && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <TimerIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.stDelaysWarranties}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_delai_val"
                          type="text"
                          label={`${t.contracts.stExecutionDelay}${isRequired('st_delai_val') ? ' *' : ''}`}
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
                          startIcon={<TimerIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomDropDownSelect
                          id="st_delai_unit"
                          label={t.contracts.delayUnit}
                          items={stDelaiUnitItemsList.map((i) => i.value)}
                          value={stDelaiUnitItemsList.find((i) => i.code === formik.values.st_delai_unit)?.value ?? formik.values.st_delai_unit}
                          onChange={(e: SelectChangeEvent) => {
                            const selected = stDelaiUnitItemsList.find((i) => i.value === e.target.value);
                            formik.setFieldValue('st_delai_unit', selected?.code ?? e.target.value);
                          }}
                          size="small"
                          theme={customDropdownTheme()}
                          startIcon={<TimerIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_garantie_mois"
                          type="text"
                          label={t.contracts.warrantyMonths}
                          value={formik.values.st_garantie_mois}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_garantie_mois', e.target.value);
                          }}
                          onBlur={formik.handleBlur('st_garantie_mois')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<ShieldIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="st_delai_reserves"
                          type="text"
                          label={t.contracts.reserveLiftingDelay}
                          value={formik.values.st_delai_reserves}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_delai_reserves', e.target.value);
                          }}
                          onBlur={formik.handleBlur('st_delai_reserves')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<TimerIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <CustomTextInput
                      id="st_delai_med"
                      type="text"
                      label={t.contracts.formalNoticeDelay}
                      value={formik.values.st_delai_med}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (/^\d*$/.test(e.target.value)) formik.setFieldValue('st_delai_med', e.target.value);
                      }}
                      onBlur={formik.handleBlur('st_delai_med')}
                      fullWidth={false}
                      size="small"
                      theme={inputTheme}
                      startIcon={<GavelIcon fontSize="small"/>}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── ST: Clauses actives ── */}
            {isST && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <GavelIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.activeClausesST}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1}}>
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
                        label={<Typography variant="body2" sx={{fontFamily: 'Poppins'}}>{opt.label}</Typography>}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* ── ST: Observations ── */}
            {isST && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <NotesIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.stObservations}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <CustomTextInput
                    id="st_observations"
                    type="text"
                    label={t.contracts.observations}
                    multiline
                    rows={4}
                    value={formik.values.st_observations}
                    onChange={formik.handleChange('st_observations')}
                    onBlur={formik.handleBlur('st_observations')}
                    fullWidth
                    size="small"
                    theme={inputTheme}
                    startIcon={<NotesIcon fontSize="small"/>}
                  />
                </CardContent>
              </Card>
            )}

            {/* ── Blueline: Prestations ── */}
            {isBlueline && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{mb: 2}}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <ShoppingCartIcon color="primary"/>
                      <Typography variant="h6" fontWeight={700}>{t.contracts.prestations}</Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon/>}
                      onClick={addPrestation}
                    >
                      {t.contracts.addPrestation}
                    </Button>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  {formik.errors.prestations && typeof formik.errors.prestations === 'string' && formik.touched.prestations && (
                    <Typography variant="body2" color="error" sx={{mb: 1}}>
                      {formik.errors.prestations}
                    </Typography>
                  )}
                  <Box sx={{width: '100%'}}>
                    <DataGrid
                      rows={prestationRows}
                      columns={prestationColumns}
                      localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                      rowHeight={52}
                      disableColumnMenu
                      disableRowSelectionOnClick
                      hideFooter={(formik.values.prestations ?? []).length <= 5}
                      pageSizeOptions={[5, 10, 25]}
                      initialState={{pagination: {paginationModel: {pageSize: 5}}}}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        '& .MuiDataGrid-cell': {display: 'flex', alignItems: 'center'},
                        '& .MuiDataGrid-columnHeaders': {fontFamily: 'Poppins', fontWeight: 700},
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* ── Blueline: Fournitures & Eau/Elec ── */}
            {isBlueline && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <PlumbingIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.suppliesAndWater}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <CustomDropDownSelect
                      id="fournitures"
                      label={`${t.contracts.suppliesLabel}${isBluelineRequired('fournitures') ? ' *' : ''}`}
                      items={fournituresItemsList.map((i) => i.value)}
                      value={fournituresItemsList.find((i) => i.code === formik.values.fournitures)?.value ?? formik.values.fournitures}
                      onChange={(e: SelectChangeEvent) => {
                        const selected = fournituresItemsList.find((i) => i.value === e.target.value);
                        formik.setFieldValue('fournitures', selected?.code ?? e.target.value);
                      }}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<InventoryIcon fontSize="small"/>}
                      error={formik.touched.fournitures && Boolean(formik.errors.fournitures)}
                      helperText={formik.touched.fournitures ? (formik.errors.fournitures as string) : ''}
                    />
                    <CustomTextInput
                      id="materiaux_detail"
                      type="text"
                      label={t.contracts.materialsDetail}
                      value={formik.values.materiaux_detail}
                      onChange={formik.handleChange('materiaux_detail')}
                      onBlur={formik.handleBlur('materiaux_detail')}
                      multiline
                      rows={2}
                      fullWidth={false}
                      size="small"
                      theme={inputTheme}
                      startIcon={<NotesIcon fontSize="small"/>}
                    />
                    <CustomDropDownSelect
                      id="eau_electricite"
                      label={`${t.contracts.waterElectricityLabel}${isBluelineRequired('eau_electricite') ? ' *' : ''}`}
                      items={eauElectriciteItemsList.map((i) => i.value)}
                      value={eauElectriciteItemsList.find((i) => i.code === formik.values.eau_electricite)?.value ?? formik.values.eau_electricite}
                      onChange={(e: SelectChangeEvent) => {
                        const selected = eauElectriciteItemsList.find((i) => i.value === e.target.value);
                        formik.setFieldValue('eau_electricite', selected?.code ?? e.target.value);
                      }}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<WaterDropIcon fontSize="small"/>}
                      error={formik.touched.eau_electricite && Boolean(formik.errors.eau_electricite)}
                      helperText={formik.touched.eau_electricite ? (formik.errors.eau_electricite as string) : ''}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── Blueline: Garantie BL ── */}
            {isBlueline && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <ShieldIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.warrantySection}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="garantie_nb"
                          type="text"
                          label={t.contracts.duration}
                          value={formik.values.garantie_nb}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (/^\d*$/.test(e.target.value)) formik.setFieldValue('garantie_nb', e.target.value);
                          }}
                          onBlur={formik.handleBlur('garantie_nb')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<TimerIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomDropDownSelect
                          id="garantie_unite"
                          label={t.contracts.unit}
                          items={garantieUniteItemsList.map((i) => i.value)}
                          value={garantieUniteItemsList.find((i) => i.code === formik.values.garantie_unite)?.value ?? formik.values.garantie_unite}
                          onChange={(e: SelectChangeEvent) => {
                            const selected = garantieUniteItemsList.find((i) => i.value === e.target.value);
                            formik.setFieldValue('garantie_unite', selected?.code ?? e.target.value);
                          }}
                          size="small"
                          theme={customDropdownTheme()}
                          startIcon={<StraightenIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <CustomDropDownSelect
                      id="garantie_type"
                      label={t.contracts.warrantyType}
                      items={garantieTypeItemsList.map((i) => i.value)}
                      value={garantieTypeItemsList.find((i) => i.code === formik.values.garantie_type)?.value ?? formik.values.garantie_type}
                      onChange={(e: SelectChangeEvent) => {
                        const selected = garantieTypeItemsList.find((i) => i.value === e.target.value);
                        formik.setFieldValue('garantie_type', selected?.code ?? e.target.value);
                      }}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<CategoryIcon fontSize="small"/>}
                    />
                    <CustomTextInput
                      id="exclusions_garantie"
                      type="text"
                      label={t.contracts.warrantyExclusions}
                      value={formik.values.exclusions_garantie}
                      onChange={formik.handleChange('exclusions_garantie')}
                      onBlur={formik.handleBlur('exclusions_garantie')}
                      multiline
                      rows={2}
                      fullWidth={false}
                      size="small"
                      theme={inputTheme}
                      startIcon={<NotesIcon fontSize="small"/>}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── Blueline: Paiement & Résiliation ── */}
            {isBlueline && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <PercentIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.scheduleTermination}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="acompte"
                          type="number"
                          label={`${t.contracts.depositLabel}${isBluelineRequired('acompte') ? ' *' : ''}`}
                          value={formik.values.acompte}
                          onChange={formik.handleChange('acompte')}
                          onBlur={formik.handleBlur('acompte')}
                          error={formik.touched.acompte && Boolean(formik.errors.acompte)}
                          helperText={
                            formik.touched.acompte && formik.errors.acompte
                              ? (formik.errors.acompte as string)
                              : t.contracts.between0and100
                          }
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PercentIcon fontSize="small"/>}
                          endIcon="%"
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="tranche2"
                          type="number"
                          label={`${t.common.tranche2Label}${isBluelineRequired('tranche2') ? ' *' : ''}`}
                          value={formik.values.tranche2}
                          onChange={formik.handleChange('tranche2')}
                          onBlur={formik.handleBlur('tranche2')}
                          error={formik.touched.tranche2 && Boolean(formik.errors.tranche2)}
                          helperText={
                            formik.touched.tranche2 && formik.errors.tranche2
                              ? (formik.errors.tranche2 as string)
                              : t.contracts.between0and100
                          }
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<PercentIcon fontSize="small"/>}
                          endIcon="%"
                        />
                      </Box>
                    </Stack>
                    {(formik.values.acompte || formik.values.tranche2) && (
                      <Typography variant="body2" color="text.secondary" fontFamily="Poppins">
                        {t.contracts.balance}
                        : {100 - (parseFloat(formik.values.acompte) || 0) - (parseFloat(formik.values.tranche2) || 0)}%
                      </Typography>
                    )}
                    <CustomDropDownSelect
                      id="clause_resiliation"
                      label={`${t.contracts.terminationClauseLabel}${isBluelineRequired('clause_resiliation') ? ' *' : ''}`}
                      items={clauseResiliationItemsList.map((i) => i.value)}
                      value={clauseResiliationItemsList.find((i) => i.code === formik.values.clause_resiliation)?.value ?? formik.values.clause_resiliation}
                      onChange={(e: SelectChangeEvent) => {
                        const selected = clauseResiliationItemsList.find((i) => i.value === e.target.value);
                        formik.setFieldValue('clause_resiliation', selected?.code ?? e.target.value);
                      }}
                      size="small"
                      theme={customDropdownTheme()}
                      startIcon={<GavelIcon fontSize="small"/>}
                      error={formik.touched.clause_resiliation && Boolean(formik.errors.clause_resiliation)}
                      helperText={formik.touched.clause_resiliation ? (formik.errors.clause_resiliation as string) : ''}
                    />
                    <CustomTextInput
                      id="notes"
                      type="text"
                      label={t.contracts.notes}
                      value={formik.values.notes}
                      onChange={formik.handleChange('notes')}
                      onBlur={formik.handleBlur('notes')}
                      multiline
                      rows={3}
                      fullWidth={false}
                      size="small"
                      theme={inputTheme}
                      startIcon={<NotesIcon fontSize="small"/>}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── Blueline: Client extra fields ── */}
            {isBlueline && (
              <Card elevation={2} sx={{borderRadius: 2}}>
                <CardContent sx={{p: 3}}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <PersonIcon color="primary"/>
                    <Typography variant="h6" fontWeight={700}>{t.contracts.clientBlueline}</Typography>
                  </Stack>
                  <Divider sx={{mb: 3}}/>
                  <Stack spacing={2.5}>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="client_ville"
                          type="text"
                          label={t.contracts.city}
                          value={formik.values.client_ville}
                          onChange={formik.handleChange('client_ville')}
                          onBlur={formik.handleBlur('client_ville')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<LocationOnIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="client_cp"
                          type="text"
                          label={t.contracts.postalCode}
                          value={formik.values.client_cp}
                          onChange={formik.handleChange('client_cp')}
                          onBlur={formik.handleBlur('client_cp')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<HomeIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="chantier_ville"
                          type="text"
                          label={t.contracts.siteCity}
                          value={formik.values.chantier_ville}
                          onChange={formik.handleChange('chantier_ville')}
                          onBlur={formik.handleBlur('chantier_ville')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<LocationOnIcon fontSize="small"/>}
                        />
                      </Box>
                      <Box sx={{flex: 1, minWidth: 0}}>
                        <CustomTextInput
                          id="chantier_etage"
                          type="text"
                          label={t.contracts.floor}
                          value={formik.values.chantier_etage}
                          onChange={formik.handleChange('chantier_etage')}
                          onBlur={formik.handleBlur('chantier_etage')}
                          fullWidth
                          size="small"
                          theme={inputTheme}
                          startIcon={<HomeIcon fontSize="small"/>}
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── Submit ── */}
            <Box sx={{display: 'flex', justifyContent: 'flex-end', pt: 2}}>
              <PrimaryLoadingButton
                buttonText={isEditMode ? t.contracts.update : t.contracts.createContract}
                active={!isPending}
                type="submit"
                loading={isPending}
                startIcon={isEditMode ? <EditIcon/> : <AddIcon/>}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  setHasAttemptedSubmit(true);
                  if (!formik.isValid) {
                    e.preventDefault();
                    formik.handleSubmit();
                    onError(t.contracts.fixValidationErrors);
                    window.scrollTo({top: 0, behavior: 'smooth'});
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

const ContractFormClient: React.FC<Props> = ({session, id}: Props) => {
  const token = useInitAccessToken(session);
  const {t} = useLanguage();
  const isEditMode = id !== undefined;

  return (
    <Stack direction="column" sx={{position: 'relative'}}>
      <NavigationBar title={isEditMode ? t.contracts.editContractTitle : t.contracts.addContract}>
        <main className={`${Styles.main} ${Styles.fixMobile}`}>
          <Protected>
            <Box sx={{width: '100%'}}>
              <FormikContent token={token} id={id}/>
            </Box>
          </Protected>
        </main>
      </NavigationBar>
    </Stack>
  );
};

export default ContractFormClient;
