import { type Metadata } from 'next';
import EnterCodeClient from '@/components/pages/auth/reset-password/enterCode';

export const metadata: Metadata = {
	title: 'Entrer le code',
};

const EnterCodePage = () => <EnterCodeClient />;

export default EnterCodePage;
