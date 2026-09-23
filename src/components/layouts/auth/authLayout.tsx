'use client';

import {useState} from 'react';
import Styles from './authLayout.module.sass';
import {Box, Stack} from '@mui/material';
import Image from 'next/image';
import Logo from '../../../../public/assets/images/contrats-logo.png';
import {useLanguage} from '@/utils/hooks';
import {authIllustrations} from '@/utils/rawData';
import type {AuthIllustration, AuthLayoutProps} from '@/types/authTypes';

const AuthLayout = ({ref, children}: AuthLayoutProps) => {
  const {t} = useLanguage();
  const [authIlluRandom] = useState<AuthIllustration>(() =>
    authIllustrations[Math.floor(Math.random() * authIllustrations.length)],
  );

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
        >
          <Image src={Logo} alt={t.common.appLogo} width="0" height="0" sizes="100vw" className={Styles.logo}/>
        </Box>
        {/* Right side */}
        <Box className={Styles.rightBox}>
          {/* Children content */}
          {children}
        </Box>
      </Stack>
    </main>
  );
};
AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
