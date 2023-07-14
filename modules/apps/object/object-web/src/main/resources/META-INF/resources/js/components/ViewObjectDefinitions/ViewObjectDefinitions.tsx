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
import {TreeView} from '@clayui/core';
import ClayIcon from '@clayui/icon';
import {FrontendDataSet} from '@liferay/frontend-data-set-web';
import {
	API,
	Card,
	getLocalizableLabel,
} from '@liferay/object-js-components-web';
import {createResourceURL} from 'frontend-js-web';
import React, {useEffect, useState} from 'react';

import {
	IFDSTableProps,
	defaultDataSetProps,
	fdsItem,
	formatActionURL,
} from '../../utils/fds';
import CardHeader from './CardHeader';
import objectDefinitionModifiedDateDataRenderer from './FDSDataRenderers/ObjectDefinitionModifiedDateDataRenderer';
import objectDefinitionStatusDataRenderer from './FDSDataRenderers/ObjectDefinitionStatusDataRenderer';
import objectDefinitionSystemDataRenderer from './FDSDataRenderers/ObjectDefinitionSystemDataRenderer';
import {ModalAddFolder} from './ModalAddFolder';
import {ModalAddObjectDefinition} from './ModalAddObjectDefinition';
import {ModalDeleteObjectDefinition} from './ModalDeleteObjectDefinition';
import {ModalEditFolder} from './ModalEditFolder';
import {deleteObjectDefinition, getFolderActions} from './objectDefinitionUtil';

import './ViewObjectDefinitions.scss';
import {defaultLanguageId} from '../../utils/constants';
import {ModalDeleteFolder} from './ModalDeleteFolder';
import {ModalMoveObjectDefinition} from './ModalMoveObjectDefinition';

interface ViewObjectDefinitionsProps extends IFDSTableProps {
	baseResourceURL: string;
	storages: LabelTypeObject[];
}

export type ViewObjectDefinitionsModals = {
	addFolder: boolean;
	addObjectDefinition: boolean;
	deleteFolder: boolean;
	deleteObjectDefinition: boolean;
	editFolder: boolean;
	importObject: boolean;
	moveObjectDefinition: boolean;
};

export interface DeletedObjectDefinition extends ObjectDefinition {
	hasObjectRelationship: boolean;
	objectEntriesCount: number;
}

const MOCK_FOLDERS_LIST: Folder[] = [
	{
		erc: 'uncategorized',
		label: {en_US: 'Uncategorized'},
		name: 'uncategorized',
	},
	{
		erc: 'ticket',
		label: {en_US: 'Ticket', pt_BR: 'Ingresso'},
		name: 'ticket',
	},
];

export default function ViewObjectDefinitions({
	apiURL,
	baseResourceURL,
	creationMenu,
	id,
	items,
	sorting,
	storages,
	url,
}: ViewObjectDefinitionsProps) {
	const initialValues: Folder = {
		erc: '',
		label: {en_US: ''},
		name: '',
	};
	const [showModal, setShowModal] = useState<ViewObjectDefinitionsModals>({
		addFolder: false,
		addObjectDefinition: false,
		deleteFolder: false,
		deleteObjectDefinition: false,
		editFolder: false,
		importObject: false,
		moveObjectDefinition: false,
	});
	const [selectedFolder, setSelectedFolder] = useState<Folder>(initialValues);
	const [foldersList, setfoldersList] = useState<Folder[]>([initialValues]);
	const [
		deletedObjectDefinition,
		setDeletedObjectDefinition,
	] = useState<DeletedObjectDefinition | null>();

	function objectDefinitionLabelDataRenderer({
		itemData,
		value,
	}: fdsItem<ObjectDefinition>) {
		const handleEditDefinition = () => {
			window.location.href = formatActionURL(url, itemData.id);
		};

		return (
			<div className="table-list-title">
				<a href="#" onClick={handleEditDefinition}>
					{getLocalizableLabel(
						itemData.defaultLanguageId as Liferay.Language.Locale,
						value
					)}
				</a>
			</div>
		);
	}

	const dataSetProps = {
		...defaultDataSetProps,
		apiURL,
		creationMenu,
		customDataRenderers: {
			objectDefinitionLabelDataRenderer,
			objectDefinitionModifiedDateDataRenderer,
			objectDefinitionStatusDataRenderer,
			objectDefinitionSystemDataRenderer,
		},
		id,
		itemsActions: items,
		namespace:
			'_com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_',
		onActionDropdownItemClick({
			action,
			itemData,
		}: {
			action: {data: {id: string}};
			itemData: ObjectDefinition;
		}) {
			if (action.data.id === 'deleteObjectDefinition') {
				const getDeleteObjectDefinition = async () => {
					const url = createResourceURL(baseResourceURL, {
						objectDefinitionId: itemData.id,
						p_p_resource_id:
							'/object_definitions/get_object_definition_delete_info',
					}).href;

					const {
						hasObjectRelationship,
						objectEntriesCount,
					} = await API.fetchJSON<{
						hasObjectRelationship: boolean;
						objectEntriesCount: number;
					}>(url);

					if (itemData.status.code !== 0) {
						await deleteObjectDefinition(
							itemData.id,
							itemData.name
						);
						setTimeout(() => window.location.reload(), 1000);

						return;
					}

					setDeletedObjectDefinition({
						...itemData,
						hasObjectRelationship,
						objectEntriesCount,
					});

					setShowModal(
						(previousState: ViewObjectDefinitionsModals) => ({
							...previousState,
							deleteObjectDefinition: true,
						})
					);
				};

				getDeleteObjectDefinition();
			}
		},
		portletId:
			'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet',
		sidePanelId: 'none',
		sorting,
		style: 'fluid' as 'fluid',
		views: [
			{
				contentRenderer: 'table',
				label: 'Table',
				name: 'table',
				schema: {
					fields: [
						{
							contentRenderer:
								'objectDefinitionLabelDataRenderer',
							expand: false,
							fieldName: 'label',
							label: Liferay.Language.get('label'),
							localizeLabel: true,
							sortable: true,
						},
						{
							expand: false,
							fieldName: 'scope',
							label: Liferay.Language.get('scope'),
							localizeLabel: true,
							sortable: false,
						},
						{
							contentRenderer:
								'objectDefinitionSystemDataRenderer',
							expand: false,
							fieldName: 'system',
							label: Liferay.Language.get('system'),
							localizeLabel: true,
							sortable: false,
						},
						{
							contentRenderer:
								'objectDefinitionModifiedDateDataRenderer',
							expand: false,
							fieldName: 'dateModified',
							label: Liferay.Language.get('modified-date'),
							localizeLabel: true,
							sortable: true,
						},
						{
							contentRenderer:
								'objectDefinitionStatusDataRenderer',
							expand: false,
							fieldName: 'status',
							label: Liferay.Language.get('status'),
							localizeLabel: true,
							sortable: false,
						},
					],
				},
				thumbnail: 'table',
			},
		],
	};

	useEffect(() => {
		setfoldersList(MOCK_FOLDERS_LIST);
	}, []);

	useEffect(() => {
		setSelectedFolder(foldersList[0]);
	}, [foldersList]);

	useEffect(() => {
		Liferay.on('addObjectDefinition', () =>
			setShowModal((previousState: ViewObjectDefinitionsModals) => ({
				...previousState,
				addObjectDefinition: true,
			}))
		);

		return () => {
			Liferay.detach('addObjectDefinition');
		};
	}, []);

	return (
		<>
			{Liferay.FeatureFlags['LPS-148856'] ? (
				<div className="lfr__object-web-view-object-definitions">
					<div className="lfr__object-web-view-object-definitions-folder-list-container">
						<div className="lfr__object-web-view-object-definitions-folder-list-header">
							<h4 className="lfr__object-web-view-object-definitions-folder-list-title mb-0">
								{Liferay.Language.get(
									'objects-folders'
								).toUpperCase()}
							</h4>

							<div className="d-flex">
								<ClayButton
									aria-label={Liferay.Language.get(
										'add-objects-folder'
									)}
									className="component-action"
									displayType="unstyled"
									monospaced
									onClick={() =>
										setShowModal(
											(
												previousState: ViewObjectDefinitionsModals
											) => ({
												...previousState,
												addFolder: true,
											})
										)
									}
								>
									<ClayIcon symbol="plus" />
								</ClayButton>
							</div>
						</div>

						<TreeView
							defaultItems={MOCK_FOLDERS_LIST}
							nestedKey="children"
						>
							{(item) => (
								<TreeView.Item
									key={item.name}
									onClick={() => {
										setSelectedFolder(item);
									}}
								>
									{getLocalizableLabel(
										defaultLanguageId,
										item.label,
										item.name
									)}
								</TreeView.Item>
							)}
						</TreeView>
					</div>

					<Card
						className="lfr__object-web-view-object-definitions-card"
						header={
							<CardHeader
								erc={selectedFolder.erc}
								items={getFolderActions(
									selectedFolder.name ?? '',
									setShowModal
								)}
								label={selectedFolder.label}
							/>
						}
						viewMode="no-header-border"
					>
						<FrontendDataSet {...dataSetProps} />
					</Card>
				</div>
			) : (
				<FrontendDataSet {...dataSetProps} />
			)}

			{showModal.addObjectDefinition && (
				<ModalAddObjectDefinition
					apiURL={apiURL as string}
					handleOnClose={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								addObjectDefinition: false,
							})
						);
					}}
					storages={storages}
				/>
			)}

			{showModal.deleteObjectDefinition && (
				<ModalDeleteObjectDefinition
					handleOnClose={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								deleteObjectDefinition: false,
							})
						);
					}}
					objectDefinition={
						deletedObjectDefinition as DeletedObjectDefinition
					}
					setDeletedObjectDefinition={setDeletedObjectDefinition}
				/>
			)}

			{showModal.addFolder && (
				<ModalAddFolder
					handleOnClose={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								addFolder: false,
							})
						);
					}}
				/>
			)}

			{showModal.editFolder && (
				<ModalEditFolder
					externalReferenceCode={selectedFolder.erc}
					handleOnClose={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								editFolder: false,
							})
						);
					}}
					initialLabel={selectedFolder.label}
					name={selectedFolder.name}
				/>
			)}

			{showModal.deleteFolder && (
				<ModalDeleteFolder
					folder={selectedFolder}
					handleOnClose={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								deleteFolder: false,
							})
						);
					}}
				/>
			)}

			{showModal.moveObjectDefinition && (
				<ModalMoveObjectDefinition
					folderList={foldersList}
					handleOnClose={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								moveObjectDefinition: false,
							})
						);
					}}
				/>
			)}
		</>
	);
}
