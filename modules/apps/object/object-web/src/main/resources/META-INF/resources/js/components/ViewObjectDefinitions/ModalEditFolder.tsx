/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import ClayForm from '@clayui/form';
import ClayModal, {ClayModalProvider, useModal} from '@clayui/modal';
import {
	API,
	FormError,
	Input,
	InputLocalized,
	REQUIRED_MSG,
	openToast,
	useForm,
} from '@liferay/object-js-components-web';
import React, {useState} from 'react';

import {defaultLanguageId} from '../../utils/constants';

interface ModalAddFolderProps {
	externalReferenceCode: string;
	handleOnClose: () => void;
	initialLabel: LocalizedValue<string>;
	name: string;
}

type TInitialValues = {
	externalReferenceCode: string;
	label: LocalizedValue<string>;
	name: string;
};

export function ModalEditFolder({
	externalReferenceCode,
	handleOnClose,
	initialLabel,
	name,
}: ModalAddFolderProps) {
	const [error, setError] = useState<string>('');

	const [selectedLocale, setSelectedLocale] = useState<
		Liferay.Language.Locale
	>(defaultLanguageId);

	const {observer, onClose} = useModal({
		onClose: () => handleOnClose(),
	});

	const initialValues: TInitialValues = {
		externalReferenceCode,
		label: initialLabel,
		name,
	};

	const onSubmit = async (values: TInitialValues) => {
		const folder: Partial<Folder> = values;

		try {

			// TODO: change this when the correct API is created on BE

			// await API.save(folder, 'PUT');

			// onClose();

			openToast({
				message: Liferay.Language.get(
					'the-object-was-saved-successfully'
				),
				type: 'success',
			});

			setTimeout(() => window.location.reload(), 1000);
		}
		catch (error) {
			setError((error as Error).message);
		}
	};

	const validate = (values: TInitialValues) => {
		const errors: FormError<TInitialValues> = {};

		if (!values.label) {
			errors.label = REQUIRED_MSG;
		}
		if (!(values.name ?? values.label)) {
			errors.name = REQUIRED_MSG;
		}

		if (!values.externalReferenceCode) {
			errors.externalReferenceCode = REQUIRED_MSG;
		}

		return errors;
	};

	const {errors, handleChange, handleSubmit, setValues, values} = useForm({
		initialValues,
		onSubmit,
		validate,
	});

	return (
		<ClayModalProvider>
			<ClayModal observer={observer}>
				<ClayForm onSubmit={handleSubmit}>
					<ClayModal.Header>
						{Liferay.Language.get('edit-label-and-erc')}
					</ClayModal.Header>

					<ClayModal.Body>
						{error && (
							<ClayAlert displayType="danger">{error}</ClayAlert>
						)}

						<InputLocalized
							error={errors.label}
							label={Liferay.Language.get('label')}
							onChange={(label) => setValues({label})}
							onSelectedLocaleChange={setSelectedLocale}
							required
							selectedLocale={selectedLocale}
							translations={
								values.label as LocalizedValue<string>
							}
						/>

						<Input
							disabled
							id="folderName"
							label={Liferay.Language.get('name')}
							name="name"
							required
							value={values.name}
						/>

						<Input
							error={errors.externalReferenceCode}
							feedbackMessage={Liferay.Language.get(
								'unique-key-for-referencing-the-object-definition'
							)}
							id="externalReferenceCode"
							label={Liferay.Language.get(
								'external-reference-code'
							)}
							name="externalReferenceCode"
							onChange={handleChange}
							required
							value={values.externalReferenceCode}
						/>
					</ClayModal.Body>

					<ClayModal.Footer
						last={
							<ClayButton.Group key={1} spaced>
								<ClayButton
									displayType="secondary"
									onClick={() => onClose()}
								>
									{Liferay.Language.get('cancel')}
								</ClayButton>

								<ClayButton displayType="primary" type="submit">
									{Liferay.Language.get('save')}
								</ClayButton>
							</ClayButton.Group>
						}
					/>
				</ClayForm>
			</ClayModal>
		</ClayModalProvider>
	);
}
