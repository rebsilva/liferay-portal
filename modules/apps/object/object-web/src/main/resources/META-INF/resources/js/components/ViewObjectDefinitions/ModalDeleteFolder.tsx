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

import {ClayModalProvider, useModal} from '@clayui/modal';
import {sub} from 'frontend-js-web';
import React from 'react';

import DangerModal from '../DangerModal';
import {deleteFolder} from './objectDefinitionUtil';

interface ModalDeleteFolderProps {
	folder: Folder;
	handleOnClose: () => void;
}

export function ModalDeleteFolder({
	folder,
	handleOnClose,
}: ModalDeleteFolderProps) {
	const {observer, onClose} = useModal({
		onClose: () => {
			handleOnClose();
		},
	});

	const folderEntriesCount = 0;

	return (
		<ClayModalProvider>
			<DangerModal
				errorMessage={sub(
					Liferay.Language.get('input-does-not-match-x'),
					`${folder.name}`
				)}
				observer={observer}
				onClose={onClose}
				onDelete={async () => {
					await deleteFolder(folder?.id, folder?.name);

					setTimeout(() => window.location.reload(), 1500);
					onClose();
				}}
				placeholder={Liferay.Language.get('confirm-folder-name')}
				title={Liferay.Language.get('delete-objects-folder')}
				token={folder.name}
			>
				<p>
					{Liferay.Language.get(
						'deleting-an-objects-folder-will-move-its-object-definitions'
					)}
				</p>

				<p
					dangerouslySetInnerHTML={{
						__html: sub(
							Liferay.Language.get('x-has-x-object-definitions'),
							`<strong>${folder.name}</strong>`,
							`${folderEntriesCount}`
						),
					}}
				/>

				<p>
					{Liferay.Language.get(
						'before-deleting-this-objects-folder-you-may-want-to-back-up-its-entries-to-prevent-data-loss'
					)}
				</p>

				<p
					dangerouslySetInnerHTML={{
						__html: sub(
							Liferay.Language.get('please-enter-x-to-confirm'),
							`<strong>${folder.name}</strong>`
						),
					}}
				/>
			</DangerModal>
		</ClayModalProvider>
	);
}
