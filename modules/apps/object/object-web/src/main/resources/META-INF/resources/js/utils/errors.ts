/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {openToast} from '@liferay/object-js-components-web';

export interface ErrorMessage {
	fieldName: keyof ObjectAction;
	message?: string;
	messages?: ErrorMessage[];
}

export interface Error {
	[key: string]: string | Error;
}

export function parseError(details: ErrorMessage[], errors: Error) {
	details.forEach(({fieldName, message, messages}) => {
		if (message) {
			errors[fieldName] = message;
		}
		else {
			errors[fieldName] = {};
			parseError(messages as ErrorMessage[], errors[fieldName] as Error);
		}
	});
}

export function getErrorMessage(errors: Error) {
	const errorMessages = new Set<string>();
	Object.values(errors).forEach((value) => {
		if (typeof value === 'string') {
			if (!errorMessages.has(value)) {
				errorMessages.add(value);
			}
		}
		else {
			getErrorMessage(value);
		}
	});

	return errorMessages;
}

export function handleErrors(
	{detail, title}: Error,
	setErrors: (value: Error) => void
) {
	if (title) {
		openToast({
			message: title as string,
			type: 'danger',
		});
	}
	else if (detail) {
		const details = JSON.parse(detail as string);
		const newErrors: Error = {};

		parseError(details, newErrors);

		setErrors(newErrors);

		if (newErrors) {
			const errorMessages = getErrorMessage(newErrors);
			errorMessages.forEach((message) => {
				openToast({
					message,
					type: 'danger',
				});
			});
		}
	}
}
