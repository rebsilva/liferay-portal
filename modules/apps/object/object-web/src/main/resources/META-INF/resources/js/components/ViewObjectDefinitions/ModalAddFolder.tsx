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
	REQUIRED_MSG,
	useForm,
} from '@liferay/object-js-components-web';
import React, {useState} from 'react';

import {defaultLanguageId} from '../../utils/constants';
import {normalizeName} from './objectDefinitionUtil';

interface ModalAddFolderProps {
	handleOnClose: () => void;
}

type TInitialValues = {
	label: string;
	name?: string;
};

export function ModalAddFolder({handleOnClose}: ModalAddFolderProps) {
	const [error, setError] = useState<string>('');

	const {observer, onClose} = useModal({
		onClose: () => handleOnClose(),
	});

	const initialValues: TInitialValues = {
		label: '',
		name: undefined,
	};

	const onSubmit = async ({label, name}: TInitialValues) => {
		const folder: Partial<Folder> = {
			label: {
				[defaultLanguageId]: label,
			},
			name: name || normalizeName(label),
		};

		try {
			await API.save(
				'/o/object-admin/v1.0/object-folders',
				folder,
				'POST'
			);

			onClose();
			window.location.reload();
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

		return errors;
	};

	const {errors, handleChange, handleSubmit, values} = useForm({
		initialValues,
		onSubmit,
		validate,
	});

	return (
		<ClayModalProvider>
			<ClayModal observer={observer}>
				<ClayForm onSubmit={handleSubmit}>
					<ClayModal.Header>
						{Liferay.Language.get('new-objects-folder')}
					</ClayModal.Header>

					<ClayModal.Body>
						{error && (
							<ClayAlert displayType="danger">{error}</ClayAlert>
						)}

						<Input
							error={errors.label}
							id="folderLabel"
							label={Liferay.Language.get('label')}
							name="label"
							onChange={handleChange}
							required
							value={values.label}
						/>

						<Input
							error={errors.name}
							id="folderName"
							label={Liferay.Language.get('name')}
							name="name"
							onChange={handleChange}
							required
							value={values.name ?? normalizeName(values.label)}
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
