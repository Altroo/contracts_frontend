import {redirect} from 'next/navigation';
import type {Metadata} from 'next';
import {auth} from '@/auth';
import {AUTH_LOGIN} from '@/utils/routes';
import ContractFormClient from '@/components/pages/contracts/contract-form';
import {getServerTranslations} from '@/utils/serverTranslations';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getServerTranslations();
  return {
    title: t.metadata.newContractTitle,
    description: t.metadata.newContractDescription,
  };
};

const ContractAddPage = async () => {
  const session = await auth();

  if (!session) {
    redirect(AUTH_LOGIN);
  }

  return <ContractFormClient session={session}/>;
};

export default ContractAddPage;
