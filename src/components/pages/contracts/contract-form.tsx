'use client';

import React, { useState, useMemo } from 'react';
import type { ApiErrorResponseType, ResponseDataInterface, SessionProps } from '@/types/_initTypes';
import {
	Alert,
	Box,
	Card,
	CardContent,
	Divider,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
	Button,
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
	CalendarMonth as CalendarMonthIcon,
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
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { setFormikAutoErrors, getLabelForKey } from '@/utils/helpers';
import {
	contractStatutItemsList as statutItems,
	typeContratItemsList as typeContratItems,
	deviseItemsList as deviseItems,
	confidentialiteItemsList as confidentialiteItems,
} from '@/utils/rawData';
import { CONTRACTS_LIST, CONTRACTS_VIEW } from '@/utils/routes';
import { useRouter } from 'next/navigation';
import { useToast } from '@/utils/hooks';
import { useAddContractMutation, useEditContractMutation, useGetContractQuery } from '@/store/services/contract';
import { contractSchema } from '@/utils/formValidationSchemas';
import { textInputTheme, customDropdownTheme } from '@/utils/themes';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import CustomDropDownSelect from '@/components/formikElements/customDropDownSelect/customDropDownSelect';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import type { ContractFormValuesType } from '@/types/contractTypes';
import type { SelectChangeEvent } from '@mui/material/Select';
import { getAccessTokenFromSession } from '@/store/session';
import Styles from '@/styles/dashboard/dashboard.module.sass';

const inputTheme = textInputTheme();

interface Props extends SessionProps {
	id?: number;
}

const ContractFormClient = ({ id, session }: Props) => {
	const router = useRouter();
	const { onSuccess, onError } = useToast();
	const isEditMode = id !== undefined;
	const token = getAccessTokenFromSession(session);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const {
		data: rawData,
		isLoading: isDataLoading,
		error: dataError,
	} = useGetContractQuery({ id: id! }, { skip: !isEditMode || !token });

	const [addContract, { isLoading: isAddLoading, error: addError }] = useAddContractMutation();
	const [editContract, { isLoading: isEditLoading, error: editError }] = useEditContractMutation();

	const error = isEditMode ? dataError || editError : addError;
	const axiosError: ResponseDataInterface<ApiErrorResponseType> | undefined = useMemo(
		() => (error ? (error as ResponseDataInterface<ApiErrorResponseType>) : undefined),
		[error],
	);

	const [isPending, setIsPending] = useState(false);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

	const formik = useFormik<ContractFormValuesType>({
		initialValues: {
			numero_contrat: rawData?.numero_contrat ?? '',
			date_contrat: rawData?.date_contrat ?? '',
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
			date_debut: rawData?.date_debut ?? '',
			duree_estimee: rawData?.duree_estimee ?? '',
			description_travaux: rawData?.description_travaux ?? '',
			montant_ht: rawData?.montant_ht != null ? String(rawData.montant_ht) : '',
			devise: rawData?.devise ?? 'MAD',
			tva: rawData?.tva != null ? String(rawData.tva) : '20',
			garantie: rawData?.garantie ?? '1 an',
			tribunal: rawData?.tribunal ?? 'Tanger',
			responsable_projet: rawData?.responsable_projet ?? '',
			confidentialite: rawData?.confidentialite ?? 'CONFIDENTIEL',
			globalError: '',
		},
		enableReinitialize: true,
		validateOnMount: true,
		validationSchema: toFormikValidationSchema(contractSchema),
		onSubmit: async (data, { setFieldError }) => {
			setHasAttemptedSubmit(true);
			setIsPending(true);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { globalError, ...fields } = data;
			const payload = {
				...fields,
				montant_ht: fields.montant_ht ? parseFloat(fields.montant_ht) : undefined,
				surface: fields.surface ? parseFloat(fields.surface) : undefined,
				tva: fields.tva ? parseFloat(fields.tva) : undefined,
			};
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
			garantie: 'Garantie',
			tribunal: 'Tribunal compétent',
			responsable_projet: 'Responsable projet',
			confidentialite: 'Confidentialité',
			globalError: 'Erreur globale',
		}),
		[],
	);

	const validationErrors = useMemo(() => {
		const errors: Record<string, string> = {};
		if (hasAttemptedSubmit) {
			Object.entries(formik.errors).forEach(([key, value]) => {
				if (key !== 'globalError' && typeof value === 'string') {
					errors[key] = value;
				}
			});
		}
		return errors;
	}, [formik.errors, hasAttemptedSubmit]);

	const hasValidationErrors = Object.keys(validationErrors).length > 0;
	const isLoading = isAddLoading || isEditLoading || isPending || (isEditMode && isDataLoading);
	const shouldShowError = (axiosError?.status ?? 0) > 400 && !isLoading;

	/* ── helper: resolve display value for code-based dropdowns ── */
	const typeContratDisplay = typeContratItems.find((t) => t.code === formik.values.type_contrat)?.value ?? formik.values.type_contrat;

	return (
		<main className={`${Styles.main} ${Styles.fixMobile}`}>
		<Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
			<Stack direction={isMobile ? 'column' : 'row'} pt={2} justifyContent="space-between" spacing={2}>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIcon />}
					onClick={() => router.push(isEditMode ? CONTRACTS_VIEW(id!) : CONTRACTS_LIST)}
					sx={{
						whiteSpace: 'nowrap',
						px: { xs: 1.5, sm: 2, md: 3 },
						py: { xs: 0.8, sm: 1, md: 1 },
						fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
					}}
				>
					{isEditMode ? 'Retour au contrat' : 'Liste des contrats'}
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
									<CustomTextInput
										id="date_contrat"
										type="date"
										label="Date du contrat"
										value={formik.values.date_contrat}
										onChange={formik.handleChange('date_contrat')}
										onBlur={formik.handleBlur('date_contrat')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										shrink
										startIcon={<CalendarMonthIcon fontSize="small" />}
									/>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
										<CustomDropDownSelect
											id="statut"
											label="Statut"
											items={statutItems}
											value={formik.values.statut}
											onChange={(e: SelectChangeEvent) => formik.setFieldValue('statut', e.target.value)}
											size="small"
											theme={customDropdownTheme()}
										/>
										<CustomDropDownSelect
											id="type_contrat"
											label="Type de contrat"
											items={typeContratItems.map((t) => t.value)}
											value={typeContratDisplay}
											onChange={(e: SelectChangeEvent) => {
												const selected = typeContratItems.find((t) => t.value === e.target.value);
												formik.setFieldValue('type_contrat', selected?.code ?? e.target.value);
											}}
											size="small"
											theme={customDropdownTheme()}
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
									<CustomTextInput
										id="client_qualite"
										type="text"
										label="Qualité"
										value={formik.values.client_qualite}
										onChange={formik.handleChange('client_qualite')}
										onBlur={formik.handleBlur('client_qualite')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
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
									<CustomTextInput
										id="type_bien"
										type="text"
										label="Type de bien"
										value={formik.values.type_bien}
										onChange={formik.handleChange('type_bien')}
										onBlur={formik.handleBlur('type_bien')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<HomeIcon fontSize="small" />}
									/>
									<CustomTextInput
										id="surface"
										type="number"
										label="Surface (m²)"
										value={formik.values.surface}
										onChange={formik.handleChange('surface')}
										onBlur={formik.handleBlur('surface')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<StraightenIcon fontSize="small" />}
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
									<CustomTextInput
										id="date_debut"
										type="date"
										label="Date de début"
										value={formik.values.date_debut}
										onChange={formik.handleChange('date_debut')}
										onBlur={formik.handleBlur('date_debut')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										shrink
										startIcon={<CalendarMonthIcon fontSize="small" />}
									/>
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
										type="number"
										label="Montant HT *"
										value={formik.values.montant_ht}
										onChange={formik.handleChange('montant_ht')}
										onBlur={formik.handleBlur('montant_ht')}
										error={formik.touched.montant_ht && Boolean(formik.errors.montant_ht)}
										helperText={formik.touched.montant_ht ? formik.errors.montant_ht : ''}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<AttachMoneyIcon fontSize="small" />}
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
										/>
									</Stack>
									<CustomTextInput
										id="tva"
										type="text"
										label="TVA (%)"
										value={formik.values.tva}
										onChange={formik.handleChange('tva')}
										onBlur={formik.handleBlur('tva')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<AttachMoneyIcon fontSize="small" />}
									/>
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
									<CustomTextInput
										id="garantie"
										type="text"
										label="Garantie"
										value={formik.values.garantie}
										onChange={formik.handleChange('garantie')}
										onBlur={formik.handleBlur('garantie')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
										startIcon={<GavelIcon fontSize="small" />}
									/>
									<CustomTextInput
										id="tribunal"
										type="text"
										label="Tribunal compétent"
										value={formik.values.tribunal}
										onChange={formik.handleChange('tribunal')}
										onBlur={formik.handleBlur('tribunal')}
										fullWidth={false}
										size="small"
										theme={inputTheme}
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
									/>
								</Stack>
							</CardContent>
						</Card>

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
		</main>
	);
};

export default ContractFormClient;
