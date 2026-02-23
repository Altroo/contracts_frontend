import { type Metadata } from 'next';
import EditProfileClient from '@/components/pages/settings/edit-profile';

export const metadata: Metadata = {
	title: 'Mon profil',
};

const EditProfilePage = () => <EditProfileClient />;

export default EditProfilePage;
