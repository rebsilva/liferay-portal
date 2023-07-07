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
import {ClayDropDownWithItems} from '@clayui/drop-down';
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
import objectDefinitionModifiedDateDataRenderer from './FDSDataRenders/ObjectDefinitionModifiedDateDataRenderer';
import objectDefinitionStatusDataRenderer from './FDSDataRenders/ObjectDefinitionStatusDataRenderer';
import objectDefinitionSystemDataRenderer from './FDSDataRenders/ObjectDefinitionSystemDataRenderer';
import {ModalAddFolder} from './ModalAddFolder';
import {ModalAddObjectDefinition} from './ModalAddObjectDefinition';
import {ModalDeleteObjectDefinition} from './ModalDeleteObjectDefinition';
import {deleteObjectDefinition, getFolderActions} from './objectDefinitionUtil';

import './ViewObjectDefinitions.scss';

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
};

type folderProps = {
	erc?: string;
	label?: string;
	name?: string;
};

export interface DeletedObjectDefinition extends ObjectDefinition {
	hasObjectRelationship: boolean;
	objectEntriesCount: number;
}

const MOCK_FOLDERS_LIST: folderProps[] = [
	{
		erc: 'uncategorized',
		label: 'Uncategorized',
		name: 'uncategorized',
	},
	{
		erc: 'ticket',
		label: 'Ticket',
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
	const initialValues: folderProps = {
		erc: '',
		label: '',
		name: '',
	};
	const [showModal, setShowModal] = useState<ViewObjectDefinitionsModals>({
		addFolder: false,
		addObjectDefinition: false,
		deleteFolder: false,
		deleteObjectDefinition: false,
		editFolder: false,
		importObject: false,
	});
	const [selectedFolder, setSelectedFolder] = useState<folderProps>(
		initialValues
	);
	const [foldersList, setfoldersList] = useState<folderProps[]>([
		initialValues,
	]);
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
							sortable: false,
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
							sortable: false,
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

	const header = () => {
		return (
			<div className="lfr__object-web-view-object-definitions-card-header">
				<div>
					<div className="d-flex lfr__object-web-view-object-definitions-title-kebab">
						<h3 className="mb-0">{selectedFolder.label}</h3>

						<ClayDropDownWithItems
							className="lfr__object-web-view-object-definitions-actions"
							items={getFolderActions(
								selectedFolder.name ?? '',
								setShowModal
							)}
							trigger={
								<ClayButton
									aria-label={Liferay.Language.get(
										'folder-actions'
									)}
									className="component-action"
									displayType="unstyled"
									monospaced
								>
									<ClayIcon symbol="ellipsis-v" />
								</ClayButton>
							}
						/>
					</div>

					<div className="mt-1">
						<span className="text-secondary">
							{`${Liferay.Language.get('erc')}:`}
						</span>

						<strong className="ml-2">{selectedFolder.erc}</strong>

						<span
							className="ml-3 text-secondary"
							title={Liferay.Language.get(
								'unique-key-for-referencing-the-picklist-definition'
							)}
						>
							<ClayIcon symbol="question-circle" />
						</span>
					</div>
				</div>

				<ClayButton
					aria-label={Liferay.Language.get('view-in-model-builder')}
					className="lfr__object-web-view-object-definitions-view-in-model-builder-button"
					displayType="secondary"
				>
					{Liferay.Language.get('view-in-model-builder')}
				</ClayButton>
			</div>
		);
	};

	return (
		<>
			{Liferay.FeatureFlags['LPS-148856'] ? (
				<div className="lfr__object-web-view-object-definitions">
					<div className="lfr__object-web-view-object-definitions-folder-list-container">
						<div className="lfr__object-web-view-object-definitions-folder-list-header">
							<h4 className="lfr__object-web-view-object-definitions-folder-list-title mb-0">
								{Liferay.Language.get('objects-folders')}
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
									{item.label}
								</TreeView.Item>
							)}
						</TreeView>
					</div>

					<Card
						className="lfr__object-web-view-object-definitions-card"
						header={header()}
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
					onVisibilityChange={() => {
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
					objectDefinition={
						deletedObjectDefinition as DeletedObjectDefinition
					}
					onVisibilityChange={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								deleteObjectDefinition: false,
							})
						);
					}}
					setDeletedObjectDefinition={setDeletedObjectDefinition}
				/>
			)}

			{showModal.addFolder && (
				<ModalAddFolder
					apiURL={apiURL as string}
					onVisibilityChange={() => {
						setShowModal(
							(previousState: ViewObjectDefinitionsModals) => ({
								...previousState,
								addFolder: false,
							})
						);
					}}
				/>
			)}
		</>
	);
}
