/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Text} from '@clayui/core';
import {SeparatorFields} from '@liferay/friendly-url-web';
import {FormError} from '@liferay/object-js-components-web';
import React, {useState} from 'react';

import {Error} from '../../utils/errors';

interface SeparatorContainerProps {
	errors: FormError<ObjectDefinition>;
	onSubmit?: (editedObjectDefinition?: Partial<ObjectDefinition>) => void;
	setDisableCheckbox: (value: boolean) => void;
	setErrors?: (errors: Error) => void;
	setValues: (values: Partial<ObjectDefinition>) => void;
	values: Partial<ObjectDefinition>;
}

const LOWERCASE_L_REGEX = /\bl\b/;

const SEPARATOR_TEXT = {
	helpText: Liferay.Language.get(
		'please-note-that-modifying-this-value-could-impact-existing-urls-and-seo'
	),
	label: Liferay.Language.get('object-entry-url-separator'),
	url: 'http://localhost:8080',
};

export function SeparatorContainer({
	errors,
	onSubmit,
	setDisableCheckbox,
	setErrors,
	setValues,
	values,
}: SeparatorContainerProps) {
	const {helpText, label, url} = SEPARATOR_TEXT;

	const handleChange = (value: string) => {
		setValues({friendlyURLSeparator: value});

		if (LOWERCASE_L_REGEX.test(value)) {
			setDisableCheckbox(true);
			setValues({
				enableFriendlyURLCustomization: false, // confirmar isso aqui
			});

			// precisar montar a mensagem de warning aqui
		}
		else {
			setDisableCheckbox(false);
		}
	};

	const handleOnBlur = (
		event: React.FocusEvent<HTMLInputElement, Element>
	) => {
		event.stopPropagation();

		if (setErrors) {
			setErrors({});
		}

		if (onSubmit) {
			onSubmit();
		}
	};

	return (
		<>
			<SeparatorFields
				errors={{fields: errors}}
				fields={[
					{
						defaultValue: values.name as string,
						helpText,
						label,
						name: 'friendlyURLSeparator',
						value: values.friendlyURLSeparator as string, // precisa fazer a validacao se é um l antes de mandar também mesmo que não tenha alteração no input em si
					},
				]}
				handleChange={handleChange}
				handleOnBlur={handleOnBlur}
				hideReset={true}
				url={url}
			/>

			{/* <div className="c-mb-sm-4">
				<Text color="secondary" size={3}>
					{helpText}
				</Text>
			</div> */}
		</>
	);
}
