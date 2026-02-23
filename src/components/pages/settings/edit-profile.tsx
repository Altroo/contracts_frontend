'use client';

import React, { useState, useEffect } from 'react';
import {
	Box, Typography, Button, TextField, Paper, Stack, CircularProgress,
} from '@mui/material';
import { useAppSelector } from '@/utils/hooks';
import { getProfilState } from '@/store/selectors';
import { useEditProfilMutation } from '@/store/services/account';
import { useAppDispatch } from '@/utils/hooks';
import { accountEditProfilAction } from '@/store/actions/accountActions';

const EditProfileClient = () => {
	const dispatch = useAppDispatch();
	const profil = useAppSelector(getProfilState);
	const [editProfil, { isLoading }] = useEditProfilMutation();

	const [form, setForm] = useState({
		first_name: '',
		last_name: '',
		email: '',
	});
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (profil) {
			setForm({
				first_name: profil.first_name ?? '',
				last_name: profil.last_name ?? '',
				email: profil.email ?? '',
			});
		}
	}, [profil]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		try {
			const result = await editProfil({ data: form }).unwrap();
			dispatch(accountEditProfilAction(result));
			setSuccess(true);
		} catch {
			setError('Erreur lors de la mise à jour du profil.');
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" fontWeight={700} gutterBottom>Mon Profil</Typography>
			<Paper sx={{ p: 3, maxWidth: 600 }} component="form" onSubmit={handleSubmit}>
				<Stack spacing={3}>
					{error && <Typography color="error">{error}</Typography>}
					{success && <Typography color="success.main">Profil mis à jour.</Typography>}
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField label="Prénom" name="first_name" value={form.first_name} onChange={handleChange} fullWidth />
						<TextField label="Nom" name="last_name" value={form.last_name} onChange={handleChange} fullWidth />
					</Stack>
					<TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth />
					<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
						<Button type="submit" variant="contained" disabled={isLoading}
							startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}>
							{isLoading ? 'Sauvegarde...' : 'Enregistrer'}
						</Button>
					</Box>
				</Stack>
			</Paper>
		</Box>
	);
};

export default EditProfileClient;
