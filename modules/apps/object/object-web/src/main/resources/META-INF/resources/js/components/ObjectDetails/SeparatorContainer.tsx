/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Text} from '@clayui/core';
import {SeparatorFields} from '@liferay/friendly-url-web';
import {FormError} from '@liferay/object-js-components-web';
import React from 'react';

interface SeparatorContainerProps {
	errors: FormError<ObjectDefinition>;
	onSubmit?: (editedObjectDefinition?: Partial<ObjectDefinition>) => void; // para model builder
	setValues: (values: Partial<ObjectDefinition>) => void;
	values: Partial<ObjectDefinition>;
}

const SEPARATOR_TEXT = {
	helpText: Liferay.Language.get(
		'please-note-that-modifying-this-value-could-impact-existing-urls-and-seo'
	),
	label: Liferay.Language.get('object-entry-url-separator'),
	url: 'http://www.liferay.com',
};

export function SeparatorContainer({
	errors,
	onSubmit,
	setValues,
	values,
}: SeparatorContainerProps) {
	const {helpText, label, url} = SEPARATOR_TEXT;

	const handleChange = (value: string) => {
		setValues({friendlyURLSeparator: value});
	};

	return (
		<>
			<SeparatorFields
				errors={{fields: errors}}
				fields={[
					{
						defaultValue: values.name as string,
						label,
						name: 'friendlyURLSeparator',
						value: values.name as string,

						// value: values.friendlyURLSeparator as string,

					},
				]}

				// handleChange={handleChange}

				hideReset={true}
				url={url}
			/>
			<div className="c-mb-sm-4">
				<Text color="secondary" size={3}>
					{helpText}
				</Text>
			</div>
		</>
	);
}
