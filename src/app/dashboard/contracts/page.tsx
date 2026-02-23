import { type Metadata } from 'next';
import ContractsListClient from '@/components/pages/contracts/contracts-list';

export const metadata: Metadata = {
	title: 'Liste des contrats',
};

const ContractsListPage = () => <ContractsListClient />;

export default ContractsListPage;
