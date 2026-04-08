'use client';

import React, { useEffect, useState } from 'react';
import Styles from '@/styles/dashboard/settings/settings.module.sass';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { setFormikAutoErrors } from '@/utils/helpers';
import { textInputTheme } from '@/utils/themes';
import { useFormik } from 'formik';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/store/services/notification';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import NavigationBar from '@/components/layouts/navigationBar/navigationBar';
import { useToast, useLanguage } from '@/utils/hooks';
import { Edit as EditIcon } from '@mui/icons-material';
import type { NotificationPreferenceFormValues } from '@/types/contractNotificationTypes';

const inputTheme = textInputTheme();

const FormikContent: React.FC = () => {
  const { onSuccess, onError } = useToast();
  const { t } = useLanguage();
  const { data: preferences, isLoading: isPreferencesLoading } = useGetNotificationPreferencesQuery();
  const [updatePreferences, { isLoading: isUpdateLoading }] = useUpdateNotificationPreferencesMutation();
  const [isPending, setIsPending] = useState(false);

  const formik = useFormik<NotificationPreferenceFormValues>({
    initialValues: {
      notify_unsigned_contract: preferences?.notify_unsigned_contract ?? true,
      notify_work_start: preferences?.notify_work_start ?? true,
      notify_reserve_deadline: preferences?.notify_reserve_deadline ?? true,
      notify_status_change: preferences?.notify_status_change ?? true,
      unsigned_alert_days: preferences?.unsigned_alert_days ?? 7,
      work_start_alert_days: preferences?.work_start_alert_days ?? 3,
      globalError: '',
    },
    enableReinitialize: true,
    onSubmit: async (values, { setFieldError }) => {
      setIsPending(true);
      try {
        await updatePreferences({
          notify_unsigned_contract: values.notify_unsigned_contract,
          notify_work_start: values.notify_work_start,
          notify_reserve_deadline: values.notify_reserve_deadline,
          notify_status_change: values.notify_status_change,
          unsigned_alert_days: values.unsigned_alert_days,
          work_start_alert_days: values.work_start_alert_days,
        }).unwrap();
        onSuccess(t.settings.notificationUpdateSuccess);
      } catch (e) {
        onError(t.settings.notificationUpdateError);
        setFormikAutoErrors({ e, setFieldError });
      } finally {
        setIsPending(false);
      }
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, []);

  return (
    <Stack direction="column" alignItems="center" spacing={2} className={`${Styles.flexRootStack}`} mt="32px">
      {(isPreferencesLoading || isUpdateLoading || isPending) && (
        <ApiProgress backdropColor="#FFFFFF" circularColor="#0D070B" />
      )}
      <h2 className={Styles.pageTitle}>{t.settings.notificationPreferences}</h2>

      <form className={Styles.form} onSubmit={(e) => e.preventDefault()}>
        <Stack direction="column" justifyContent="center" alignItems="center" spacing={3}>
          <Box sx={{ maxWidth: 365, width: '100%' }}>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notify_unsigned_contract}
                    onChange={(e) => formik.setFieldValue('notify_unsigned_contract', e.target.checked)}
                  />
                }
                label={t.settings.notifyUnsignedContract}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notify_work_start}
                    onChange={(e) => formik.setFieldValue('notify_work_start', e.target.checked)}
                  />
                }
                label={t.settings.notifyWorkStart}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notify_reserve_deadline}
                    onChange={(e) => formik.setFieldValue('notify_reserve_deadline', e.target.checked)}
                  />
                }
                label={t.settings.notifyReserveDeadline}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notify_status_change}
                    onChange={(e) => formik.setFieldValue('notify_status_change', e.target.checked)}
                  />
                }
                label={t.settings.notifyStatusChange}
              />
              <CustomTextInput
                id="unsigned_alert_days"
                label={t.settings.unsignedAlertDays}
                type="number"
                size="small"
                value={String(formik.values.unsigned_alert_days)}
                onChange={(e) => formik.setFieldValue('unsigned_alert_days', Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1, max: 365 } }}
                fullWidth
                theme={inputTheme}
              />
              <CustomTextInput
                id="work_start_alert_days"
                label={t.settings.workStartAlertDays}
                type="number"
                size="small"
                value={String(formik.values.work_start_alert_days)}
                onChange={(e) => formik.setFieldValue('work_start_alert_days', Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1, max: 30 } }}
                fullWidth
                theme={inputTheme}
              />
            </Stack>
          </Box>
          <PrimaryLoadingButton
            buttonText={t.settings.save}
            active={!isPending}
            onClick={formik.handleSubmit}
            cssClass={`${Styles.maxWidth} ${Styles.mobileButton} ${Styles.submitButton}`}
            type="submit"
            startIcon={<EditIcon />}
            loading={isPending}
          />
        </Stack>
      </form>
    </Stack>
  );
};

const NotificationsClient: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();

  return (
    <Stack direction="column" sx={{ position: 'relative' }}>
      <NavigationBar title={t.settings.notificationPreferences}>
        <main className={`${Styles.main} ${Styles.fixMobile}`}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-start',
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <FormikContent />
            </Box>
          </Box>
        </main>
      </NavigationBar>
    </Stack>
  );
};

export default NotificationsClient;
