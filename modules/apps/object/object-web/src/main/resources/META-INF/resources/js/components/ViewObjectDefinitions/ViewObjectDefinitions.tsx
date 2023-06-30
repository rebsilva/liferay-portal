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
import {
	DateTimeRenderer,
	FrontendDataSet,
} from '@liferay/frontend-data-set-web';
import {
	API,
	Card,
	getLocalizableLabel,
} from '@liferay/object-js-components-web';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {
	IFDSTableProps,
	defaultDataSetProps,
	fdsItem,
	formatActionURL,
} from '../../utils/fds';

import './ViewObjectDefinitions.scss';

import {createResourceURL} from 'frontend-js-web';

import {ModalAddObjectDefinition} from './ModalAddObjectDefinition';
import {ModalDeleteObjectDefinition} from './ModalDeleteObjectDefinition';
import {deleteObjectDefinition} from './objectDefinitionUtil';

interface ViewObjectDefinitionsProps extends IFDSTableProps {
	baseResourceURL: string;
	storages: LabelTypeObject[];
}

type TModel = {
	erc?: string;
	id?: string;
	label?: string;
	name?: string;
};

export interface DeletedObjectDefinition extends ObjectDefinition {
	hasObjectRelationship: boolean;
	objectEntriesCount: number;
}

const MOCK_MODELS_LIST: TModel[] = [
	{
		erc: 'uncategorized',
		id: 'uncategorized',
		label: 'Uncategorized',
		name: 'uncategorized',
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
	const initialValues: TModel = {
		erc: '',
		id: '',
		label: '',
		name: '',
	};
	const [selectedModel, setSelectedModel] = useState<TModel>(initialValues);
	const [modelsList, setModelsList] = useState<TModel[]>([initialValues]);
	const [
		showModalAddObjectDefinition,
		setShowModalAddObjectDefinition,
	] = useState(false);
	const [
		showModalDeleteObjectDefinition,
		setShowModalDeleteObjectDefinition,
	] = useState(false);

	const [
		deletedObjectDefinition,
		setDeletedObjectDefinition,
	] = useState<DeletedObjectDefinition | null>();

	useEffect(() => {
		setModelsList(MOCK_MODELS_LIST);
	}, []);

	useEffect(() => {
		setSelectedModel(modelsList[0]);
	}, [modelsList]);

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

	function objectDefinitionModifiedDateDataRenderer({
		itemData,
	}: {
		itemData: ObjectDefinition;
	}) {
		return DateTimeRenderer({
			options: {
				format: {
					day: 'numeric',
					month: 'short',
					timeZone: 'UTC',
					year: 'numeric',
				},
			},
			value: String(itemData.dateModified),
		});
	}

	function objectDefinitionStatusDataRenderer({
		itemData,
	}: {
		itemData: ObjectDefinition;
	}) {
		return (
			<strong
				className={classNames(
					itemData.status.label === 'approved'
						? 'label-success'
						: 'label-info',
					'label'
				)}
			>
				{itemData.status.label_i18n}
			</strong>
		);
	}

	function objectDefinitionSystemDataRenderer({
		itemData,
	}: {
		itemData: ObjectDefinition;
	}) {
		return itemData.system
			? Liferay.Language.get('yes')
			: Liferay.Language.get('no');
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

					setShowModalDeleteObjectDefinition(true);
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
		Liferay.on('addObjectDefinition', () =>
			setShowModalAddObjectDefinition(true)
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
						<h3 className="mb-0">{selectedModel.label}</h3>

						<ClayDropDownWithItems
							items={[]}
							trigger={
								<ClayButton
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

						<strong className="ml-2">{selectedModel.erc}</strong>

						<span
							className="ml-3 text-secondary"
							title="help message here"
						>
							<ClayIcon symbol="question-circle" />
						</span>
					</div>
				</div>

				<ClayButton
					className="lfr__object-web-view-object-definitions-view-in-model-builder-button"
					displayType="secondary"
				>
					{Liferay.Language.get('view-in-modal-builder')}
				</ClayButton>
			</div>
		);
	};

	return (
		<>
			{Liferay.FeatureFlags['LPS-185675'] ? (
				<div className="lfr__object-web-view-object-definitions">
					<div className="lfr__object-web-view-object-definitions-model-list-container">
						<div className="lfr__object-web-view-object-definitions-model-list-header">
							<h4>OBJECTS MODEL</h4>

							<div className="d-flex">
								<ClayIcon symbol="plus" />

								<ClayIcon symbol="ellipsis-v" />
							</div>
						</div>

						<TreeView
							defaultItems={MOCK_MODELS_LIST}
							nestedKey="children"
						>
							{(item) => (
								<TreeView.Item>{item.label}</TreeView.Item>
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

			{showModalAddObjectDefinition && (
				<ModalAddObjectDefinition
					apiURL={apiURL as string}
					onVisibilityChange={setShowModalAddObjectDefinition}
					storages={storages}
				/>
			)}

			{showModalDeleteObjectDefinition && (
				<ModalDeleteObjectDefinition
					objectDefinition={
						deletedObjectDefinition as DeletedObjectDefinition
					}
					onVisibilyChange={setShowModalDeleteObjectDefinition}
					setDeletedObjectDefinition={setDeletedObjectDefinition}
				/>
			)}
		</>
	);
}
