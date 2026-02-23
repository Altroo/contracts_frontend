import { type Metadata } from 'next';
import SetPasswordClient from '@/components/pages/auth/reset-password/setPassword';

export const metadata: Metadata = {
	title: 'Nouveau mot de passe',
};

const SetPasswordPage = () => <SetPasswordClient />;

export default SetPasswordPage;
