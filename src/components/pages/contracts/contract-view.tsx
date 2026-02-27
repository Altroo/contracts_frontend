'use client';

import React, { useState } from 'react';
import {
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	Stack,
	Typography,
} from '@mui/material';
import {
	Description as DescriptionIcon,
	CalendarToday as CalendarIcon,
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
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { CONTRACTS_LIST, CONTRACTS_EDIT } from '@/utils/routes';
import { useGetContractQuery, useDeleteContractMutation } from '@/store/services/contract';
import { getAccessTokenFromSession } from '@/store/session';
import { contractStatusColors } from '@/utils/rawData';
import { useToast } from '@/utils/hooks';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import { Protected } from '@/components/layouts/protected/protected';
import type { SessionProps } from '@/types/_initTypes';
import Styles from '@/styles/dashboard/dashboard.module.sass';

interface Props extends SessionProps {
	id: number;
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
	<Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
		{icon}
		<Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 600 }}>
			{label}
		</Typography>
		<Typography variant="body1">{value || '—'}</Typography>
	</Stack>
);

const ContractViewClient = ({ id, session }: Props) => {
	const router = useRouter();
	const { onSuccess, onError } = useToast();
	const token = getAccessTokenFromSession(session);
	const { data: contract, isLoading: isDataLoading } = useGetContractQuery({ id }, { skip: !token });
	const [deleteContract, { isLoading: isDeleting }] = useDeleteContractMutation();
	const [openDialog, setOpenDialog] = useState(false);

	if (isDataLoading) {
		return <ApiProgress backdropColor="#FFFFFF" circularColor="#0274D7" />;
	}

	if (!contract) {
		return (
			<Stack className={Styles.main as string} spacing={3}>
				<Typography variant="h6" color="error">
					Contrat introuvable.
				</Typography>
				<Button variant="outlined" onClick={() => router.push(CONTRACTS_LIST)}>
					Retour à la liste
				</Button>
			</Stack>
		);
	}

	const handleDelete = async () => {
		try {
			await deleteContract({ id }).unwrap();
			onSuccess('Contrat supprimé.');
			router.push(CONTRACTS_LIST);
		} catch {
			onError('Échec de la suppression.');
		}
		setOpenDialog(false);
	};

	const statusColor = contractStatusColors[contract.statut] ?? 'default';

	return (
		<Protected>
		<Stack className={Styles.main as string} spacing={3}>
			{/* Header */}
			<Stack direction="row" spacing={3} alignItems="center">
				<Stack>
					<Typography variant="h5" fontWeight={700}>
						{contract.numero_contrat}
					</Typography>
					<Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
						<Chip label={contract.statut} color={statusColor} size="small" />
					</Stack>
				</Stack>
			</Stack>

			{/* Informations générales */}
			<Card elevation={2} sx={{ borderRadius: 2 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
						Informations générales
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<InfoRow icon={<DescriptionIcon color="action" />} label="N° contrat" value={contract.numero_contrat ?? ''} />
					<InfoRow icon={<CalendarIcon color="action" />} label="Date contrat" value={contract.date_contrat ?? ''} />
					<InfoRow icon={<CategoryIcon color="action" />} label="Type contrat" value={contract.type_contrat ?? ''} />
					<InfoRow icon={<CityIcon color="action" />} label="Ville signature" value={contract.ville_signature ?? ''} />
				</CardContent>
			</Card>

			{/* Client */}
			<Card elevation={2} sx={{ borderRadius: 2 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
						Client
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<InfoRow icon={<PersonIcon color="action" />} label="Nom" value={contract.client_nom ?? ''} />
					<InfoRow icon={<BadgeIcon color="action" />} label="CIN / N° ent." value={contract.client_cin ?? ''} />
					<InfoRow icon={<WorkIcon color="action" />} label="Qualité" value={contract.client_qualite ?? ''} />
					<InfoRow icon={<PhoneIcon color="action" />} label="Téléphone" value={contract.client_tel ?? ''} />
					<InfoRow icon={<EmailIcon color="action" />} label="Email" value={contract.client_email ?? ''} />
					<InfoRow icon={<HomeIcon color="action" />} label="Adresse" value={contract.client_adresse ?? ''} />
				</CardContent>
			</Card>

			{/* Travaux */}
			<Card elevation={2} sx={{ borderRadius: 2 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
						Travaux
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<InfoRow icon={<ApartmentIcon color="action" />} label="Type de bien" value={contract.type_bien ?? ''} />
					<InfoRow icon={<SquareFootIcon color="action" />} label="Surface (m²)" value={contract.surface != null ? String(contract.surface) : ''} />
					<InfoRow icon={<HomeIcon color="action" />} label="Adresse travaux" value={contract.adresse_travaux ?? ''} />
					<InfoRow icon={<CalendarIcon color="action" />} label="Date début" value={contract.date_debut ?? ''} />
					<InfoRow icon={<ConstructionIcon color="action" />} label="Description" value={contract.description_travaux ?? ''} />
				</CardContent>
			</Card>

			{/* Financier */}
			<Card elevation={2} sx={{ borderRadius: 2 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
						Financier
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<InfoRow
						icon={<MoneyIcon color="action" />}
						label="Montant HT"
						value={contract.montant_ht != null ? `${Number(contract.montant_ht).toLocaleString('fr-MA')} ${contract.devise}` : ''}
					/>
					<InfoRow icon={<PercentIcon color="action" />} label="TVA (%)" value={contract.tva != null ? String(contract.tva) : ''} />
					<InfoRow icon={<ShieldIcon color="action" />} label="Garantie" value={contract.garantie ?? ''} />
				</CardContent>
			</Card>

			{/* Actions */}
			<Stack direction="row" spacing={2} justifyContent="center">
				<Button
					variant="contained"
					startIcon={<EditIcon />}
					onClick={() => router.push(CONTRACTS_EDIT(id))}
				>
					Modifier
				</Button>
				<Button
					variant="outlined"
					color="error"
					startIcon={<DeleteIcon />}
					onClick={() => setOpenDialog(true)}
				>
					Supprimer
				</Button>
			</Stack>

			{/* Delete confirmation dialog */}
			<Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
				<DialogTitle>Confirmer la suppression</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Voulez-vous vraiment supprimer le contrat {contract.numero_contrat} ?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDialog(false)}>Annuler</Button>
					<Button onClick={handleDelete} color="error" disabled={isDeleting}>
						{isDeleting ? 'Suppression...' : 'Supprimer'}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
		</Protected>
	);
};

export default ContractViewClient;
