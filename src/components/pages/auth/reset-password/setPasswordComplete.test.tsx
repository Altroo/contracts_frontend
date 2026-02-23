import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import SetPasswordCompleteClient from './setPasswordComplete';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock('@/utils/routes', () => ({
	AUTH_LOGIN: '/login',
}));

describe('SetPasswordCompleteClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders success message', () => {
		render(
			<Provider store={store}>
				<SetPasswordCompleteClient />
			</Provider>,
		);
		expect(screen.getByText(/mot de passe modifié/i)).toBeInTheDocument();
	});

	it('has a login button that navigates to login', () => {
		render(
			<Provider store={store}>
				<SetPasswordCompleteClient />
			</Provider>,
		);
		const btn = screen.getByRole('button', { name: /se connecter/i });
		expect(btn).toBeInTheDocument();
		fireEvent.click(btn);
		expect(mockPush).toHaveBeenCalledWith('/login');
	});
});
