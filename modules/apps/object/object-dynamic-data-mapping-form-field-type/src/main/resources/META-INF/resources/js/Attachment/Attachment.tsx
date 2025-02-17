/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ReactFieldBase as FieldBase} from 'dynamic-data-mapping-form-field-type';
import {LocalizedValue} from 'dynamic-data-mapping-form-field-type/src/main/resources/META-INF/resources/types';
import {
	AvailableLocale,
	EditingLocale,
} from 'dynamic-data-mapping-form-field-type/src/main/resources/META-INF/resources/util/localizable/LocalesDropdown';
import React, {useState} from 'react';

import AttachmentBase, {
	AttachmentBaseProps,
	AttachmentFile,
} from './AttachmentBase';
import AttachmentLocalizedObjectField from './AttachmentLocalizedObjectField';

export interface AttachmentProps
	extends AttachmentBaseProps<string | LocalizedValue<string>> {
	fileEntryProperties: AttachmentFile | LocalizedValue<AttachmentFile>;
	localizedObjectField: boolean;
	availableLocales: AvailableLocale[];
	defaultLocale: EditingLocale;
	fieldName: string;
}

export default function Attachment({
	fileEntryProperties,
	localizedObjectField,
	onChange,
	readOnly,
	tip,
	...otherProps
}: AttachmentProps) {
	const [error, setError] = useState({});
	const [attachment, setAttachment] = useState<AttachmentFile | null>(
		fileEntryProperties as AttachmentFile
	);

	const isLocalizedObjectField: boolean =
		Liferay.FeatureFlags['LPD-32050'] && !!localizedObjectField;

	const handleAttachmentChange = (
		attachmentValue: AttachmentFile,
		fileId: string
	) => {
		setAttachment(attachmentValue);

		onChange({target: {value: fileId}});
	};

	const handleDelete = () => {
		setAttachment(null);

		onChange({target: {value: ''}}); // TODO: fix backend to support null
	};

	return (
		<FieldBase
			readOnly={readOnly}
			tip={!readOnly ? tip : ''}
			{...otherProps}
			{...error}
		>
			{isLocalizedObjectField ? (
				<AttachmentLocalizedObjectField
					{...otherProps}
					error={error}
					fileEntryProperties={
						fileEntryProperties as LocalizedValue<AttachmentFile>
					}
					onChange={onChange}
					readOnly={readOnly}
					setError={setError}
					tip={tip}
				/>
			) : (
				<AttachmentBase
					{...otherProps}
					attachment={attachment}
					error={error}
					handleDelete={handleDelete}
					onChange={handleAttachmentChange}
					readOnly={readOnly}
					setError={setError}
					tip={tip}
				/>
			)}
		</FieldBase>
	);
}
