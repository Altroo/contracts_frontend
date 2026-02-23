import { type Metadata } from 'next';
import ContractFormClient from '@/components/pages/contracts/contract-form';

export const metadata: Metadata = {
	title: 'Nouveau contrat',
};

const ContractAddPage = () => <ContractFormClient />;

export default ContractAddPage;
