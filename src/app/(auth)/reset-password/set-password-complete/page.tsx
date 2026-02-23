import { type Metadata } from 'next';
import SetPasswordCompleteClient from '@/components/pages/auth/reset-password/setPasswordComplete';

export const metadata: Metadata = {
	title: 'Mot de passe modifié',
};

const SetPasswordCompletePage = () => <SetPasswordCompleteClient />;

export default SetPasswordCompletePage;
