'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DASHBOARD } from '@/utils/routes';

const LoginClient = () => {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const result = await signIn('credentials', { email, password, redirect: false });

		if (result?.error) {
			setError('Email ou mot de passe incorrect.');
			setLoading(false);
		} else {
			router.push(DASHBOARD);
		}
	};

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
				bgcolor: '#F5F5F5',
			}}
		>
			<Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
					<GavelIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
					<Typography variant="h5" fontWeight={700}>
						Gestion des Contrats
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Elbouazzati Holding
					</Typography>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<TextField
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						fullWidth
						autoComplete="email"
					/>
					<TextField
						label="Mot de passe"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						fullWidth
						autoComplete="current-password"
					/>
					<Button
						type="submit"
						variant="contained"
						fullWidth
						size="large"
						disabled={loading}
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
					>
						{loading ? 'Connexion...' : 'Se connecter'}
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};

export default LoginClient;
