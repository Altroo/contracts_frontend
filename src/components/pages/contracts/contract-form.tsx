'use client';

import React, { useState, useMemo } from 'react';
import type { ApiErrorResponseType, ResponseDataInterface, SessionProps } from '@/types/_initTypes';
import {
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
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { setFormikAutoErrors, getLabelForKey } from '@/utils/helpers';
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

/* ─── static dropdown lists ─── */
const statutItems = ['Brouillon', 'Envoyé', 'Signé', 'En cours', 'Terminé', 'Annulé', 'Expiré'];
const typeContratItems = [
	{ code: 'travaux_finition', value: 'Travaux de finition' },
	{ code: 'travaux_gros_oeuvre', value: 'Travaux gros œuvre' },
	{ code: 'design_interieur', value: 'Design intérieur' },
	{ code: 'cle_en_main', value: 'Clé en main' },
	{ code: 'ameublement', value: 'Ameublement' },
	{ code: 'maintenance', value: 'Maintenance' },
	{ code: 'suivi_chantier', value: 'Suivi de chantier' },
];
const deviseItems = ['MAD', 'EUR', 'USD'];
const confidentialiteItems = ['CONFIDENTIEL', 'USAGE INTERNE', 'STANDARD'];

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
	const shouldShowApiError = (axiosError?.status ?? 0) > 400 && !isLoading;

	/* ── helper: resolve display value for code-based dropdowns ── */
	const typeContratDisplay = typeContratItems.find((t) => t.code === formik.values.type_contrat)?.value ?? formik.values.type_contrat;

	if (isEditMode && isDataLoading) {
		return <ApiProgress backdropColor="#fff" circularColor="#0274D7" />;
	}

	return (
		<Stack className={Styles.main as string} spacing={3}>
			<ApiProgress backdropColor="#fff" circularColor="#0274D7" backdropOpen={isLoading && !isDataLoading} />

			<Stack
				direction={isMobile ? 'column' : 'row'}
				pt={2}
				justifyContent="space-between"
				alignItems={isMobile ? 'stretch' : 'center'}
				spacing={2}
			>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIcon />}
					onClick={() => router.push(isEditMode ? CONTRACTS_VIEW(id!) : CONTRACTS_LIST)}
					sx={{ whiteSpace: 'nowrap' }}
				>
					{isEditMode ? 'Retour au contrat' : 'Liste des contrats'}
				</Button>
				<Typography variant="h5" fontWeight={700}>
					{isEditMode ? 'Modifier le contrat' : 'Nouveau contrat'}
				</Typography>
			</Stack>

			{hasValidationErrors && (
				<ApiAlert
					errorDetails={{
						[`Erreurs de validation`]: Object.entries(validationErrors).map(
							([key, err]) => `${getLabelForKey(fieldLabels, key)} : ${err}`,
						),
					}}
				/>
			)}

			{formik.errors.globalError && <ApiAlert errorDetails={{ error: [formik.errors.globalError] }} />}

			{shouldShowApiError && (
				<ApiAlert
					errorDetails={
						axiosError?.data?.details
							? axiosError.data.details
							: { error: ['Une erreur est survenue.'] }
					}
				/>
			)}

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
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomTextInput
										id="numero_contrat"
										type="text"
										label="Numéro de contrat *"
										value={formik.values.numero_contrat}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										error={formik.touched.numero_contrat && Boolean(formik.errors.numero_contrat)}
										helperText={formik.touched.numero_contrat ? formik.errors.numero_contrat : ''}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="date_contrat"
										type="date"
										label="Date du contrat"
										value={formik.values.date_contrat}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
										shrink
									/>
								</Stack>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomDropDownSelect
										id="statut"
										label="Statut"
										items={statutItems}
										value={formik.values.statut}
										onChange={(e: SelectChangeEvent) => formik.setFieldValue('statut', e.target.value)}
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
										theme={customDropdownTheme()}
									/>
									<CustomTextInput
										id="ville_signature"
										type="text"
										label="Ville de signature"
										value={formik.values.ville_signature}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
								</Stack>
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
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomTextInput
										id="client_nom"
										type="text"
										label="Nom du client *"
										value={formik.values.client_nom}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										error={formik.touched.client_nom && Boolean(formik.errors.client_nom)}
										helperText={formik.touched.client_nom ? formik.errors.client_nom : ''}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="client_cin"
										type="text"
										label="CIN / N° entreprise"
										value={formik.values.client_cin}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="client_qualite"
										type="text"
										label="Qualité"
										value={formik.values.client_qualite}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
								</Stack>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomTextInput
										id="client_tel"
										type="text"
										label="Téléphone"
										value={formik.values.client_tel}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="client_email"
										type="email"
										label="Email"
										value={formik.values.client_email}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="client_adresse"
										type="text"
										label="Adresse"
										value={formik.values.client_adresse}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
								</Stack>
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
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomTextInput
										id="type_bien"
										type="text"
										label="Type de bien"
										value={formik.values.type_bien}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="surface"
										type="number"
										label="Surface (m²)"
										value={formik.values.surface}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="adresse_travaux"
										type="text"
										label="Adresse des travaux"
										value={formik.values.adresse_travaux}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
								</Stack>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomTextInput
										id="date_debut"
										type="date"
										label="Date de début"
										value={formik.values.date_debut}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
										shrink
									/>
									<CustomTextInput
										id="duree_estimee"
										type="text"
										label="Durée estimée"
										value={formik.values.duree_estimee}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="responsable_projet"
										type="text"
										label="Responsable projet"
										value={formik.values.responsable_projet}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										fullWidth
										theme={textInputTheme()}
									/>
								</Stack>
								<CustomTextInput
									id="description_travaux"
									type="text"
									label="Description des travaux"
									value={formik.values.description_travaux}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									multiline
									rows={3}
									fullWidth
									theme={textInputTheme()}
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
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<CustomTextInput
									id="montant_ht"
									type="number"
									label="Montant HT *"
									value={formik.values.montant_ht}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									error={formik.touched.montant_ht && Boolean(formik.errors.montant_ht)}
									helperText={formik.touched.montant_ht ? formik.errors.montant_ht : ''}
									fullWidth
									theme={textInputTheme()}
								/>
								<CustomDropDownSelect
									id="devise"
									label="Devise"
									items={deviseItems}
									value={formik.values.devise}
									onChange={(e: SelectChangeEvent) => formik.setFieldValue('devise', e.target.value)}
									theme={customDropdownTheme()}
								/>
								<CustomTextInput
									id="tva"
									type="text"
									label="TVA (%)"
									value={formik.values.tva}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									fullWidth
									theme={textInputTheme()}
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
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<CustomTextInput
									id="garantie"
									type="text"
									label="Garantie"
									value={formik.values.garantie}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									fullWidth
									theme={textInputTheme()}
								/>
								<CustomTextInput
									id="tribunal"
									type="text"
									label="Tribunal compétent"
									value={formik.values.tribunal}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									fullWidth
									theme={textInputTheme()}
								/>
								<CustomDropDownSelect
									id="confidentialite"
									label="Confidentialité"
									items={confidentialiteItems}
									value={formik.values.confidentialite}
									onChange={(e: SelectChangeEvent) => formik.setFieldValue('confidentialite', e.target.value)}
									theme={customDropdownTheme()}
								/>
							</Stack>
						</CardContent>
					</Card>

					{/* ── Submit ── */}
					<Stack direction="row" justifyContent="flex-end" pt={2}>
						<PrimaryLoadingButton
							buttonText={
								isEditMode ? 'Mettre à jour' : 'Créer le contrat'
							}
							type="submit"
							loading={isLoading}
							active={!isLoading}
							onClick={() => {
								setHasAttemptedSubmit(true);
								if (!formik.isValid) {
									onError('Veuillez corriger les erreurs de validation.');
									window.scrollTo({ top: 0, behavior: 'smooth' });
								}
							}}
						/>
					</Stack>
				</Stack>
			</form>
		</Stack>
	);
};

export default ContractFormClient;
