import React from 'react';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<NavigationBar title="Contrats">
			{children}
		</NavigationBar>
	);
};

export default DashboardLayout;
