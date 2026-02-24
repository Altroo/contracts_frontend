'use client';

import React from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Stack,
	Chip,
	Divider,
	CircularProgress,
	Grid,
} from '@mui/material';
import {
	Edit as EditIcon,
	ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { CONTRACTS_LIST, CONTRACTS_EDIT } from '@/utils/routes';
import { useGetContractQuery } from '@/store/services/contract';
import { getAccessTokenFromSession } from '@/store/session';
import { normalizeStatut } from '@/utils/helpers';
import { contractStatusColors } from '@/utils/rawData';
import type { SessionProps } from '@/types/_initTypes';

interface Props extends SessionProps {
	id: number;
}

const ContractViewClient = ({ id, session }: Props) => {
	const router = useRouter();
	const token = getAccessTokenFromSession(session);
	const { data: contract, isLoading, isError } = useGetContractQuery({ id }, { skip: !token });

	if (isLoading) {
		return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
	}

	if (isError || !contract) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography color="error">Contrat introuvable.</Typography>
				<Button onClick={() => router.push(CONTRACTS_LIST)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
					Retour à la liste
				</Button>
			</Box>
		);
	}

	const status = contractStatusColors[normalizeStatut(contract.statut)] ?? 'default';

	return (
		<Box sx={{ p: 3 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push(CONTRACTS_LIST)}>
						Retour
					</Button>
					<Typography variant="h5" fontWeight={700}>{contract.numero_contrat}</Typography>
					<Chip label={contract.statut} color={status} />
				</Stack>
				<Button variant="contained" startIcon={<EditIcon />} onClick={() => router.push(CONTRACTS_EDIT(contract.id))}>
					Modifier
				</Button>
			</Stack>

			<Paper sx={{ p: 3 }}>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12 }}>
						<Typography variant="subtitle1" fontWeight={700} gutterBottom>Informations générales</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Numéro de contrat</Typography>
						<Typography variant="body1" fontWeight={600}>{contract.numero_contrat}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Date du contrat</Typography>
						<Typography variant="body1">{contract.date_contrat ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Type de contrat</Typography>
						<Typography variant="body1">{contract.type_contrat ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Ville de signature</Typography>
						<Typography variant="body1">{contract.ville_signature ?? '—'}</Typography>
					</Grid>

					<Grid size={{ xs: 12 }}>
						<Divider sx={{ my: 1 }} />
						<Typography variant="subtitle1" fontWeight={700} gutterBottom>Client</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Nom du client</Typography>
						<Typography variant="body1">{contract.client_nom ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">CIN / Num. entreprise</Typography>
						<Typography variant="body1">{contract.client_cin ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Qualité</Typography>
						<Typography variant="body1">{contract.client_qualite ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Téléphone</Typography>
						<Typography variant="body1">{contract.client_tel ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Email</Typography>
						<Typography variant="body1">{contract.client_email ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Adresse</Typography>
						<Typography variant="body1">{contract.client_adresse ?? '—'}</Typography>
					</Grid>

					<Grid size={{ xs: 12 }}>
						<Divider sx={{ my: 1 }} />
						<Typography variant="subtitle1" fontWeight={700} gutterBottom>Travaux</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Type de bien</Typography>
						<Typography variant="body1">{contract.type_bien ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Surface (m²)</Typography>
						<Typography variant="body1">{contract.surface ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Adresse des travaux</Typography>
						<Typography variant="body1">{contract.adresse_travaux ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography variant="caption" color="text.secondary">Date de début</Typography>
						<Typography variant="body1">{contract.date_debut ?? '—'}</Typography>
					</Grid>
					{contract.description_travaux && (
						<Grid size={{ xs: 12 }}>
							<Typography variant="caption" color="text.secondary">Description des travaux</Typography>
							<Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{contract.description_travaux}</Typography>
						</Grid>
					)}

					<Grid size={{ xs: 12 }}>
						<Divider sx={{ my: 1 }} />
						<Typography variant="subtitle1" fontWeight={700} gutterBottom>Financier</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Typography variant="caption" color="text.secondary">Montant HT</Typography>
						<Typography variant="body1" fontWeight={600}>
							{contract.montant_ht != null
								? `${Number(contract.montant_ht).toLocaleString('fr-MA')} ${contract.devise}`
								: '—'}
						</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Typography variant="caption" color="text.secondary">TVA (%)</Typography>
						<Typography variant="body1">{contract.tva ?? '—'}</Typography>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Typography variant="caption" color="text.secondary">Garantie</Typography>
						<Typography variant="body1">{contract.garantie ?? '—'}</Typography>
					</Grid>
				</Grid>
			</Paper>
		</Box>
	);
};

export default ContractViewClient;
