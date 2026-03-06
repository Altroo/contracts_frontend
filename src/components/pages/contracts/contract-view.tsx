'use client';

import React, { useMemo, isValidElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiErrorResponseType, ResponseDataInterface, SessionProps } from '@/types/_initTypes';
import { getAccessTokenFromSession } from '@/store/session';
import { useGetContractQuery, useDeleteContractMutation, usePatchContractStatutMutation } from '@/store/services/contract';
import Styles from '@/styles/dashboard/dashboard.module.sass';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';
import {
	Stack,
	Typography,
	useTheme,
	useMediaQuery,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	Box,
	Alert,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Description as DescriptionIcon,
	CalendarToday as CalendarTodayIcon,
	Category as CategoryIcon,
	LocationCity as CityIcon,
	Person as PersonIcon,
	Badge as BadgeIcon,
	Work as WorkIcon,
	Phone as PhoneIcon,
	Email as EmailIcon,
	Home as HomeIcon,
	Apartment as ApartmentIcon,
	SquareFoot as SquareFootIcon,
	Construction as ConstructionIcon,
	AttachMoney as MoneyIcon,
	Percent as PercentIcon,
	Shield as ShieldIcon,
	Assignment as AssignmentIcon,
	Build as BuildIcon,
	Gavel as GavelIcon,
	PictureAsPdf as PictureAsPdfIcon,
	Business as BusinessIcon,
	Plumbing as PlumbingIcon,
	Water as WaterIcon,
	Timer as TimerIcon,
	Notes as NotesIcon,
	ListAlt as ListAltIcon,
	Checklist as ChecklistIcon,
	Architecture as ArchitectureIcon,
	Attachment as AttachmentIcon,
	PlaylistAddCheck as PlaylistAddCheckIcon,
} from '@mui/icons-material';
import { CONTRACTS_LIST, CONTRACTS_EDIT, CONTRACT_PDF, CONTRACT_DOC } from '@/utils/routes';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import { formatDate, formatDateShort, extractApiErrorMessage } from '@/utils/helpers';
import { useToast } from '@/utils/hooks';
import { fetchFileBlob } from '@/utils/apiHelpers';
import PdfLanguageModal from '@/components/shared/pdfLanguageModal/pdfLanguageModal';
import ActionModals from '@/components/htmlElements/modals/actionModal/actionModals';
import { Protected } from '@/components/layouts/protected/protected';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import { getContractStatusColor, contractStatutItemsList, companyItemsList, fournituresItemsList, eauElectriciteItemsList, garantieUniteItemsList, garantieTypeItemsList, clauseResiliationItemsList, prestationNomItemsList, prestationUniteItemsList, clientQualiteItemsList, typeBienItemsList, garantieItemsList, modePaiementTexteItemsList, contractCategoryItemsList, stLotTypeItemsList, stFormeJuridiqueItemsList, stTypePrixItemsList, stDelaiUnitItemsList, stClausesActivesList } from '@/utils/rawData';
import type { ContractStatutType } from '@/types/contractTypes';

interface InfoRowProps {
	icon: React.ReactNode;
	label: string;
	value: string | number | null | undefined | React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const displayValue = React.isValidElement(value)
		? value
		: value === null || value === undefined || String(value).trim() === ''
			? '-'
			: value;

	return (
		<Stack
			direction="row"
			alignItems="flex-start"
			spacing={2}
			sx={{
				py: 1.5,
				flexWrap: 'wrap',
			}}
		>
			<Box
				sx={{
					color: 'primary.main',
					display: 'flex',
					alignItems: 'center',
					minWidth: 40,
				}}
			>
				{icon}
			</Box>

			<Stack
				direction="row"
				alignItems="center"
				spacing={isMobile ? 0 : 2}
				sx={{
					flex: 1,
					flexWrap: 'wrap',
				}}
			>
				<Typography
					fontWeight={600}
					color="text.secondary"
					sx={{
						minWidth: { xs: '100%', sm: 200 },
						wordBreak: 'break-word',
					}}
				>
					{label}
				</Typography>

				<Box sx={{ flex: 1 }}>
					{isValidElement(displayValue) ? (
						displayValue
					) : (
						<Typography sx={{ color: 'text.primary' }}>{displayValue}</Typography>
					)}
				</Box>
			</Stack>
		</Stack>
	);
};

interface Props extends SessionProps {
	id: number;
}

const ContractViewClient: React.FC<Props> = ({ session, id }) => {
	const router = useRouter();
	const token = getAccessTokenFromSession(session);
	const { data: contract, isLoading, error } = useGetContractQuery({ id }, { skip: !token });
	const axiosError = useMemo(
		() => (error ? (error as ResponseDataInterface<ApiErrorResponseType>) : undefined),
		[error],
	);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const [deleteRecord] = useDeleteContractMutation();
	const [patchStatut] = usePatchContractStatutMutation();
	const { onSuccess, onError } = useToast();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showLanguageModal, setShowLanguageModal] = useState(false);
	const [pendingDocFormat, setPendingDocFormat] = useState<'pdf' | 'docx' | null>(null);
	const [isDocLoading, setIsDocLoading] = useState(false);

	const openDocument = (format: 'pdf' | 'docx') => {
		setPendingDocFormat(format);
		setShowLanguageModal(true);
	};

	const handleLanguageSelect = async (language: 'fr' | 'en') => {
		setShowLanguageModal(false);
		if (!token || !pendingDocFormat) return;
		setIsDocLoading(true);
		try {
			let url: string;
			if (pendingDocFormat === 'pdf') url = CONTRACT_PDF(id, language);
			else url = CONTRACT_DOC(id, language);
			const blob = await fetchFileBlob(url, token);
			const blobUrl = window.URL.createObjectURL(blob);
			window.open(blobUrl, '_blank');
			setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
		} catch {
			onError("Erreur lors de l'ouverture du document.");
		} finally {
			setPendingDocFormat(null);
			setIsDocLoading(false);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteRecord({ id }).unwrap();
			onSuccess('Contrat supprimé avec succès');
			router.push(CONTRACTS_LIST);
		} catch (err) {
			onError(extractApiErrorMessage(err, 'Erreur lors de la suppression du contrat'));
		} finally {
			setShowDeleteModal(false);
		}
	};

	const handleStatusChange = async (newStatut: ContractStatutType) => {
		try {
			await patchStatut({ id, data: { statut: newStatut } }).unwrap();
			onSuccess(`Statut mis à jour : ${newStatut}`);
		} catch (err) {
			onError(extractApiErrorMessage(err, 'Erreur lors du changement de statut'));
		}
	};

	const deleteModalActions = [
		{
			text: 'Annuler',
			active: false,
			onClick: () => setShowDeleteModal(false),
			icon: <ArrowBackIcon />,
			color: '#6B6B6B',
		},
		{
			text: 'Supprimer',
			active: true,
			onClick: handleDelete,
			icon: <DeleteIcon />,
			color: '#D32F2F',
		},
	];

	const statusColor = contract ? getContractStatusColor(contract.statut) : 'default';
	const isBlueline = contract?.company === 'blueline_works';
	const isST = contract?.company === 'casa_di_lusso' && contract?.contract_category === 'sous_traitance';
	const isCDL = !isBlueline && !isST;

	const resolveLabel = (list: Array<{ code: string; value: string }>, code: string | null | undefined) =>
		list.find((i) => i.code === code)?.value ?? code ?? '-';

	return (
		<Stack direction="column" spacing={2} className={Styles.flexRootStack} mt="32px">
			<NavigationBar title="Détails du contrat">
				<Protected>
					<Stack spacing={3} sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
						<Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} spacing={2}>
							<Button
								variant="outlined"
								startIcon={<ArrowBackIcon />}
								onClick={() => router.push(CONTRACTS_LIST)}
								sx={{ width: isMobile ? '100%' : 'auto' }}
							>
								Liste des contrats
							</Button>
							{!isLoading && !error && (
								<Stack direction="row" gap={1} flexWrap="wrap">
									<Button
										variant="outlined"
										color="error"
										size="small"
										startIcon={<PictureAsPdfIcon />}
										onClick={() => openDocument('pdf')}
										disabled={isDocLoading}
									>
										PDF
									</Button>
									<Button
										variant="outlined"
										color="info"
										size="small"
										startIcon={<DescriptionIcon />}
										onClick={() => openDocument('docx')}
										disabled={isDocLoading}
									>
										DOCX
									</Button>
									<Button
										variant="outlined"
										size="small"
										startIcon={<EditIcon />}
										onClick={() => router.push(CONTRACTS_EDIT(id))}
									>
										Modifier
									</Button>
									<Button
										variant="outlined"
										color="error"
										size="small"
										startIcon={<DeleteIcon />}
										onClick={() => setShowDeleteModal(true)}
									>
										Supprimer
									</Button>
								</Stack>
							)}
						</Stack>
						{isDocLoading && <ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B" />}
						{isLoading ? (
							<ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B" />
						) : (axiosError?.status as number) > 400 ? (
							<ApiAlert
								errorDetails={axiosError?.data.details}
								cssStyle={{
									position: 'absolute',
									top: '50%',
									left: '50%',
									transform: 'translate(-50%, -50%)',
								}}
							/>
						) : !contract ? (
							<Alert severity="warning">Contrat introuvable</Alert>
						) : (
							<Stack spacing={3}>
								{/* Header Card */}
								<Card elevation={2} sx={{ borderRadius: 2 }}>
									<CardContent sx={{ p: 3 }}>
										<Stack
											direction={isMobile ? 'column' : 'row'}
											spacing={3}
											alignItems={isMobile ? 'center' : 'flex-start'}
										>
											<Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
												<Stack spacing={1} alignItems={isMobile ? 'center' : 'flex-start'}>
													<Typography
														variant="h4"
														textAlign={isMobile ? 'center' : 'inherit'}
														fontSize={isMobile ? '20px' : '25px'}
														fontWeight={700}
													>
														{contract?.numero_contrat ?? 'Contrat'}
													</Typography>
													<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
														<Chip icon={<BadgeIcon />} label={`ID: ${contract?.id}`} size="small" variant="outlined" />
														<Chip
															label={contract?.statut}
															color={statusColor}
															variant="outlined"
														/>
													</Stack>
												</Stack>
											</Stack>
										</Stack>
									</CardContent>
								</Card>

								{/* Status Change */}
								<Card elevation={2} sx={{ borderRadius: 2 }}>
									<CardContent sx={{ p: 3 }}>
										<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
											<AssignmentIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>
												Changer le statut
											</Typography>
										</Stack>
										<Divider sx={{ mb: 2 }} />
										<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
											{contractStatutItemsList.map((statut) => (
												<Chip
													key={statut}
													label={statut}
													color={contract?.statut === statut ? getContractStatusColor(statut) : 'default'}
													variant={contract?.statut === statut ? 'filled' : 'outlined'}
													onClick={() => {
														if (contract?.statut !== statut) {
															handleStatusChange(statut as ContractStatutType).then();
														}
													}}
													sx={{ cursor: contract?.statut === statut ? 'default' : 'pointer' }}
												/>
											))}
										</Stack>
									</CardContent>
								</Card>

								{/* Informations générales */}
								<Card elevation={2} sx={{ borderRadius: 2 }}>
									<CardContent
										sx={{
											px: { xs: 2, md: 3 },
											py: { xs: 2, md: 3 },
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
											<DescriptionIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>
												Informations générales
											</Typography>
										</Stack>

										<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />

										<Stack spacing={0}>
											<InfoRow icon={<DescriptionIcon />} label="N° contrat" value={contract?.numero_contrat} />
											<Divider />										<InfoRow
											icon={<BusinessIcon />}
											label="Société"
											value={
												<Chip
													label={contract?.company_display ?? resolveLabel(companyItemsList, contract?.company)}
													color={isBlueline ? 'info' : 'warning'}
													variant="outlined"
													size="small"
												/>
											}
										/>
										<Divider />
										{contract?.contract_category && (
											<>
												<InfoRow
													icon={<CategoryIcon />}
													label="Catégorie"
													value={
														<Chip
															label={contract?.contract_category_display ?? resolveLabel(contractCategoryItemsList, contract?.contract_category)}
															color={isST ? 'secondary' : 'default'}
															variant="outlined"
															size="small"
														/>
													}
												/>
												<Divider />
											</>
										)}
										<InfoRow icon={<CalendarTodayIcon />} label="Date contrat" value={contract?.date_contrat && formatDateShort(contract.date_contrat)} />
											<Divider />
											<InfoRow icon={<CategoryIcon />} label="Type contrat" value={contract?.type_contrat_display ?? contract?.type_contrat} />
											<Divider />
											<InfoRow icon={<CityIcon />} label="Ville signature" value={contract?.ville_signature} />
										</Stack>
									</CardContent>
								</Card>

								{/* Client */}
								<Card elevation={2} sx={{ borderRadius: 2 }}>
									<CardContent
										sx={{
											px: { xs: 2, md: 3 },
											py: { xs: 2, md: 3 },
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
											<PersonIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>
												Client
											</Typography>
										</Stack>

										<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />

										<Stack spacing={0}>
											<InfoRow icon={<PersonIcon />} label="Nom" value={contract?.client_nom} />
											<Divider />
											<InfoRow icon={<BadgeIcon />} label="CIN / N° ent." value={contract?.client_cin} />
											<Divider />
											<InfoRow icon={<WorkIcon />} label="Qualité" value={resolveLabel(clientQualiteItemsList, contract?.client_qualite)} />
											<Divider />
											<InfoRow icon={<PhoneIcon />} label="Téléphone" value={contract?.client_tel} />
											<Divider />
											<InfoRow icon={<EmailIcon />} label="Email" value={contract?.client_email} />
											<Divider />
											<InfoRow icon={<HomeIcon />} label="Adresse" value={contract?.client_adresse} />
										</Stack>
									</CardContent>
								</Card>

								{/* Travaux */}
								<Card elevation={2} sx={{ borderRadius: 2 }}>
									<CardContent
										sx={{
											px: { xs: 2, md: 3 },
											py: { xs: 2, md: 3 },
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
											<BuildIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>
												Travaux
											</Typography>
										</Stack>

										<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />

										<Stack spacing={0}>
											<InfoRow icon={<ApartmentIcon />} label="Type de bien" value={resolveLabel(typeBienItemsList, contract?.type_bien)} />
											<Divider />
											<InfoRow icon={<SquareFootIcon />} label="Surface (m²)" value={contract?.surface != null ? String(contract.surface) : undefined} />
											<Divider />
											<InfoRow icon={<HomeIcon />} label="Adresse travaux" value={contract?.adresse_travaux} />
											<Divider />
											<InfoRow icon={<CalendarTodayIcon />} label="Date début" value={contract?.date_debut && formatDateShort(contract.date_debut)} />
											<Divider />
											<InfoRow icon={<ConstructionIcon />} label="Description" value={contract?.description_travaux} />
										<Divider />
										<InfoRow icon={<TimerIcon />} label="Durée estimée" value={contract?.duree_estimee} />
										</Stack>
									</CardContent>
								</Card>

								{/* Financier */}
								<Card elevation={2} sx={{ borderRadius: 2 }}>
									<CardContent
										sx={{
											px: { xs: 2, md: 3 },
											py: { xs: 2, md: 3 },
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
											<MoneyIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>
												Financier
											</Typography>
										</Stack>

										<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />

										<Stack spacing={0}>
											<InfoRow
												icon={<MoneyIcon />}
												label="Montant HT"
												value={contract?.montant_ht != null ? `${Number(contract.montant_ht).toLocaleString('fr-MA')} ${contract.devise}` : undefined}
											/>
											<Divider />
											<InfoRow icon={<PercentIcon />} label="TVA (%)" value={contract?.tva != null ? String(contract.tva) : undefined} />
											<Divider />
											<InfoRow
												icon={<MoneyIcon />}
												label="Montant TVA"
												value={contract?.montant_tva != null ? `${Number(contract.montant_tva).toLocaleString('fr-MA')} ${contract.devise}` : undefined}
											/>
											<Divider />
											<InfoRow
												icon={<MoneyIcon />}
												label="Montant TTC"
												value={contract?.montant_ttc != null ? `${Number(contract.montant_ttc).toLocaleString('fr-MA')} ${contract.devise}` : undefined}
											/>
											<Divider />
											<InfoRow icon={<PercentIcon />} label="Pénalité de retard (%/j)" value={contract?.penalite_retard != null ? String(contract.penalite_retard) : undefined} />
											{!isBlueline && (
												<>
													<Divider />
													<InfoRow icon={<ShieldIcon />} label="Garantie" value={resolveLabel(garantieItemsList, contract?.garantie)} />
												</>
											)}
										<Divider />
										<InfoRow icon={<MoneyIcon />} label="Mode de paiement" value={resolveLabel(modePaiementTexteItemsList, contract?.mode_paiement_texte)} />
										<Divider />
										<InfoRow icon={<MoneyIcon />} label="RIB / Coordonnées bancaires" value={contract?.rib} />
										</Stack>
									</CardContent>
								</Card>

								{/* Clauses */}
								<Card elevation={2} sx={{ borderRadius: 2 }}>
									<CardContent
										sx={{
											px: { xs: 2, md: 3 },
											py: { xs: 2, md: 3 },
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
											<GavelIcon color="primary" />
											<Typography variant="h6" fontWeight={700}>
												Clauses
											</Typography>
										</Stack>

										<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />

										<Stack spacing={0}>
											<InfoRow icon={<GavelIcon />} label="Tribunal compétent" value={contract?.tribunal} />
											{!isBlueline && (
												<>
													<Divider />
													<InfoRow icon={<PersonIcon />} label="Responsable projet" value={contract?.responsable_projet} />
													<Divider />
													<InfoRow icon={<ShieldIcon />} label="Confidentialité" value={contract?.confidentialite} />
												</>
											)}
										</Stack>
									</CardContent>
								</Card>

							{/* ── CDL-specific sections ── */}
							{isCDL && (
								<>
									{/* Services CDL */}
									{contract?.services && contract.services.length > 0 && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<ChecklistIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Services CDL</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
													{contract.services.map((svc, idx) => (
														<Chip key={idx} label={svc} color="primary" variant="outlined" size="small" />
													))}
												</Box>
											</CardContent>
										</Card>
									)}

									{/* Projet CDL */}
									{(contract?.architecte || contract?.conditions_acces) && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<ArchitectureIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Projet CDL</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<Stack spacing={0}>
													<InfoRow icon={<ArchitectureIcon />} label="Architecte" value={contract?.architecte} />
													<Divider />
													<InfoRow icon={<HomeIcon />} label="Conditions d'accès" value={contract?.conditions_acces} />
												</Stack>
											</CardContent>
										</Card>
									)}

									{/* Échéancier CDL (Tranches) */}
									{contract?.tranches && contract.tranches.length > 0 && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<PlaylistAddCheckIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Échéancier CDL</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<TableContainer component={Paper} variant="outlined">
													<Table size="small">
														<TableHead>
															<TableRow>
																<TableCell sx={{ fontWeight: 700 }}>Tranche</TableCell>
																<TableCell sx={{ fontWeight: 700 }} align="right">Pourcentage</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{contract.tranches.map((tr, idx) => (
																<TableRow key={idx}>
																	<TableCell>{tr.label || `Tranche ${idx + 1}`}</TableCell>
																	<TableCell align="right">{tr.pourcentage}%</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</TableContainer>
											</CardContent>
										</Card>
									)}

									{/* CDL penalty/delay fields (shown independently of tranches) */}
									{(contract?.delai_retard != null || contract?.frais_redemarrage != null || contract?.delai_reserves != null) && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<TimerIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Pénalités et délais CDL</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<Stack spacing={0}>
													<InfoRow icon={<TimerIcon />} label="Délai de retard (jours)" value={contract?.delai_retard != null ? String(contract.delai_retard) : undefined} />
													<Divider />
													<InfoRow icon={<MoneyIcon />} label={`Frais de redémarrage (${contract?.devise ?? 'MAD'})`} value={contract?.frais_redemarrage != null ? Number(contract.frais_redemarrage).toLocaleString('fr-MA') : undefined} />
													<Divider />
													<InfoRow icon={<TimerIcon />} label="Délai levée réserves (jours)" value={contract?.delai_reserves != null ? String(contract.delai_reserves) : undefined} />
												</Stack>
											</CardContent>
										</Card>
									)}

									{/* Clauses actives CDL */}
									{contract?.clauses_actives && contract.clauses_actives.length > 0 && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<GavelIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Clauses actives CDL</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
													{contract.clauses_actives.map((clause, idx) => (
														<Chip key={idx} label={clause} color="secondary" variant="outlined" size="small" />
													))}
												</Box>
											</CardContent>
										</Card>
									)}

									{/* Détails additionnels CDL */}
									{(contract?.clause_spec || contract?.exclusions || contract?.version_document || contract?.annexes) && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<AttachmentIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Détails additionnels CDL</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<Stack spacing={0}>
													<InfoRow icon={<GavelIcon />} label="Clause spécifique" value={contract?.clause_spec} />
													<Divider />
													<InfoRow icon={<GavelIcon />} label="Exclusions" value={contract?.exclusions} />
													<Divider />
													<InfoRow icon={<AttachmentIcon />} label="Version du document" value={contract?.version_document} />
													<Divider />
													<InfoRow icon={<AttachmentIcon />} label="Annexes" value={contract?.annexes} />
												</Stack>
											</CardContent>
										</Card>
									)}
								</>
							)}

							{/* ── ST-specific sections ── */}
							{isST && (
								<>
									{/* Sous-Traitant Identity */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<PersonIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>Sous-Traitant</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												{contract?.st_projet_detail && (
													<>
														<InfoRow icon={<ArchitectureIcon />} label="Projet" value={contract.st_projet_detail.name} />
														<Divider />
													</>
												)}
												<InfoRow icon={<BusinessIcon />} label="Raison sociale" value={contract?.st_name} />
												<Divider />
												<InfoRow icon={<DescriptionIcon />} label="Forme juridique" value={resolveLabel(stFormeJuridiqueItemsList, contract?.st_forme)} />
												<Divider />
												<InfoRow icon={<MoneyIcon />} label="Capital" value={contract?.st_capital} />
												<Divider />
												<InfoRow icon={<BadgeIcon />} label="RC" value={contract?.st_rc} />
												<Divider />
												<InfoRow icon={<BadgeIcon />} label="ICE" value={contract?.st_ice} />
												<Divider />
												<InfoRow icon={<BadgeIcon />} label="IF" value={contract?.st_if} />
												<Divider />
												<InfoRow icon={<ShieldIcon />} label="CNSS" value={contract?.st_cnss} />
												<Divider />
												<InfoRow icon={<HomeIcon />} label="Adresse" value={contract?.st_addr} />
												<Divider />
												<InfoRow icon={<PersonIcon />} label="Représentant" value={contract?.st_rep} />
												<Divider />
												<InfoRow icon={<BadgeIcon />} label="CIN" value={contract?.st_cin} />
												<Divider />
												<InfoRow icon={<WorkIcon />} label="Qualité" value={contract?.st_qualite} />
												<Divider />
												<InfoRow icon={<PhoneIcon />} label="Téléphone" value={contract?.st_tel} />
												<Divider />
												<InfoRow icon={<EmailIcon />} label="Email" value={contract?.st_email} />
												<Divider />
												<InfoRow icon={<MoneyIcon />} label="RIB" value={contract?.st_rib} />
												<Divider />
												<InfoRow icon={<MoneyIcon />} label="Banque" value={contract?.st_banque} />
											</Stack>
										</CardContent>
									</Card>

									{/* Lot & Type */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<CategoryIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>Lot & Type</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												<InfoRow icon={<CategoryIcon />} label="Type de lot" value={resolveLabel(stLotTypeItemsList, contract?.st_lot_type)} />
												<Divider />
												<InfoRow icon={<DescriptionIcon />} label="Description du lot" value={contract?.st_lot_description} />
												<Divider />
												<InfoRow icon={<MoneyIcon />} label="Type de prix" value={resolveLabel(stTypePrixItemsList, contract?.st_type_prix)} />
											</Stack>
										</CardContent>
									</Card>

									{/* Financier ST */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<MoneyIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>Financier ST</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												<InfoRow icon={<PercentIcon />} label="Retenue de garantie" value={contract?.st_retenue_garantie != null ? `${contract.st_retenue_garantie}%` : undefined} />
												<Divider />
												<InfoRow icon={<PercentIcon />} label="Avance" value={contract?.st_avance != null ? `${contract.st_avance}%` : undefined} />
												<Divider />
												<InfoRow icon={<PercentIcon />} label="Taux de pénalité" value={contract?.st_penalite_taux != null ? `${contract.st_penalite_taux}‰/jour` : undefined} />
												<Divider />
												<InfoRow icon={<PercentIcon />} label="Plafond pénalité" value={contract?.st_plafond_penalite != null ? `${contract.st_plafond_penalite}%` : undefined} />
												<Divider />
												<InfoRow icon={<TimerIcon />} label="Délai de paiement" value={contract?.st_delai_paiement != null ? `${contract.st_delai_paiement} jours` : undefined} />
											</Stack>
										</CardContent>
									</Card>

									{/* Échéancier ST */}
									{contract?.st_tranches && contract.st_tranches.length > 0 && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<PlaylistAddCheckIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Échéancier ST</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<TableContainer component={Paper} variant="outlined">
													<Table size="small">
														<TableHead>
															<TableRow>
																<TableCell sx={{ fontWeight: 700 }}>Tranche</TableCell>
																<TableCell sx={{ fontWeight: 700 }} align="right">Pourcentage</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{contract.st_tranches.map((tr, idx) => (
																<TableRow key={idx}>
																	<TableCell>{tr.label || `Tranche ${idx + 1}`}</TableCell>
																	<TableCell align="right">{tr.pourcentage}%</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</TableContainer>
											</CardContent>
										</Card>
									)}

									{/* Délais & Garantie ST */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<TimerIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>Délais & Garantie ST</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												<InfoRow icon={<TimerIcon />} label="Délai d'exécution" value={contract?.st_delai_val != null ? `${contract.st_delai_val} ${resolveLabel(stDelaiUnitItemsList, contract?.st_delai_unit)}` : undefined} />
												<Divider />
												<InfoRow icon={<ShieldIcon />} label="Garantie" value={contract?.st_garantie_mois != null ? `${contract.st_garantie_mois} mois` : undefined} />
												<Divider />
												<InfoRow icon={<TimerIcon />} label="Délai levée réserves" value={contract?.st_delai_reserves != null ? `${contract.st_delai_reserves} jours` : undefined} />
												<Divider />
												<InfoRow icon={<GavelIcon />} label="Délai médiation" value={contract?.st_delai_med != null ? `${contract.st_delai_med} jours` : undefined} />
											</Stack>
										</CardContent>
									</Card>

									{/* Clauses actives ST */}
									{contract?.st_clauses_actives && contract.st_clauses_actives.length > 0 && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<GavelIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Clauses actives ST</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
													{contract.st_clauses_actives.map((clause, idx) => {
														const clauseItem = stClausesActivesList.find((c) => c.key === clause);
														return (
															<Chip key={idx} label={clauseItem?.label ?? clause} color="secondary" variant="outlined" size="small" />
														);
													})}
												</Box>
											</CardContent>
										</Card>
									)}

									{/* Observations ST */}
									{contract?.st_observations && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<NotesIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>Observations</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<Typography>{contract.st_observations}</Typography>
											</CardContent>
										</Card>
									)}
								</>
							)}

							{/* ── Blueline-specific sections ── */}
							{isBlueline && (
								<>
									{/* Client (Blueline extra) */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<PersonIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>
													Client (Blueline)
												</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												<InfoRow icon={<CityIcon />} label="Ville du client" value={contract?.client_ville} />
												<Divider />
												<InfoRow icon={<HomeIcon />} label="Code postal" value={contract?.client_cp} />
												<Divider />
												<InfoRow icon={<CityIcon />} label="Ville du chantier" value={contract?.chantier_ville} />
												<Divider />
												<InfoRow icon={<ApartmentIcon />} label="Étage" value={contract?.chantier_etage} />
											</Stack>
										</CardContent>
									</Card>

									{/* Prestations */}
									{contract?.prestations && contract.prestations.length > 0 && (
										<Card elevation={2} sx={{ borderRadius: 2 }}>
											<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
												<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
													<ListAltIcon color="primary" />
													<Typography variant="h6" fontWeight={700}>
														Prestations
													</Typography>
												</Stack>
												<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
												<TableContainer component={Paper} variant="outlined">
													<Table size="small">
														<TableHead>
															<TableRow>
																<TableCell sx={{ fontWeight: 700 }}>Prestation</TableCell>
																<TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
																<TableCell sx={{ fontWeight: 700 }} align="right">Qté</TableCell>
																<TableCell sx={{ fontWeight: 700 }}>Unité</TableCell>
																<TableCell sx={{ fontWeight: 700 }} align="right">Prix unit.</TableCell>
																<TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{contract.prestations.map((p, idx) => (
																<TableRow key={idx}>
																	<TableCell>{resolveLabel(prestationNomItemsList, p.nom)}</TableCell>
																	<TableCell>{p.description || '-'}</TableCell>
																	<TableCell align="right">{p.quantite}</TableCell>
																	<TableCell>{resolveLabel(prestationUniteItemsList, p.unite)}</TableCell>
																	<TableCell align="right">{Number(p.prix_unitaire).toLocaleString('fr-MA')}</TableCell>
																	<TableCell align="right">{(p.quantite * p.prix_unitaire).toLocaleString('fr-MA')}</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</TableContainer>
											</CardContent>
										</Card>
									)}

									{/* Fournitures & Eau/Électricité */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<PlumbingIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>
													Fournitures & Eau / Électricité
												</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												<InfoRow icon={<PlumbingIcon />} label="Fournitures" value={resolveLabel(fournituresItemsList, contract?.fournitures)} />
												<Divider />
												<InfoRow icon={<DescriptionIcon />} label="Détail matériaux" value={contract?.materiaux_detail} />
												<Divider />
												<InfoRow icon={<WaterIcon />} label="Eau & Électricité" value={resolveLabel(eauElectriciteItemsList, contract?.eau_electricite)} />
											</Stack>
										</CardContent>
									</Card>

									{/* Garantie (Blueline) */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<ShieldIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>
													Garantie (Blueline)
												</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												<InfoRow
													icon={<TimerIcon />}
													label="Durée garantie"
													value={
														contract?.garantie_nb != null
															? `${contract.garantie_nb} ${resolveLabel(garantieUniteItemsList, contract?.garantie_unite)}`
															: undefined
													}
												/>
												<Divider />
												<InfoRow icon={<ShieldIcon />} label="Type de garantie" value={resolveLabel(garantieTypeItemsList, contract?.garantie_type)} />
												<Divider />
												<InfoRow icon={<DescriptionIcon />} label="Exclusions" value={contract?.exclusions_garantie} />
											</Stack>
										</CardContent>
									</Card>

									{/* Échéancier & Résiliation */}
									<Card elevation={2} sx={{ borderRadius: 2 }}>
										<CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
											<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
												<PercentIcon color="primary" />
												<Typography variant="h6" fontWeight={700}>
													Échéancier & Résiliation
												</Typography>
											</Stack>
											<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
											<Stack spacing={0}>
												<InfoRow icon={<PercentIcon />} label="Acompte (%)" value={contract?.acompte != null ? `${contract.acompte}%` : undefined} />
												<Divider />
												<InfoRow icon={<PercentIcon />} label="Tranche 2 (%)" value={contract?.tranche2 != null ? `${contract.tranche2}%` : undefined} />
												<Divider />
												<InfoRow icon={<PercentIcon />} label="Solde (%)" value={contract?.solde != null ? `${contract.solde}%` : undefined} />
												<Divider />
												<InfoRow icon={<GavelIcon />} label="Clause résiliation" value={resolveLabel(clauseResiliationItemsList, contract?.clause_resiliation)} />
												<Divider />
												<InfoRow icon={<NotesIcon />} label="Notes" value={contract?.notes} />
											</Stack>
										</CardContent>
									</Card>
								</>
							)}

							{/* ── Meta / Audit info ── */}
							<Card elevation={2} sx={{ borderRadius: 2 }}>
								<CardContent sx={{ p: 3 }}>
									<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
										<DescriptionIcon color="primary" />
										<Typography variant="h6" fontWeight={700}>
											Informations système
										</Typography>
									</Stack>
									<Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
									<Stack spacing={0}>
										<InfoRow
											icon={<CalendarTodayIcon />}
											label="Date de création"
											value={formatDate(contract?.date_created ?? null)}
										/>
										<Divider />
										<InfoRow
											icon={<CalendarTodayIcon />}
											label="Dernière modification"
											value={formatDate(contract?.date_updated ?? null)}
										/>
										<Divider />
										<InfoRow icon={<PersonIcon />} label="Créé par" value={contract?.created_by_user_name} />
									</Stack>
								</CardContent>
							</Card>
							</Stack>
						)}
					</Stack>
				</Protected>
			</NavigationBar>
		{showDeleteModal && (
			<ActionModals
				title="Supprimer ce contrat ?"
				body="Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible."
				actions={deleteModalActions}
				titleIcon={<DeleteIcon />}
				titleIconColor="#D32F2F"
			/>
		)}
		{showLanguageModal && (
			<PdfLanguageModal
				onSelectLanguage={handleLanguageSelect}
				onClose={() => { setShowLanguageModal(false); setPendingDocFormat(null); }}
			/>
		)}
		</Stack>
	);
};

export default ContractViewClient;
