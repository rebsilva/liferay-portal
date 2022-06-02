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

import {ClayCheckbox} from '@clayui/form';
import {useModal} from '@clayui/modal';

// @ts-ignore

import {FrontendDataSet} from '@liferay/frontend-data-set-web';

// @ts-ignore

import {render} from '@liferay/frontend-js-react-web';
import React, {useEffect, useState} from 'react';

import {defaultLanguageId} from '../../utils/locale';
import Card from '../Card/Card';
import {CheckboxItem} from '../Form/CheckBoxItem';
import ModalAddColumns from '../ObjectView/ModalAddColumns/ModalAddColumns';

// @ts-ignore

import TestFrontendDataSet from '../TestFrontendDataSet';
import {onActionDropdownItemClick} from './fdsUtil'; // mudar esse import quando o PR de dan entrar
// import {TObjectField, TObjectViewColumn} from '../ObjectView/types';

export default function PredefinedValueFDS({
	currentObjectDefinitionFields,
	dataSetFields,
	setDataSetFields,
}: IProps) {
	const dataSetProps: IDataSetProps = {
		creationMenu: {
			primaryItems: [
				{
					href: 'openModalAddColumns',
					id: 'openModalAddColumns',
					label: 'funcionou!',
					target: 'event',
				},
			],
		},
		id: 'tableTest',
		items: [],
		itemsActions: [
			{
				href: 'deleteDataSetField',
				id: 'deleteDataSetField',
				label: 'delete',
				target: 'event',
			} as any,
		],
		namespace: '',

		onActionDropdownItemClick,

		selectedItemsKey: 'id',
		showManagementBar: true,
		showPagination: false,
		showSearch: false,
		views: [
			{
				contentRenderer: 'table',
				label: 'Table',
				name: 'table',
				schema: {
					fields: [
						{
							fieldName: 'name',
							label: Liferay.Language.get('field'),
						} as any,
						{
							fieldName: 'inputAsValue',
							label: Liferay.Language.get('input-method'),
						},
						{
							fieldName: 'newValue',
							label: Liferay.Language.get('new-value'),
						} as any,
					],
				},
				thumbnail: 'table',
			},
		],
	};

	const [frontEndDataSetProps, setFrontEndDataSetProps] = useState(
		dataSetProps
	);

	const [visibleModal, setVisibleModal] = useState(false);

	const {observer, onClose} = useModal({
		onClose: () => setVisibleModal(false),
	});

	const getEntityFields = (dataSetFields: ObjectField[] | undefined) => {
		const dataSetItems = dataSetFields?.map((item) => {
			return {
				inputAsValue: (
					<ClayCheckbox
						checked={false}
						disabled={false}
						label={Liferay.Language.get('input-as-a-value')}
						onChange={({target: {checked}}) => {}}
					/>
				),
				name: item.name,
				newValue: <TestFrontendDataSet />,

				//  checkbox: <CheckboxItem
				//  checked={false}
				// 				key={""}
				// 				label={"Input Manually"}
				// 				onChange={({target: {checked}}) => {
				// Liferay.fire

				// 				}}

				//  />

			};
		});

		setFrontEndDataSetProps({
			...frontEndDataSetProps,
			items: dataSetItems,
		});
	};

	useEffect(() => {
		getEntityFields(dataSetFields);
	}, [dataSetFields]);

	const datasetDisplayLauncher = (...frontEndDataSetProps: any[]) =>
		render(FrontendDataSet, ...frontEndDataSetProps);

	useEffect(() => {
		datasetDisplayLauncher(
			frontEndDataSetProps,
			document.getElementById(
				'lfr-object-web__predefined-values-render-fds'
			)
		);
	}, [frontEndDataSetProps]);

	const deleteDataSetField = (event: any) => {
		const {itemData} = event;
		const updatedFieldList = dataSetFields?.filter(
			(field) => field.name !== itemData.name
		);
		setDataSetFields(updatedFieldList);
	};

	const openModal = (event: any) => {
		setVisibleModal(true);
	};

	useEffect(() => {
		Liferay.on('deleteDataSetField', deleteDataSetField);

		return () => {
			Liferay.detach('deleteDataSetField');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		Liferay.on('openModalAddColumns', openModal);

		return () => {
			Liferay.detach('openModalAddColumns');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Card title={Liferay.Language.get('predefined-values')}>
				<div id="lfr-object-web__predefined-values-render-fds" />
			</Card>

			{visibleModal && (
				<ModalAddColumns
					handleSubmit={setDataSetFields}
					isActionBuilder={true}
					objectFields={currentObjectDefinitionFields}
					objectViewColumns={dataSetFields}
					observer={observer}
					onClose={onClose}
				/>
			)}
		</>
	);
}

interface IProps {
	dataSetFields?: ObjectField[];
	setDataSetFields: (params: any) => void;
	currentObjectDefinitionFields: ObjectField[];
}

interface IDataSetProps {
	apiURL?: string;
	appURL?: string;
	batchTasksStatusApiURL?: string;
	creationMenu: any;
	id: string;
	items: any[] | undefined;
	itemsActions: [
		{
			href: string;
			icon: string;
			id: string;
			label: string;
		}
	];
	namespace: string;
	onActionDropdownItemClick: (params: any) => void;
	selectedItemsKey: string;
	showManagementBar: boolean;
	showPagination: boolean;
	showSearch: boolean;
	views: [
		{
			contentRenderer: string;
			label: string;
			name: string;
			schema: {
				fields: ObjectField[];
			};
			thumbnail: string;
		}
	];
}
