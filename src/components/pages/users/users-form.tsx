'use client';

import React, { useState } from 'react';
import {
	Box, Typography, Button, TextField, Paper, Stack,
	FormControlLabel, Switch, CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { USERS_LIST, USERS_VIEW } from '@/utils/routes';
import { useAddUserMutation } from '@/store/services/account';

const UsersFormClient = () => {
	const router = useRouter();
	const [addUser, { isLoading }] = useAddUserMutation();
	const [form, setForm] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password1: '',
		password2: '',
		is_staff: false,
		can_view: true,
		can_print: true,
		can_create: false,
		can_edit: false,
		can_delete: false,
	});
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (form.password1 !== form.password2) {
			setError('Les mots de passe ne correspondent pas.');
			return;
		}
		try {
			const result = await addUser({ data: form }).unwrap();
			router.push(USERS_VIEW(result.id));
		} catch {
			setError("Erreur lors de la création de l'utilisateur.");
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" fontWeight={700} gutterBottom>Nouvel utilisateur</Typography>
			<Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
				<Stack spacing={3}>
					{error && <Typography color="error">{error}</Typography>}
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Prénom" name="first_name" value={form.first_name} onChange={handleChange} required fullWidth />
						<TextField label="Nom" name="last_name" value={form.last_name} onChange={handleChange} required fullWidth />
					</Stack>
					<TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Mot de passe" name="password1" type="password" value={form.password1} onChange={handleChange} required fullWidth />
						<TextField label="Confirmer le mot de passe" name="password2" type="password" value={form.password2} onChange={handleChange} required fullWidth />
					</Stack>
					<Box>
						<Typography variant="subtitle2" gutterBottom>Permissions</Typography>
						<Stack direction="row" flexWrap="wrap" gap={1}>
							{(['is_staff', 'can_view', 'can_print', 'can_create', 'can_edit', 'can_delete'] as const).map((key) => (
								<FormControlLabel
									key={key}
									control={<Switch name={key} checked={form[key]} onChange={handleChange} />}
									label={key === 'is_staff' ? 'Administrateur' : key.replace('can_', 'Peut ')}
								/>
							))}
						</Stack>
					</Box>
					<Stack direction="row" spacing={2} justifyContent="flex-end">
						<Button variant="outlined" onClick={() => router.push(USERS_LIST)}>Annuler</Button>
						<Button type="submit" variant="contained" disabled={isLoading}
							startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}>
							{isLoading ? 'Création...' : 'Créer'}
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Box>
	);
};

export default UsersFormClient;
