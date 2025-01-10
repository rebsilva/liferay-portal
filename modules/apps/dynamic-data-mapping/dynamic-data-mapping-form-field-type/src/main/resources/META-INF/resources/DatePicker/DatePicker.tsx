/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useState} from 'react';

import FieldBase from '../FieldBase/ReactFieldBase.es';
import DatePickerBase, {DatePickerBaseProps} from './DatePickerBase';
interface DatePickerProps extends DatePickerBaseProps {
	localizedObjectField: boolean;
}

export default function DatePicker({
	displayErrors,
	errorMessage,
	localizedObjectField,
	valid,
	...otherProps
}: DatePickerProps) {
	const [validField, setValidField] = useState({
		displayErrors,
		errorMessage,
		valid,
	});

	const Component =
		Liferay.FeatureFlags['LPD-32050'] && localizedObjectField
			? DatePickerBase
			: DatePickerBase;

	return (
		<FieldBase
			{...otherProps}
			displayErrors={validField.displayErrors}
			errorMessage={validField.errorMessage}
			valid={validField.valid}
		>
			<Component
				{...otherProps}
				displayErrors={displayErrors}
				errorMessage={errorMessage}
				setValidField={setValidField}
				valid={valid}
			/>
		</FieldBase>
	);
}
