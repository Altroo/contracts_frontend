'use client';

import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { useAppSelector, useToast } from '@/utils/hooks';
import { getProfilState } from '@/store/selectors';
import { useEditProfilMutation } from '@/store/services/account';
import { useAppDispatch } from '@/utils/hooks';
import { accountEditProfilAction } from '@/store/actions/accountActions';
import { setFormikAutoErrors } from '@/utils/helpers';
import { profilSchema } from '@/utils/formValidationSchemas';
import { textInputTheme, customDropdownTheme } from '@/utils/themes';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import CustomDropDownSelect from '@/components/formikElements/customDropDownSelect/customDropDownSelect';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import { genderItemsList } from '@/utils/rawData';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { SessionProps } from '@/types/_initTypes';
import Styles from '@/styles/dashboard/settings/settings.module.sass';

interface ProfilFormValues {
	first_name: string;
	last_name: string;
	gender: string;
	globalError: string;
}

const EditProfileClient: React.FC<SessionProps> = () => {
	const dispatch = useAppDispatch();
	const profil = useAppSelector(getProfilState);
	const { onSuccess, onError } = useToast();
	const [editProfil, { isLoading, error: apiError }] = useEditProfilMutation();

	const formik = useFormik<ProfilFormValues>({
		initialValues: {
			first_name: profil?.first_name ?? '',
			last_name: profil?.last_name ?? '',
			gender: profil?.gender ?? '',
			globalError: '',
		},
		enableReinitialize: true,
		validationSchema: toFormikValidationSchema(profilSchema),
		onSubmit: async (data, { setFieldError }) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { globalError, ...payload } = data;
			try {
				const result = await editProfil({ data: payload }).unwrap();
				dispatch(accountEditProfilAction(result));
				onSuccess('Profil mis à jour.');
			} catch (e) {
				onError('Erreur lors de la mise à jour.');
				setFormikAutoErrors({ e, setFieldError });
			}
		},
	});

	return (
		<Stack className={Styles.main as string} spacing={3}>
			<Typography variant="h5" fontWeight={700}>
				Mon Profil
			</Typography>

			{formik.errors.globalError && <ApiAlert errorDetails={{ error: [formik.errors.globalError] }} />}
			{!!apiError && <ApiAlert errorDetails={{ error: ['Erreur lors de la mise à jour du profil.'] }} />}

			<form onSubmit={formik.handleSubmit}>
				<Stack spacing={2.5} sx={{ maxWidth: 600 }}>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<CustomTextInput
							id="first_name"
							type="text"
							label="Prénom"
							value={formik.values.first_name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.first_name && Boolean(formik.errors.first_name)}
							helperText={formik.touched.first_name ? formik.errors.first_name : ''}
							fullWidth
							theme={textInputTheme()}
						/>
						<CustomTextInput
							id="last_name"
							type="text"
							label="Nom"
							value={formik.values.last_name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.last_name && Boolean(formik.errors.last_name)}
							helperText={formik.touched.last_name ? formik.errors.last_name : ''}
							fullWidth
							theme={textInputTheme()}
						/>
					</Stack>
					<CustomDropDownSelect
						id="gender"
						label="Genre"
						items={genderItemsList.map((g) => g.value)}
						value={formik.values.gender === 'H' ? 'Homme' : formik.values.gender === 'F' ? 'Femme' : formik.values.gender}
						onChange={(e: SelectChangeEvent) => {
							const selected = genderItemsList.find((g) => g.value === e.target.value);
							formik.setFieldValue('gender', selected?.code ?? e.target.value);
						}}
						theme={customDropdownTheme()}
					/>
					<Stack direction="row" justifyContent="center">
						<PrimaryLoadingButton
							buttonText="Enregistrer"
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

export default EditProfileClient;
