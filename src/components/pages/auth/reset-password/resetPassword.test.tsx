import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import ResetPasswordClient from './resetPassword';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
}));

jest.mock('@/utils/routes', () => ({
	AUTH_RESET_PASSWORD_ENTER_CODE: '/reset-password/enter-code',
}));

describe('ResetPasswordClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = jest.fn();
	});

	it('renders email input and submit button', () => {
		render(
			<Provider store={store}>
				<ResetPasswordClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /envoyer le code/i })).toBeInTheDocument();
	});

	it('shows error when request fails', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

		render(
			<Provider store={store}>
				<ResetPasswordClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'unknown@test.com' } });
			fireEvent.click(screen.getByRole('button', { name: /envoyer le code/i }));
		});

		expect(await screen.findByText(/aucun compte trouvé/i)).toBeInTheDocument();
	});

	it('redirects to enter-code on success', async () => {
		(global.fetch as jest.Mock)
			.mockResolvedValueOnce({ ok: true })
			.mockResolvedValueOnce({ ok: true });

		render(
			<Provider store={store}>
				<ResetPasswordClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
			fireEvent.click(screen.getByRole('button', { name: /envoyer le code/i }));
		});

		expect(mockPush).toHaveBeenCalledWith('/reset-password/enter-code');
	});
});
