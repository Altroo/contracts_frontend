'use client';

import React, { createContext, useState } from 'react';
import type { AlertColor } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';

export type ToastContextType = {
	onSuccess: (msg: string) => void;
	onError: (msg: string) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [show, setShow] = useState(false);
	const [type, setType] = useState<AlertColor>('success');
	const [message, setMessage] = useState('');

	const onSuccess = (msg: string) => {
		setType('success');
		setMessage(msg);
		setShow(true);
	};

	const onError = (msg: string) => {
		setType('error');
		setMessage(msg);
		setShow(true);
	};

	return (
		<ToastContext.Provider value={{ onSuccess, onError }}>
			{children}
			<Snackbar
				open={show}
				autoHideDuration={4000}
				onClose={() => setShow(false)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert onClose={() => setShow(false)} severity={type} variant="filled">
					{message}
				</Alert>
			</Snackbar>
		</ToastContext.Provider>
	);
};
