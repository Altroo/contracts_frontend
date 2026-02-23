'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AUTH_RESET_PASSWORD_SET_PASSWORD } from '@/utils/routes';

const EnterCodeClient = () => {
	const router = useRouter();
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await fetch('/cookies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, maxAge: 600 }),
			});
			router.push(AUTH_RESET_PASSWORD_SET_PASSWORD);
		} catch {
			setError('Une erreur est survenue.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F5F5F5' }}>
			<Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2 }}>
				<Typography variant="h5" fontWeight={700} gutterBottom>Entrer le code</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Entrez le code reçu par email.
				</Typography>
				{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
				<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<TextField
						label="Code de vérification"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						required
						fullWidth
						inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
					/>
					<Button type="submit" variant="contained" fullWidth disabled={loading}
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
						{loading ? 'Vérification...' : 'Confirmer'}
					</Button>
					<Button variant="text" onClick={() => router.back()}>Retour</Button>
				</Box>
			</Paper>
		</Box>
	);
};

export default EnterCodeClient;
