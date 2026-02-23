'use client';

import { useContext, useEffect } from 'react';
import { ToastContext } from '@/contexts/toastContext';

const SessionExpiredListener: React.FC = () => {
	const toast = useContext(ToastContext);

	useEffect(() => {
		const handler = () => {
			toast?.onError('Votre session a expiré, veuillez vous reconnecter.');
		};
		window.addEventListener('session-expired', handler);
		return () => window.removeEventListener('session-expired', handler);
	}, [toast]);

	return null;
};

export default SessionExpiredListener;
