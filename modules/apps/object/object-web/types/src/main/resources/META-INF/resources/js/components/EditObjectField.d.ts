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

/// <reference types="react" />

import './EditObjectField.scss';
export default function EditObjectField({
	allowMaxLength,
	charBlacklist,
	charLastBlacklist,
	isApproved,
	namesBlacklist,
	objectField: initialValues,
	objectFieldTypes,
	objectName,
	readOnly,
	showDocumentsAndMediaOption,
}: IProps): JSX.Element;
interface IProps {
	allowMaxLength?: boolean;
	charBlacklist: string[];
	charLastBlacklist: string[];
	isApproved: boolean;
	namesBlacklist: string[];
	objectField: ObjectField;
	objectFieldTypes: ObjectFieldType[];
	objectName: string;
	readOnly: boolean;
	showDocumentsAndMediaOption: boolean;
}
export {};
