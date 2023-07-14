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

import {API} from '@liferay/object-js-components-web';
import {sub} from 'frontend-js-web';
import {SetStateAction} from 'react';

import {
	firstLetterUppercase,
	removeAllSpecialCharacters,
} from '../../utils/string';
import {ViewObjectDefinitionsModals} from './ViewObjectDefinitions';

export async function deleteObjectDefinition(
	id: number,
	objectDefinitionName: string
) {
	await API.deleteObjectDefinitions(Number(id)).then(() => {
		Liferay.Util.openToast({
			message: sub(
				Liferay.Language.get('x-was-deleted-successfully'),
				`<strong>${objectDefinitionName}</strong>`
			),
		});
	});
}

export function getFolderActions(
	selectedFolderName: string,
	setShowModal: (value: SetStateAction<ViewObjectDefinitionsModals>) => void
) {
	return selectedFolderName === 'uncategorized'
		? [
				{
					label: Liferay.Language.get('import-object'),
					onClick: () =>
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								importObject: true,
							})
						),
					symbolLeft: 'import',
					value: 'importObject',
				},
		  ]
		: [
				{
					label: Liferay.Language.get('edit-label-and-erc'),
					onClick: () =>
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								editFolder: true,
							})
						),
					symbolLeft: 'pencil',
					value: 'editFolder',
				},
				{
					label: Liferay.Language.get('import-object'),
					onClick: () =>
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								importObject: true,
							})
						),
					symbolLeft: 'import',
					value: 'importObject',
				},
				{
					label: Liferay.Language.get('delete-folder'),
					onClick: () =>
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								deleteFolder: true,
							})
						),
					symbolLeft: 'trash',
					value: 'deleteFolder',
				},
				{
					label: Liferay.Language.get('move'),
					onClick: () =>
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								moveObjectDefinition: true,
							})
						),
					symbolLeft: 'heart',
					value: 'moveObjectDefinition',
				},
				{
					label: Liferay.Language.get('folder-permissions'),
					onClick: () =>

						// fazer a lógica pra abrir o modal de permissões

						{},
					symbolLeft: 'users',
					value: 'folderPermissions',
				},
		  ];
}

export function normalizeName(str: string) {
	const split = str.split(' ');
	const capitalizeFirstLetters = split.map((str: string) =>
		firstLetterUppercase(str)
	);
	const join = capitalizeFirstLetters.join('');

	return removeAllSpecialCharacters(join);
}
