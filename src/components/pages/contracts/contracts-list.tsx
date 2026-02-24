'use client';

import React from 'react';
import {
	Box,
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	IconButton,
	Tooltip,
	CircularProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Visibility as VisibilityIcon,
	Edit as EditIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { CONTRACTS_ADD, CONTRACTS_VIEW, CONTRACTS_EDIT } from '@/utils/routes';
import { useGetContractsListQuery } from '@/store/services/contract';
import { getAccessTokenFromSession } from '@/store/session';
import type { PaginationResponseType, SessionProps } from '@/types/_initTypes';
import type { ContractClass } from '@/models/classes';

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary'> = {
	Brouillon: 'default',
	Envoyé: 'info',
	Signé: 'primary',
	'En cours': 'warning',
	Terminé: 'success',
	Annulé: 'error',
	Expiré: 'error',
};

const ContractsListClient: React.FC<SessionProps> = ({ session }: SessionProps) => {
	const router = useRouter();
	const token = getAccessTokenFromSession(session);
	const { data, isLoading, isError } = useGetContractsListQuery({ with_pagination: true, page: 1 }, { skip: !token });

	if (isLoading) {
		return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
	}

	if (isError) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography color="error">Erreur lors du chargement des contrats.</Typography>
			</Box>
		);
	}

	const contracts = (data && 'results' in data ? (data as PaginationResponseType<ContractClass>).results : (data as ContractClass[] | undefined)) ?? [];

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="h5" fontWeight={700}>Liste des contrats</Typography>
				<Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push(CONTRACTS_ADD)}>
					Nouveau contrat
				</Button>
			</Box>

			{contracts.length === 0 ? (
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					<Typography color="text.secondary">Aucun contrat trouvé.</Typography>
				</Paper>
			) : (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Référence</TableCell>
								<TableCell>Client</TableCell>
								<TableCell>Type de contrat</TableCell>
								<TableCell>Statut</TableCell>
								<TableCell>Date du contrat</TableCell>
								<TableCell>Montant HT</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{contracts.map((contract) => (
								<TableRow key={contract.id} hover>
									<TableCell>{contract.numero_contrat}</TableCell>
									<TableCell>{contract.client_nom ?? '—'}</TableCell>
									<TableCell>{contract.type_contrat}</TableCell>
									<TableCell>
										<Chip
											label={contract.statut}
											color={statusColors[contract.statut] ?? 'default'}
											size="small"
										/>
									</TableCell>
									<TableCell>{contract.date_contrat}</TableCell>
									<TableCell>
										{contract.montant_ht != null
											? `${Number(contract.montant_ht).toLocaleString('fr-MA')} ${contract.devise}`
											: '—'}
									</TableCell>
									<TableCell align="right">
										<Tooltip title="Consulter">
											<IconButton size="small" onClick={() => router.push(CONTRACTS_VIEW(contract.id))}>
												<VisibilityIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Modifier">
											<IconButton size="small" onClick={() => router.push(CONTRACTS_EDIT(contract.id))}>
												<EditIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	);
};

export default ContractsListClient;
