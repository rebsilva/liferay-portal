/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Text} from '@clayui/core';
import {ClayCheckbox} from '@clayui/form';
import React from 'react';

import './AllowFriendlyURLContainer.scss';

interface AllowFriendlyURLContainerProps {
	onSubmit?: (editedObjectDefinition?: Partial<ObjectDefinition>) => void;
	setValues: (values: Partial<ObjectDefinition>) => void;
	values: Partial<ObjectDefinition>;
}

export function AllowFriendlyURLContainer({
	onSubmit,
	setValues,
	values,
}: AllowFriendlyURLContainerProps) {
	return (
		<>
			<ClayCheckbox
				checked={!!values.enableFriendlyURLCustomization}
				label={Liferay.Language.get(
					"allow-overriding-an-entry's-friendly-url"
				)}
				onBlur={(event) => {
					event.stopPropagation();

					if (onSubmit) {
						onSubmit();
					}
				}}
				onChange={({target: {checked}}) => {
					setValues({
						enableFriendlyURLCustomization: checked,
					});
				}}
			/>

			<div className="c-mb-sm-4 lfr-objects__seo-container-help-text">
				<Text color="secondary" size={3}>
					{Liferay.Language.get(
						"when-enabled,-users-can-override-an-entry's-friendly-url"
					)}
				</Text>
			</div>
		</>
	);
}
