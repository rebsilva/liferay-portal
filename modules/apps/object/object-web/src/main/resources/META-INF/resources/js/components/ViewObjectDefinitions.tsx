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

	// @ts-ignore

} from '@liferay/frontend-data-set-web';
import {Card, getLocalizableLabel} from '@liferay/object-js-components-web';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {
	IFDSTableProps,
	defaultDataSetProps,
	fdsItem,
	formatActionURL,
} from '../utils/fds';

import './ViewObjectDefinitions.scss';

interface ItemData {
	dateModified: string;
	defaultLanguageId: string;
	id: number;
	required: boolean;
	status: {label: string; label_i18n: string};
	system: boolean;
}

type TModel = {
	erc?: string;
	id?: string;
	label?: string;
	name?: string;
};

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
	creationMenu,
	formName,
	id,
	items,
	sorting,
	style,
	url,
}: IFDSTableProps) {
	const initialValues: TModel = {
		erc: '',
		id: '',
		label: '',
		name: '',
	};
	const [selectedModel, setSelectedModel] = useState<TModel>(initialValues);
	const [modelsList, setModelsList] = useState<TModel[]>([initialValues]);

	useEffect(() => {
		setModelsList(MOCK_MODELS_LIST);
	}, []);

	useEffect(() => {
		setSelectedModel(modelsList[0]);
	}, [modelsList]);

	function objectDefinitionLabelDataRenderer({
		itemData,
		value,
	}: fdsItem<ItemData>) {
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
		itemData: ItemData;
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
		itemData: ItemData;
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
		itemData: ItemData;
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
		formName,
		id,
		itemsActions: items,
		namespace:
			'_com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_',
		onActionDropdownItemClick({
			action,
			itemData,
		}: {
			action: {data: {id: string}};
			itemData: {id: string};
		}) {
			if (action.data.id === 'deleteObjectDefinition') {
				Liferay.fire('deleteObjectDefinition', {itemData});
			}
		},
		portletId:
			'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet',
		sorting,
		style,
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
		<div className="lfr__object-web-view-object-definitions">
			{Liferay.FeatureFlags['LPS-185675'] ? (
				<>
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
				</>
			) : (
				<FrontendDataSet {...dataSetProps} />
			)}
		</div>
	);
}
