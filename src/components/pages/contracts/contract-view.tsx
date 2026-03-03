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
} from '@mui/icons-material';
import { CONTRACTS_LIST, CONTRACTS_EDIT, CONTRACT_PDF, CONTRACT_DOC } from '@/utils/routes';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import { formatDate, extractApiErrorMessage } from '@/utils/helpers';
import { useToast } from '@/utils/hooks';
import { fetchFileBlob } from '@/utils/apiHelpers';
import PdfLanguageModal from '@/components/shared/pdfLanguageModal/pdfLanguageModal';
import ActionModals from '@/components/htmlElements/modals/actionModal/actionModals';
import { Protected } from '@/components/layouts/protected/protected';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import { getContractStatusColor, contractStatutItemsList, companyItemsList, fournituresItemsList, eauElectriciteItemsList, garantieUniteItemsList, garantieTypeItemsList, clauseResiliationItemsList, prestationNomItemsList, prestationUniteItemsList } from '@/utils/rawData';
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
															handleStatusChange(statut as ContractStatutType);
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
										<Divider />											<InfoRow icon={<CalendarTodayIcon />} label="Date contrat" value={contract?.date_contrat && formatDate(contract.date_contrat)} />
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
											<InfoRow icon={<WorkIcon />} label="Qualité" value={contract?.client_qualite} />
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
											<InfoRow icon={<ApartmentIcon />} label="Type de bien" value={contract?.type_bien} />
											<Divider />
											<InfoRow icon={<SquareFootIcon />} label="Surface (m²)" value={contract?.surface != null ? String(contract.surface) : undefined} />
											<Divider />
											<InfoRow icon={<HomeIcon />} label="Adresse travaux" value={contract?.adresse_travaux} />
											<Divider />
											<InfoRow icon={<CalendarTodayIcon />} label="Date début" value={contract?.date_debut && formatDate(contract.date_debut)} />
											<Divider />
											<InfoRow icon={<ConstructionIcon />} label="Description" value={contract?.description_travaux} />
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
											<InfoRow icon={<PercentIcon />} label="Pénalité de retard (%/j)" value={contract?.penalite_retard != null ? String(contract.penalite_retard) : undefined} />
											<Divider />
											<InfoRow icon={<ShieldIcon />} label="Garantie" value={contract?.garantie} />
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
											<Divider />
											<InfoRow icon={<PersonIcon />} label="Responsable projet" value={contract?.responsable_projet} />
											<Divider />
											<InfoRow icon={<ShieldIcon />} label="Confidentialité" value={contract?.confidentialite} />
										</Stack>
									</CardContent>
								</Card>
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
