'use client';

import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { useToast } from '@/utils/hooks';
import { useEditPasswordMutation } from '@/store/services/account';
import { setFormikAutoErrors } from '@/utils/helpers';
import { changePasswordSchema } from '@/utils/formValidationSchemas';
import { textInputTheme } from '@/utils/themes';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import Styles from '@/styles/dashboard/settings/settings.module.sass';

interface PasswordFormValues {
	old_password: string;
	new_password: string;
	new_password2: string;
	globalError: string;
}

const PasswordClient = () => {
	const { onSuccess, onError } = useToast();
	const [editPassword, { isLoading, error: apiError }] = useEditPasswordMutation();

	const formik = useFormik<PasswordFormValues>({
		initialValues: {
			old_password: '',
			new_password: '',
			new_password2: '',
			globalError: '',
		},
		validationSchema: toFormikValidationSchema(changePasswordSchema),
		onSubmit: async (data, { setFieldError, resetForm }) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { globalError, ...payload } = data;
			try {
				await editPassword({ data: payload }).unwrap();
				onSuccess('Mot de passe mis à jour.');
				resetForm();
			} catch (e) {
				onError('Erreur lors du changement de mot de passe.');
				setFormikAutoErrors({ e, setFieldError });
			}
		},
	});

	return (
		<Stack className={Styles.main as string} spacing={3}>
			<Typography variant="h5" fontWeight={700}>
				Changer le mot de passe
			</Typography>

			{formik.errors.globalError && <ApiAlert errorDetails={{ error: [formik.errors.globalError] }} />}
			{!!apiError && <ApiAlert errorDetails={{ error: ['Erreur lors du changement de mot de passe.'] }} />}

			<form onSubmit={formik.handleSubmit}>
				<Stack spacing={2.5} sx={{ maxWidth: 480 }}>
					<CustomTextInput
						id="old_password"
						type="password"
						label="Mot de passe actuel"
						value={formik.values.old_password}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.old_password && Boolean(formik.errors.old_password)}
						helperText={formik.touched.old_password ? formik.errors.old_password : ''}
						fullWidth
						theme={textInputTheme()}
					/>
					<CustomTextInput
						id="new_password"
						type="password"
						label="Nouveau mot de passe"
						value={formik.values.new_password}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.new_password && Boolean(formik.errors.new_password)}
						helperText={formik.touched.new_password ? formik.errors.new_password : ''}
						fullWidth
						theme={textInputTheme()}
					/>
					<CustomTextInput
						id="new_password2"
						type="password"
						label="Confirmer le mot de passe"
						value={formik.values.new_password2}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.new_password2 && Boolean(formik.errors.new_password2)}
						helperText={formik.touched.new_password2 ? formik.errors.new_password2 : ''}
						fullWidth
						theme={textInputTheme()}
					/>
					<Stack direction="row" justifyContent="center">
						<PrimaryLoadingButton
							buttonText="Mettre à jour"
							type="submit"
							loading={isLoading}
							active={!isLoading}
						/>
					</Stack>
				</Stack>
			</form>
		</Stack>
	);
};

export default PasswordClient;
