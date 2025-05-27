/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import ClayForm from '@clayui/form';
import ClayModal, {useModal} from '@clayui/modal';
import {API} from '@liferay/object-js-components-web';
import {openToast} from 'frontend-js-components-web';
import React, {useState} from 'react';

import {Error, handleErrors} from '../utils/errors';
import {SeparatorContainer} from './ObjectDetails/SeparatorContainer';

interface ModalEditObjectDefinitionExternalReferenceCodeProps {
	handleOnClose: () => void;
	setValues: (values: Partial<ObjectDefinition>) => void;
	values: Partial<ObjectDefinition>;
}

export function ModalEditObjectDefinitionExternalReferenceCode({
	handleOnClose,
	setValues,
	values,
}: ModalEditObjectDefinitionExternalReferenceCodeProps) {
	const [errors, setErrors] = useState<Error>({});
	const {observer, onClose} = useModal({
		onClose: () => {
			handleOnClose();
		},
	});

	const onSubmit = async () => {
		const objectDefinition = values;

		const saveResponse =
			await API.putObjectDefinitionByExternalReferenceCode(
				objectDefinition
			);

		if (!saveResponse.ok) {
			const {detail, title} = (await saveResponse.json()) as Error;

			handleErrors({detail, title}, setErrors);

			return;
		}

		onClose();

		openToast({
			message: Liferay.Language.get('the-object-was-saved-successfully'),
			type: 'success',
		});
	};

	return (
		<ClayModal center observer={observer}>
			<ClayForm>
				<ClayModal.Header>
					{Liferay.Util.sub(
						Liferay.Language.get('edit-x'),
						Liferay.Language.get('entry-url-separator')
					)}
				</ClayModal.Header>

				<ClayModal.Body>
					<SeparatorContainer
						errors={errors}
						setValues={setValues}
						values={values}
					></SeparatorContainer>
				</ClayModal.Body>

				<ClayModal.Footer
					last={
						<ClayButton.Group key={1} spaced>
							<ClayButton
								displayType="secondary"
								onClick={onClose}
							>
								{Liferay.Language.get('cancel')}
							</ClayButton>

							<ClayButton
								displayType="primary"
								onClick={onSubmit}
								type="submit"
							>
								{Liferay.Language.get('save')}
							</ClayButton>
						</ClayButton.Group>
					}
				/>
			</ClayForm>
		</ClayModal>
	);
}
