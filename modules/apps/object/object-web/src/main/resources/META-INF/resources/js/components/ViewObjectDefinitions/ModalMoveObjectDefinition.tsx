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

import ClayButton from '@clayui/button';
import ClayEmptyState from '@clayui/empty-state';
import ClayIcon from '@clayui/icon';
import ClayList from '@clayui/list';
import ClayModal, {ClayModalProvider, useModal} from '@clayui/modal';
import {
	ManagementToolbarSearch,
	filterArrayByQuery,
	getLocalizableLabel,
} from '@liferay/object-js-components-web';
import {ManagementToolbar} from 'frontend-js-components-web';
import React, {useMemo, useState} from 'react';

import {defaultLanguageId} from '../../utils/constants';

import './ModalMoveObjectDefinition.scss';

interface ModalMoveObjectDefinitionProps {
	folderList: Folder[];
	handleOnClose: () => void;
	objectDefinition?: ObjectDefinition;
}

export function ModalMoveObjectDefinition({
	folderList,
	handleOnClose,
	objectDefinition,
}: ModalMoveObjectDefinitionProps) {
	const [query, setQuery] = useState('');
	const [selectedFolderERC, setSelectedFolderERC] = useState<string>('');

	const {observer, onClose} = useModal({
		onClose: () => {
			handleOnClose();
		},
	});

	const modalItems = useMemo(() => {
		const filteredItems = filterArrayByQuery({
			array: folderList,
			query,
			str: 'label',
		});

		return query ? filteredItems : folderList;
	}, [query, folderList]);

	return (
		<ClayModalProvider>
			<ClayModal observer={observer}>
				<ClayModal.Header>
					{`${Liferay.Language.get('move')} "${getLocalizableLabel(
						defaultLanguageId,
						objectDefinition?.label
					)}"`}
				</ClayModal.Header>

				<ClayModal.Body>
					<ManagementToolbar.Container className="lfr-object__object-web-view-modal-move-object-definition-toolbar">
						<ManagementToolbar.ItemList expand>
							<ManagementToolbarSearch
								query={query}
								setQuery={setQuery}
							/>
						</ManagementToolbar.ItemList>
					</ManagementToolbar.Container>

					{!modalItems.length && query ? (
						<div className="lfr-object__object-web-view-modal-move-object-definition-empty-state">
							<ClayEmptyState
								description={Liferay.Language.get(
									'sorry,-no-results-were-found'
								)}
								title={Liferay.Language.get('no-results-found')}
							/>
						</div>
					) : (
						<ClayList className="lfr-object__object-web-view-modal-move-object-definition-list">
							{modalItems.map(
								({externalReferenceCode, label, name}) => (
									<ClayList.Item
										action
										active={
											selectedFolderERC ===
											externalReferenceCode
										}
										className="lfr-object__object-web-view-modal-move-object-definition-list-item"
										flex
										key={name}
										onClick={() => {
											setSelectedFolderERC(
												externalReferenceCode
											);

											// console.log(externalReferenceCode);

										}}
									>
										<div>
											<ClayIcon symbol="diagram" />

											<span className="lfr-object__object-web-view-modal-move-object-definition-list-item-label">
												{getLocalizableLabel(
													defaultLanguageId,
													label,
													name
												)}
											</span>
										</div>
									</ClayList.Item>
								)
							)}
						</ClayList>
					)}
				</ClayModal.Body>

				<ClayModal.Footer
					last={
						<ClayButton.Group key={1} spaced>
							<ClayButton
								displayType="secondary"
								onClick={() => onClose()}
							>
								{Liferay.Language.get('cancel')}
							</ClayButton>

							<ClayButton
								displayType="primary"
								onClick={() => {

									// do logic for moving the folder

									setTimeout(
										() => window.location.reload(),
										1500
									);
									onClose();
								}}
								type="submit"
							>
								{Liferay.Language.get('move')}
							</ClayButton>
						</ClayButton.Group>
					}
				/>
			</ClayModal>
		</ClayModalProvider>
	);
}
