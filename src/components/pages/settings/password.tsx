'use client';

import React, { useState } from 'react';
import {
	Box, Typography, Button, TextField, Paper, Stack, CircularProgress, Alert,
} from '@mui/material';

const PasswordClient = () => {
	const [form, setForm] = useState({ old_password: '', new_password1: '', new_password2: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		if (form.new_password1 !== form.new_password2) {
			setError('Les nouveaux mots de passe ne correspondent pas.');
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_ACCOUNT_CHANGE_PASSWORD}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(form),
			});

			if (res.ok) {
				setSuccess(true);
				setForm({ old_password: '', new_password1: '', new_password2: '' });
			} else {
				const data = await res.json();
				setError(data?.detail ?? 'Erreur lors du changement de mot de passe.');
			}
		} catch {
			setError('Une erreur est survenue.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" fontWeight={700} gutterBottom>Changer le mot de passe</Typography>
			<Paper sx={{ p: 3, maxWidth: 480 }} component="form" onSubmit={handleSubmit}>
				<Stack spacing={3}>
					{error && <Alert severity="error">{error}</Alert>}
					{success && <Alert severity="success">Mot de passe mis à jour.</Alert>}
					<TextField label="Mot de passe actuel" name="old_password" type="password" value={form.old_password} onChange={handleChange} required fullWidth />
					<TextField label="Nouveau mot de passe" name="new_password1" type="password" value={form.new_password1} onChange={handleChange} required fullWidth />
					<TextField label="Confirmer" name="new_password2" type="password" value={form.new_password2} onChange={handleChange} required fullWidth />
					<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
						<Button type="submit" variant="contained" disabled={loading}
							startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}>
							{loading ? 'Mise à jour...' : 'Mettre à jour'}
						</Button>
					</Box>
				</Stack>
			</Paper>
		</Box>
	);
};

export default PasswordClient;
