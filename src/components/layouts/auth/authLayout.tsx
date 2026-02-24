'use client';

import React, { ForwardedRef, forwardRef, useState } from 'react';
import Styles from './authLayout.module.sass';
import { Box, Stack } from '@mui/material';
import ContractSVG from '../../../../public/assets/images/auth_illu/contract.svg';
import HandshakeSVG from '../../../../public/assets/images/auth_illu/handshake.svg';
import BlueprintSVG from '../../../../public/assets/images/auth_illu/blueprint.svg';
import SignatureSVG from '../../../../public/assets/images/auth_illu/signature.svg';

type Props = {
	children?: React.ReactNode;
};

export type svgImageType = {
	src: string;
	height: number;
	width: number;
};

const AuthLayout = forwardRef<HTMLAnchorElement, Props>((props: Props, ref: ForwardedRef<HTMLAnchorElement>) => {
	const [authIlluRandom] = useState<{ image: svgImageType; color: string }>(() => {
		const availableAuthBgImages: Array<{ image: svgImageType; color: string }> = [
			{
				image: ContractSVG.src,
				color: '#E8F5E9',
			},
			{
				image: HandshakeSVG.src,
				color: '#FFF3E0',
			},
			{
				image: BlueprintSVG.src,
				color: '#E3F2FD',
			},
			{
				image: SignatureSVG.src,
				color: '#F3E5F5',
			},
		];
		return availableAuthBgImages[Math.floor(Math.random() * availableAuthBgImages.length)];
	});

	return (
		<main className={Styles.main} ref={ref}>
			<Stack direction="row">
				{/* Left side */}
				<Box
					className={Styles.leftBox}
					sx={{
						background: `url(${authIlluRandom ? authIlluRandom.image : ''}) bottom left no-repeat scroll ${
							authIlluRandom && authIlluRandom.color
						}`,
						msFilter: `progid:DXImageTransform.Microsoft.AlphaImageLoader(src='${
							authIlluRandom ? authIlluRandom.image : ''
						}', sizingMethod='scale')`,
						backgroundSize: 'contain',
					}}
				></Box>
				{/* Right side */}
				<Box className={Styles.rightBox}>
					{/* Children content */}
					{props.children}
				</Box>
			</Stack>
		</main>
	);
});
AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
