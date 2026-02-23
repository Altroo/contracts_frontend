import { type Metadata } from 'next';
import PasswordClient from '@/components/pages/settings/password';

export const metadata: Metadata = {
	title: 'Changer le mot de passe',
};

const PasswordPage = () => <PasswordClient />;

export default PasswordPage;
