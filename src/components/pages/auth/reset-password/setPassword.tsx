'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AUTH_RESET_PASSWORD_SET_PASSWORD_COMPLETE } from '@/utils/routes';
import AuthLayout from '@/components/layouts/auth/authLayout';

const SetPasswordClient = () => {
	const router = useRouter();
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		if (password !== confirm) {
			setError('Les mots de passe ne correspondent pas.');
			return;
		}

		setLoading(true);
		try {
			await fetch('/cookies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pass_updated: 'true', maxAge: 60 }),
			});
			router.push(AUTH_RESET_PASSWORD_SET_PASSWORD_COMPLETE);
		} catch {
			setError('Une erreur est survenue.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2 }}>
				<Typography variant="h5" fontWeight={700} gutterBottom>Nouveau mot de passe</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Choisissez un nouveau mot de passe sécurisé.
				</Typography>
				{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
				<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<TextField
						label="Nouveau mot de passe"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						fullWidth
					/>
					<TextField
						label="Confirmer le mot de passe"
						type="password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						required
						fullWidth
					/>
					<Button type="submit" variant="contained" fullWidth disabled={loading}
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
						{loading ? 'Mise à jour...' : 'Mettre à jour'}
					</Button>
					<Button variant="text" onClick={() => router.back()}>Retour</Button>
				</Box>
			</Paper>
		</AuthLayout>
	);
};

export default SetPasswordClient;
