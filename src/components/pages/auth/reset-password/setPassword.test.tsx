import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import SetPasswordClient from './setPassword';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
}));

jest.mock('@/utils/routes', () => ({
	AUTH_RESET_PASSWORD_SET_PASSWORD_COMPLETE: '/reset-password/set-password-complete',
}));

describe('SetPasswordClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = jest.fn();
	});

	it('renders password inputs and submit button', () => {
		render(
			<Provider store={store}>
				<SetPasswordClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /mettre à jour/i })).toBeInTheDocument();
	});

	it('shows error when passwords do not match', async () => {
		render(
			<Provider store={store}>
				<SetPasswordClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/nouveau mot de passe/i), { target: { value: 'pass1234' } });
			fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'different' } });
			fireEvent.click(screen.getByRole('button', { name: /mettre à jour/i }));
		});

		expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
	});

	it('redirects on success', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

		render(
			<Provider store={store}>
				<SetPasswordClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/nouveau mot de passe/i), { target: { value: 'pass1234' } });
			fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'pass1234' } });
			fireEvent.click(screen.getByRole('button', { name: /mettre à jour/i }));
		});

		expect(mockPush).toHaveBeenCalledWith('/reset-password/set-password-complete');
	});
});
