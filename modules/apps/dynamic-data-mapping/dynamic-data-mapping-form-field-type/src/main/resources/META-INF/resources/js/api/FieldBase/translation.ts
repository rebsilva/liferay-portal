/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Field, getAllFieldsetsFromName} from 'data-engine-js-components-web';

interface Column {
	fields: WebContentField[];
	size: number;
}

interface WebContentField extends Field {
	localizedValueEdited?: any;
	name?: string;
}

export function showField({
	editingLanguageId,
	field,
	filter,
}: {
	editingLanguageId: string;
	field: WebContentField;
	filter: string;
}) {
	return !!(
		field.localizable &&
		((field.localizedValueEdited?.[editingLanguageId] &&
			filter === 'translated') ||
			(!field.localizedValueEdited?.[editingLanguageId] &&
				filter === 'untranslated'))
	);
}

export function getFilteredPage({
	editingLanguageId,
	filter,
	pagesVisitor,
}: {
	editingLanguageId: string;
	filter: string;
	pagesVisitor: any;
}) {
	return pagesVisitor.mapColumns((column: Column) => {
		const visibleFieldsets = new Set();

		const showFilteredFields = (fields: WebContentField[]) => {
			const newFields = [...fields];

			return newFields.map((field: WebContentField) => {
				if (field.nestedFields) {
					const newNestedFields: WebContentField[] =
						showFilteredFields(field.nestedFields);

					const visible = visibleFieldsets.has(field.fieldName);

					return {
						...field,
						disabled: !visible,
						hidden: !visible,
						nestedFields: newNestedFields,
						visible,
					};
				}

				if (showField({editingLanguageId, field, filter})) {
					const parsedName = getAllFieldsetsFromName(field.name);

					if (parsedName) {
						parsedName.forEach((fieldset: string) =>
							visibleFieldsets.add(fieldset)
						);
					}

					return {
						...field,
						disabled: false,
						hidden: false,
						visible: true,
					};
				}
				else {
					return {
						...field,
						disabled: true,
						hidden: true,
						visible: false,
					};
				}
			});
		};

		return {
			...column,
			fields: showFilteredFields(column.fields),
		};
	});
}
