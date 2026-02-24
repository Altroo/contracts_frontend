import axios, { AxiosHeaders } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { signOut } from 'next-auth/react';
import { SITE_ROOT } from '@/utils/routes';
import type { APIContentTypeInterface, ApiErrorResponseType, InitStateToken } from '@/types/_initTypes';

export const handleUnauthorized = async (onResetToken?: () => void) => {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('session-expired'));
	}
	await signOut({ redirect: false, redirectTo: SITE_ROOT });
	if (onResetToken) {
		onResetToken();
	}
};

export const isAuthenticatedInstance = (
	getToken?: () => InitStateToken | undefined,
	onUnauthorized?: () => void,
	contentType: APIContentTypeInterface = 'application/json',
): AxiosInstance => {
	const instance = axios.create({
		baseURL: process.env.NEXT_PUBLIC_ROOT_API_URL,
		headers: { 'Content-Type': contentType },
	});

	instance.interceptors.request.use(
		(config: InternalAxiosRequestConfig) => {
			const headers = new AxiosHeaders(config.headers as Record<string, string>);
			const token = getToken?.();
			if (token?.access) {
				headers.set('Authorization', `Bearer ${token.access}`);
			}
			if (config.data instanceof FormData) {
				headers.delete('Content-Type');
			}
			config.headers = headers as InternalAxiosRequestConfig['headers'];
			return config;
		},
		(error) => Promise.reject(error),
	);

	instance.interceptors.response.use(
		(response: AxiosResponse) => response,
		async (error) => {
			if (error.response?.data) {
				const errorData = error.response.data as ApiErrorResponseType;
				if (error.response.status >= 500) {
					return Promise.reject({
						error: {
							status_code: error.response.status,
							message: 'Erreur serveur.',
							details: { error: ['Veuillez vérifier votre connexion réseau et réessayer.'] },
						},
					});
				}
				if (error.response.status === 401) {
					await handleUnauthorized(onUnauthorized);
					return Promise.reject({
						error: {
							status_code: 401,
							message: errorData.message || 'Non autorisé',
							details: errorData.details || { error: ['Authentification requise'] },
						},
					});
				}
				if (errorData.status_code !== undefined && errorData.message !== undefined) {
					return Promise.reject({
						error: {
							status_code: errorData.status_code,
							message: errorData.message,
							details: errorData.details || {},
						},
					});
				}
			}
			return Promise.reject({
				error: {
					status_code: 0,
					message: error.message || 'Erreur réseau',
					details: { error: ['Impossible de se connecter au serveur'] },
				},
			});
		},
	);

	return instance;
};

export const allowAnyInstance = (contentType: APIContentTypeInterface = 'application/json'): AxiosInstance => {
	const instance = axios.create({
		baseURL: process.env.NEXT_PUBLIC_ROOT_API_URL,
		headers: { 'Content-Type': contentType },
	});

	instance.interceptors.response.use(
		(response: AxiosResponse) => response,
		(error) => {
			if (error.response?.data) {
				const errorData = error.response.data as ApiErrorResponseType;
				if (errorData.status_code !== undefined && errorData.message !== undefined) {
					return Promise.reject({
						error: {
							status_code: errorData.status_code,
							message: errorData.message,
							details: errorData.details || {},
						},
					});
				}
			}
			return Promise.reject({
				error: {
					status_code: error.response?.status || 0,
					message: error.message || 'Erreur réseau',
					details: { error: ['Impossible de se connecter au serveur'] },
				},
			});
		},
	);

	return instance;
};

type FormikAutoErrorsProps = {
	e: unknown;
	setFieldError: (field: string, message: string | undefined) => void;
};

export const setFormikAutoErrors = ({ e, setFieldError }: FormikAutoErrorsProps) => {
	const payload =
		(e as { error?: ApiErrorResponseType; data?: ApiErrorResponseType }).error ??
		(e as { error?: ApiErrorResponseType; data?: ApiErrorResponseType }).data ??
		(e as ApiErrorResponseType);

	if (!payload?.details) return;

	for (const [field, messages] of Object.entries(payload.details)) {
		const errorMsg = Array.isArray(messages) ? messages[0] : messages;
		if (field === 'error' || field === 'detail') {
			setFieldError('globalError', errorMsg);
		} else {
			if (Array.isArray(messages)) {
				messages.forEach((msg) => setFieldError(field, msg));
			} else {
				setFieldError(field, messages);
			}
		}
	}
};

export const hexToRGB = (hex: string, alpha?: number): string => {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return alpha !== undefined ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
};

export const formatDate = (value: string | null) => {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return new Intl.DateTimeFormat('fr-FR', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

export const formatLocalDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const formatNumber = (value: string | number | null | undefined): string => {
	if (value === null || value === undefined) return '0,00';
	const num = typeof value === 'string' ? parseFloat(value) : value;
	if (Number.isNaN(num)) return '0,00';
	return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const parseNumber = (value: string | number): number | null => {
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	const trimmed = value.trim();
	if (trimmed === '') return null;
	const normalized = trimmed.replace(',', '.');
	if (normalized.endsWith('.')) return null;
	const n = Number(normalized);
	return Number.isFinite(n) ? n : null;
};

export const getLabelForKey = (fieldLabels: Record<string, string>, key: string): string =>
	fieldLabels[key] ?? key;
