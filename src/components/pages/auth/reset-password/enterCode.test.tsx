import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import EnterCodeClient from './enterCode';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
}));

jest.mock('@/utils/routes', () => ({
	AUTH_RESET_PASSWORD_SET_PASSWORD: '/reset-password/set-password',
}));

describe('EnterCodeClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = jest.fn();
	});

	it('renders code input and confirm button', () => {
		render(
			<Provider store={store}>
				<EnterCodeClient />
			</Provider>,
		);
		expect(screen.getByLabelText(/code de vérification/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
	});

	it('redirects to set-password on submit', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

		render(
			<Provider store={store}>
				<EnterCodeClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/code de vérification/i), { target: { value: '123456' } });
			fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
		});

		expect(mockPush).toHaveBeenCalledWith('/reset-password/set-password');
	});

	it('shows error on fetch failure', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

		render(
			<Provider store={store}>
				<EnterCodeClient />
			</Provider>,
		);

		await act(async () => {
			fireEvent.change(screen.getByLabelText(/code de vérification/i), { target: { value: '999999' } });
			fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
		});

		expect(await screen.findByText(/une erreur est survenue/i)).toBeInTheDocument();
	});
});
