/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayForm from '@clayui/form';
import {FormError} from '@liferay/object-js-components-web';
import React from 'react';

import {AllowFriendlyURLContainer} from './AllowFriendlyURLContainer';
import {SeparatorContainer} from './SeparatorContainer';

interface SeoContainerProps {
	errors: FormError<ObjectDefinition>;
	onSubmit?: (editedObjectDefinition?: Partial<ObjectDefinition>) => void;
	setValues: (values: Partial<ObjectDefinition>) => void;
	values: Partial<ObjectDefinition>;
}

export function SeoContainer({
	errors,
	onSubmit,
	setValues,
	values,
}: SeoContainerProps) {
	console.log(values);
	return (
		<ClayForm.Group>
			<SeparatorContainer
				errors={errors}
				setValues={setValues}
				values={values}
			/>

			<AllowFriendlyURLContainer
				onSubmit={onSubmit}
				setValues={setValues}
				values={values}
			/>
		</ClayForm.Group>
	);
}
