'use client';

import React from 'react';
import { Button, Typography, Paper } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AUTH_LOGIN } from '@/utils/routes';
import AuthLayout from '@/components/layouts/auth/authLayout';

const SetPasswordCompleteClient = () => {
	const router = useRouter();

	return (
		<AuthLayout>
			<Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2, textAlign: 'center' }}>
				<CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
				<Typography variant="h5" fontWeight={700} gutterBottom>
					Mot de passe modifié
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Votre mot de passe a été modifié, connectez-vous.
				</Typography>
				<Button variant="contained" fullWidth onClick={() => router.push(AUTH_LOGIN)}>
					Se connecter
				</Button>
			</Paper>
		</AuthLayout>
	);
};

export default SetPasswordCompleteClient;
