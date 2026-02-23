import { redirect } from 'next/navigation';
import { CONTRACTS_LIST } from '@/utils/routes';

const DashboardPage = () => {
	redirect(CONTRACTS_LIST);
};

export default DashboardPage;
