'use client';

import React, { useState } from 'react';
import {
	Avatar,
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
	Person as PersonIcon,
	Email as EmailIcon,
	Wc as WcIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { USERS_LIST, USERS_EDIT } from '@/utils/routes';
import { useRouter } from 'next/navigation';
import { useToast } from '@/utils/hooks';
import { useGetUserQuery, useDeleteUserMutation } from '@/store/services/account';
import { getAccessTokenFromSession } from '@/store/session';
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

const UsersViewClient = ({ id, session }: Props) => {
	const router = useRouter();
	const { onSuccess, onError } = useToast();
	const token = getAccessTokenFromSession(session);
	const { data: rawData, isLoading: isDataLoading } = useGetUserQuery({ id }, { skip: !token });
	const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
	const [openDialog, setOpenDialog] = useState(false);

	if (isDataLoading) {
		return <ApiProgress backdropColor="#FFFFFF" circularColor="#0274D7" />;
	}

	if (!rawData) {
		return (
			<Stack className={Styles.main as string} spacing={3}>
				<Typography variant="h6" color="error">
					Utilisateur introuvable.
				</Typography>
				<Button variant="outlined" onClick={() => router.push(USERS_LIST)}>
					Retour à la liste
				</Button>
			</Stack>
		);
	}

	const handleDelete = async () => {
		try {
			await deleteUser({ id }).unwrap();
			onSuccess('Utilisateur supprimé.');
			router.push(USERS_LIST);
		} catch {
			onError('Échec de la suppression.');
		}
		setOpenDialog(false);
	};

	const genderLabel = rawData.gender === 'H' ? 'Homme' : rawData.gender === 'F' ? 'Femme' : '—';

	return (
		<Protected>
		<Stack className={Styles.main as string} spacing={3}>
			{/* Header */}
			<Stack direction="row" spacing={3} alignItems="center">
				<Avatar
					src={(rawData.avatar_cropped || rawData.avatar || undefined) as string | undefined}
					sx={{ width: 72, height: 72, bgcolor: '#0274D7' }}
				>
					{rawData.first_name?.charAt(0)}
					{rawData.last_name?.charAt(0)}
				</Avatar>
				<Stack>
					<Typography variant="h5" fontWeight={700}>
						{rawData.first_name} {rawData.last_name}
					</Typography>
					<Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
						{rawData.is_staff && <Chip label="Admin" color="primary" size="small" />}
						{rawData.is_active && <Chip label="Actif" color="success" size="small" />}
						{!rawData.is_active && <Chip label="Inactif" color="default" size="small" />}
					</Stack>
				</Stack>
			</Stack>

			{/* Informations */}
			<Card elevation={2} sx={{ borderRadius: 2 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
						Informations générales
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<InfoRow icon={<PersonIcon color="action" />} label="Prénom" value={rawData.first_name ?? ''} />
					<InfoRow icon={<PersonIcon color="action" />} label="Nom" value={rawData.last_name ?? ''} />
					<InfoRow icon={<EmailIcon color="action" />} label="Email" value={rawData.email ?? ''} />
					<InfoRow icon={<WcIcon color="action" />} label="Genre" value={genderLabel} />
				</CardContent>
			</Card>

			{/* Permissions */}
			<Card elevation={2} sx={{ borderRadius: 2 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
						Permissions
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
						<Chip label="Administrateur" color={rawData.is_staff ? 'primary' : 'default'} variant={rawData.is_staff ? 'filled' : 'outlined'} />
						<Chip label="Peut voir" color={rawData.can_view ? 'primary' : 'default'} variant={rawData.can_view ? 'filled' : 'outlined'} />
						<Chip label="Peut imprimer" color={rawData.can_print ? 'primary' : 'default'} variant={rawData.can_print ? 'filled' : 'outlined'} />
						<Chip label="Peut créer" color={rawData.can_create ? 'primary' : 'default'} variant={rawData.can_create ? 'filled' : 'outlined'} />
						<Chip label="Peut modifier" color={rawData.can_edit ? 'primary' : 'default'} variant={rawData.can_edit ? 'filled' : 'outlined'} />
						<Chip label="Peut supprimer" color={rawData.can_delete ? 'primary' : 'default'} variant={rawData.can_delete ? 'filled' : 'outlined'} />
					</Stack>
				</CardContent>
			</Card>

			{/* Actions */}
			<Stack direction="row" spacing={2} justifyContent="center">
				<Button
					variant="contained"
					startIcon={<EditIcon />}
					onClick={() => router.push(USERS_EDIT(id))}
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
						Voulez-vous vraiment supprimer l&apos;utilisateur {rawData.first_name} {rawData.last_name} ?
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

export default UsersViewClient;
