'use client';

import React, { useState, useEffect } from 'react';
import {
	Box, Typography, Button, TextField, Paper, Stack,
	FormControlLabel, Switch, CircularProgress, Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { USERS_LIST } from '@/utils/routes';
import { useGetUserQuery, usePatchUserMutation } from '@/store/services/account';

interface Props {
	id: number;
}

const UsersViewClient = ({ id }: Props) => {
	const router = useRouter();
	const { data: user, isLoading } = useGetUserQuery({ id });
	const [patchUser, { isLoading: isSaving }] = usePatchUserMutation();

	const [form, setForm] = useState({
		first_name: '',
		last_name: '',
		email: '',
		is_active: true,
		is_staff: false,
		can_view: true,
		can_print: true,
		can_create: false,
		can_edit: false,
		can_delete: false,
	});
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (user) {
			setForm({
				first_name: user.first_name ?? '',
				last_name: user.last_name ?? '',
				email: user.email ?? '',
				is_active: user.is_active ?? true,
				is_staff: user.is_staff ?? false,
				can_view: user.can_view ?? true,
				can_print: user.can_print ?? true,
				can_create: user.can_create ?? false,
				can_edit: user.can_edit ?? false,
				can_delete: user.can_delete ?? false,
			});
		}
	}, [user]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		try {
			await patchUser({ id, data: form }).unwrap();
			setSuccess(true);
		} catch {
			setError('Erreur lors de la mise à jour.');
		}
	};

	if (isLoading) {
		return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
	}

	if (!user) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography color="error">Utilisateur introuvable.</Typography>
				<Button onClick={() => router.push(USERS_LIST)} sx={{ mt: 2 }}>Retour</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
				<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.push(USERS_LIST)}>Retour</Button>
				<Typography variant="h5" fontWeight={700}>
					{user.first_name} {user.last_name}
				</Typography>
			</Stack>

			<Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
				<Stack spacing={3}>
					{error && <Typography color="error">{error}</Typography>}
					{success && <Typography color="success.main">Modifications enregistrées.</Typography>}

					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Prénom" name="first_name" value={form.first_name} onChange={handleChange} fullWidth />
						<TextField label="Nom" name="last_name" value={form.last_name} onChange={handleChange} fullWidth />
					</Stack>
					<TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth />

					<Divider />
					<Typography variant="subtitle2">Permissions</Typography>
					<Stack direction="row" flexWrap="wrap" gap={1}>
						{(['is_active', 'is_staff', 'can_view', 'can_print', 'can_create', 'can_edit', 'can_delete'] as const).map((key) => (
							<FormControlLabel
								key={key}
								control={<Switch name={key} checked={form[key]} onChange={handleChange} />}
								label={{
									is_active: 'Actif',
									is_staff: 'Administrateur',
									can_view: 'Peut consulter',
									can_print: 'Peut imprimer',
									can_create: 'Peut créer',
									can_edit: 'Peut modifier',
									can_delete: 'Peut supprimer',
								}[key]}
							/>
						))}
					</Stack>

					<Stack direction="row" justifyContent="flex-end">
						<Button type="submit" variant="contained" disabled={isSaving}
							startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : null}>
							{isSaving ? 'Sauvegarde...' : 'Enregistrer'}
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Box>
	);
};

export default UsersViewClient;
