'use client';

import React, { useState } from 'react';
import {
	Card,
	CardContent,
	Divider,
	FormControlLabel,
	Stack,
	Switch,
	Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { setFormikAutoErrors } from '@/utils/helpers';
import { USERS_VIEW } from '@/utils/routes';
import { useRouter } from 'next/navigation';
import { useToast } from '@/utils/hooks';
import { useAddUserMutation, useEditUserMutation, useGetUserQuery } from '@/store/services/account';
import { userSchema } from '@/utils/formValidationSchemas';
import { textInputTheme, customDropdownTheme } from '@/utils/themes';
import CustomTextInput from '@/components/formikElements/customTextInput/customTextInput';
import CustomDropDownSelect from '@/components/formikElements/customDropDownSelect/customDropDownSelect';
import PrimaryLoadingButton from '@/components/htmlElements/buttons/primaryLoadingButton/primaryLoadingButton';
import ApiProgress from '@/components/formikElements/apiLoading/apiProgress/apiProgress';
import ApiAlert from '@/components/formikElements/apiLoading/apiAlert/apiAlert';
import { genderItemsList } from '@/utils/rawData';
import { getAccessTokenFromSession } from '@/store/session';
import { Protected } from '@/components/layouts/protected/protected';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { SessionProps } from '@/types/_initTypes';
import Styles from '@/styles/dashboard/dashboard.module.sass';

interface Props extends SessionProps {
	id?: number;
}

interface UserFormValues {
	first_name: string;
	last_name: string;
	email: string;
	gender: string;
	password1: string;
	password2: string;
	is_staff: boolean;
	can_view: boolean;
	can_print: boolean;
	can_create: boolean;
	can_edit: boolean;
	can_delete: boolean;
	globalError: string;
}

const UsersFormClient = ({ id, session }: Props) => {
	const router = useRouter();
	const { onSuccess, onError } = useToast();
	const isEditMode = id !== undefined;
	const token = getAccessTokenFromSession(session);

	const { data: rawData, isLoading: isDataLoading } = useGetUserQuery({ id: id! }, { skip: !isEditMode || !token });
	const [addUser, { isLoading: isAddLoading, error: addError }] = useAddUserMutation();
	const [editUser, { isLoading: isEditLoading, error: editError }] = useEditUserMutation();

	const apiError = isEditMode ? editError : addError;

	const [isPending, setIsPending] = useState(false);

	const formik = useFormik<UserFormValues>({
		initialValues: {
			first_name: rawData?.first_name ?? '',
			last_name: rawData?.last_name ?? '',
			email: rawData?.email ?? '',
			gender: rawData?.gender ?? '',
			password1: '',
			password2: '',
			is_staff: rawData?.is_staff ?? false,
			can_view: rawData?.can_view ?? false,
			can_print: rawData?.can_print ?? false,
			can_create: rawData?.can_create ?? false,
			can_edit: rawData?.can_edit ?? false,
			can_delete: rawData?.can_delete ?? false,
			globalError: '',
		},
		enableReinitialize: true,
		validationSchema: toFormikValidationSchema(userSchema),
		onSubmit: async (data, { setFieldError }) => {
			setIsPending(true);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { globalError, password2, ...fields } = data;
			const payload = isEditMode
				? { ...fields }
				: { ...fields, password: data.password1 };
			try {
				if (isEditMode) {
					await editUser({ id: id!, data: payload }).unwrap();
					onSuccess('Utilisateur mis à jour avec succès.');
					router.push(USERS_VIEW(id!));
				} else {
					const result = await addUser({ data: payload }).unwrap();
					onSuccess('Utilisateur créé avec succès.');
					router.push(USERS_VIEW(result.id));
				}
			} catch (e) {
				onError(isEditMode ? 'Échec de la mise à jour.' : "Échec de la création de l'utilisateur.");
				setFormikAutoErrors({ e, setFieldError });
			} finally {
				setIsPending(false);
			}
		},
	});

	const isLoading = isAddLoading || isEditLoading || isPending;

	if (isEditMode && isDataLoading) {
		return <ApiProgress backdropColor="#FFFFFF" circularColor="#0274D7" />;
	}

	return (
		<Protected>
		<Stack className={Styles.main as string} spacing={3}>
			<Typography variant="h5" fontWeight={700}>
				{isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
			</Typography>

			{formik.errors.globalError && <ApiAlert errorDetails={{ error: [formik.errors.globalError] }} />}

			{(apiError as Record<string, unknown>) && (
				<ApiAlert
					errorDetails={
						(apiError as { data?: { details?: Record<string, string[]> } })?.data?.details ?? {
							error: ['Une erreur est survenue.'],
						}
					}
				/>
			)}

			{isLoading && <ApiProgress backdropColor="rgba(255,255,255,0.8)" circularColor="#0274D7" />}

			<form onSubmit={formik.handleSubmit}>
				<Stack spacing={3}>
					{/* Informations */}
					<Card elevation={2} sx={{ borderRadius: 2 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
								Informations
							</Typography>
							<Divider sx={{ mb: 3 }} />
							<Stack spacing={2.5}>
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
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomTextInput
										id="email"
										type="email"
										label="Email"
										value={formik.values.email}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										error={formik.touched.email && Boolean(formik.errors.email)}
										helperText={formik.touched.email ? formik.errors.email : ''}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomDropDownSelect
										id="gender"
										label="Genre"
										items={genderItemsList.map((g) => g.value)}
										value={formik.values.gender}
										onChange={(e: SelectChangeEvent) => formik.setFieldValue('gender', e.target.value)}
										theme={customDropdownTheme()}
									/>
								</Stack>
							</Stack>
						</CardContent>
					</Card>

					{/* Mot de passe — only in add mode */}
					{!isEditMode && (
						<Card elevation={2} sx={{ borderRadius: 2 }}>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
									Mot de passe
								</Typography>
								<Divider sx={{ mb: 3 }} />
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<CustomTextInput
										id="password1"
										type="password"
										label="Mot de passe"
										value={formik.values.password1}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										error={formik.touched.password1 && Boolean(formik.errors.password1)}
										helperText={formik.touched.password1 ? formik.errors.password1 : ''}
										fullWidth
										theme={textInputTheme()}
									/>
									<CustomTextInput
										id="password2"
										type="password"
										label="Confirmer le mot de passe"
										value={formik.values.password2}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										error={formik.touched.password2 && Boolean(formik.errors.password2)}
										helperText={formik.touched.password2 ? formik.errors.password2 : ''}
										fullWidth
										theme={textInputTheme()}
									/>
								</Stack>
							</CardContent>
						</Card>
					)}

					{/* Permissions */}
					<Card elevation={2} sx={{ borderRadius: 2 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
								Permissions
							</Typography>
							<Divider sx={{ mb: 3 }} />
							<Stack spacing={1}>
								<FormControlLabel
									control={<Switch checked={formik.values.is_staff} onChange={formik.handleChange} name="is_staff" />}
									label="Administrateur"
								/>
								<FormControlLabel
									control={<Switch checked={formik.values.can_view} onChange={formik.handleChange} name="can_view" />}
									label="Peut voir"
								/>
								<FormControlLabel
									control={<Switch checked={formik.values.can_print} onChange={formik.handleChange} name="can_print" />}
									label="Peut imprimer"
								/>
								<FormControlLabel
									control={<Switch checked={formik.values.can_create} onChange={formik.handleChange} name="can_create" />}
									label="Peut créer"
								/>
								<FormControlLabel
									control={<Switch checked={formik.values.can_edit} onChange={formik.handleChange} name="can_edit" />}
									label="Peut modifier"
								/>
								<FormControlLabel
									control={<Switch checked={formik.values.can_delete} onChange={formik.handleChange} name="can_delete" />}
									label="Peut supprimer"
								/>
							</Stack>
						</CardContent>
					</Card>

					{/* Submit */}
					<Stack direction="row" justifyContent="center" className={Styles.submitButton}>
						<PrimaryLoadingButton
							buttonText={isEditMode ? 'Enregistrer' : "Créer l'utilisateur"}
							type="submit"
							loading={isLoading}
							active={!isLoading}
						/>
					</Stack>
				</Stack>
			</form>
		</Stack>
		</Protected>
	);
};

export default UsersFormClient;
