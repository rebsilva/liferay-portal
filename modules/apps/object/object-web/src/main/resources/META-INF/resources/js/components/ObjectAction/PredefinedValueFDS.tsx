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
import ClayIcon from '@clayui/icon';
import {ClayTooltipProvider} from '@clayui/tooltip';
// @ts-ignore

import {FrontendDataSet} from '@liferay/frontend-data-set-web';

// @ts-ignore

import {render} from '@liferay/frontend-js-react-web';
import React, {useEffect, useMemo, useState} from 'react';

import {defaultLanguageId} from '../../utils/locale';
import Card from '../Card/Card';
import {CheckboxItem} from '../Form/CheckBoxItem';
import ModalAddColumns from '../ObjectView/ModalAddColumns/ModalAddColumns';

// @ts-ignore

import TestFrontendDataSet from '../TestFrontendDataSet';
import {onActionDropdownItemClick} from './fdsUtil'; // mudar esse import quando o PR de dan entrar

import './PredefinedValueFDS.scss';

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
			icon: 'trash',
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

export default function PredefinedValueFDS({
	currentObjectDefinitionFields,
	predefinedValues = [],
	setValues,
}: IProps) {

	const [visibleModal, setVisibleModal] = useState(false);

	const [visibleWarningModal, setVisibleWarningModal] = useState(false);

	const {observer, onClose} = useModal({
		onClose: () =>
		visibleWarningModal
				? setVisibleWarningModal(false)
				: setVisibleModal(false),
	});

	const props = useMemo(() => {

		const items = predefinedValues?.map((item) => {
			return {
				inputAsValue: (
					<div className="lfr-object-web__predefined-values-render-fds-input-method">
						<ClayCheckbox
							checked={false}
							disabled={false}
							label={Liferay.Language.get('input-as-a-value')}
							onChange={({target: {checked}}) => {}}
						/>

						<ClayTooltipProvider>
							<div
								data-tooltip-align="top"
								title={Liferay.Language.get(
									'by-checking-expressions-wont-be-used-for-filling-the-field-predefined-value'
								)}
							>
								<ClayIcon
									className="lfr-object-web__predefined-values-render-fds-tooltip-icon"
									symbol="question-circle-full"
								/>
							</div>
						</ClayTooltipProvider>
					</div>
				),
				name: (
					<>
						{item.name}
						{item.required === true && (
							<span className="ml-1 reference-mark text-warning">
								<ClayIcon symbol="asterisk" />
							</span>
						)}
					</>
				),
				newValue: <TestFrontendDataSet />,
			};
		});

		return {...dataSetProps, items};

	},[predefinedValues])

	const datasetDisplayLauncher = (...frontEndDataSetProps: any[]) =>
		render(FrontendDataSet, ...frontEndDataSetProps);

	useEffect(() => {
		datasetDisplayLauncher(
			props,
			document.getElementById(
				'lfr-object-web__predefined-values-render-fds'
			)
		);
	}, [props]);

	const openModal = (event: any) => { // fazer um desse
		setVisibleModal(true);
	};

	useEffect(() => {
		const deleteDataSetField = (event: any) => {
			alert("yeooo");
			// const [name, required] = event.itemData.name.props.children;

			// if (required) {
			// 	alert('I am required!');

			// 	return;
			// }

			// const updatedFieldList = dataSetFields.filter(
			// 	(field) => field.name !== name
			// );

			// setDataSetFields(updatedFieldList);
		};

		Liferay.on('deleteDataSetField', deleteDataSetField);

		return () => {
			Liferay.detach('deleteDataSetField');
		};
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
				<div id="lfr-object-web__predefined-values-render-fds" >
				</div>
			</Card>

			 {/* {visibleModal && (
				<ModalAddColumns
					handleSubmit={setDataSetFields}
					isActionBuilder={true}
					objectFields={currentObjectDefinitionFields}
					objectViewColumns={dataSetFields}
					observer={observer}
					onClose={onClose}
				/>
			)}  */}

		</>
	);
}

interface IProps {
	currentObjectDefinitionFields: ObjectField[];
	predefinedValues?: PredefinedValue[];
	setValues: (params: Partial<ObjectAction>) => void;
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
