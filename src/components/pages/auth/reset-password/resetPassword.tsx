'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AUTH_RESET_PASSWORD_ENTER_CODE } from '@/utils/routes';
import AuthLayout from '@/components/layouts/auth/authLayout';

const ResetPasswordClient = () => {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_ACCOUNT_RESET_PASSWORD}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			if (res.ok) {
				await fetch('/cookies', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ new_email: email, maxAge: 600 }),
				});
				router.push(AUTH_RESET_PASSWORD_ENTER_CODE);
			} else {
				setError('Aucun compte trouvé avec cet email.');
			}
		} catch {
			setError('Une erreur est survenue. Veuillez réessayer.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2 }}>
				<Typography variant="h5" fontWeight={700} gutterBottom>
					Réinitialiser le mot de passe
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Entrez votre email pour recevoir un code de réinitialisation.
				</Typography>

				{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

				<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<TextField
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						fullWidth
					/>
					<Button type="submit" variant="contained" fullWidth disabled={loading}
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
						{loading ? 'Envoi...' : 'Envoyer le code'}
					</Button>
					<Button variant="text" onClick={() => router.back()}>Retour à la connexion</Button>
				</Box>
			</Paper>
		</AuthLayout>
	);
};

export default ResetPasswordClient;
