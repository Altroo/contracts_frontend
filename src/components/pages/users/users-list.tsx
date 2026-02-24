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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { USERS_ADD, USERS_VIEW } from '@/utils/routes';
import { useGetUsersListQuery } from '@/store/services/account';
import { getAccessTokenFromSession } from '@/store/session';
import { Protected } from '@/components/layouts/protected/protected';
import type { PaginationResponseType, SessionProps } from '@/types/_initTypes';
import type { UserClass } from '@/models/classes';

const UsersListClient: React.FC<SessionProps> = ({ session }: SessionProps) => {
	const router = useRouter();
	const token = getAccessTokenFromSession(session);
	const { data, isLoading, isError } = useGetUsersListQuery({ with_pagination: true, page: 1 }, { skip: !token });

	if (isLoading) {
		return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
	}

	if (isError) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography color="error">Erreur lors du chargement des utilisateurs.</Typography>
			</Box>
		);
	}

	const users = (data && 'results' in data ? (data as PaginationResponseType<UserClass>).results : (data as UserClass[] | undefined)) ?? [];

	return (
		<Protected>
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="h5" fontWeight={700}>Utilisateurs</Typography>
				<Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push(USERS_ADD)}>
					Nouvel utilisateur
				</Button>
			</Box>

			{users.length === 0 ? (
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					<Typography color="text.secondary">Aucun utilisateur trouvé.</Typography>
				</Paper>
			) : (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Nom</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>Statut</TableCell>
								<TableCell>Rôle</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id} hover>
									<TableCell>{user.first_name} {user.last_name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Chip
											label={user.is_active ? 'Actif' : 'Inactif'}
											color={user.is_active ? 'success' : 'default'}
											size="small"
										/>
									</TableCell>
									<TableCell>
										<Chip
											label={user.is_staff ? 'Administrateur' : 'Utilisateur'}
											color={user.is_staff ? 'primary' : 'default'}
											size="small"
										/>
									</TableCell>
									<TableCell align="right">
										<Tooltip title="Consulter">
											<IconButton size="small" onClick={() => router.push(USERS_VIEW(user.id!))}>
												<VisibilityIcon fontSize="small" />
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
		</Protected>
	);
};

export default UsersListClient;
