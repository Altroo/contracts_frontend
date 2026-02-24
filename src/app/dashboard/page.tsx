import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AUTH_LOGIN, CONTRACTS_LIST } from '@/utils/routes';

const DashboardPage = async () => {
	const session = await auth();

	if (!session) {
		redirect(AUTH_LOGIN);
	}

	redirect(CONTRACTS_LIST);
};

export default DashboardPage;
