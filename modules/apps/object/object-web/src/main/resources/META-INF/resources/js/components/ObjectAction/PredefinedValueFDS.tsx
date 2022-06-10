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
import ClayIcon from '@clayui/icon';
import {useModal} from '@clayui/modal';
import {ClayTooltipProvider} from '@clayui/tooltip';

// @ts-ignore

import {FrontendDataSet} from '@liferay/frontend-data-set-web';
import {
	Card,
	ExpressionBuilder,
	onActionDropdownItemClick,
} from '@liferay/object-js-components-web';
import React, {useEffect, useMemo, useState} from 'react';

import ModalAddColumns from '../ObjectView/ModalAddColumns/ModalAddColumns';

import './PredefinedValueFDS.scss';

function getDataSetProps(items: any[]) {
	return {
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
		items,
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
}

export default function PredefinedValueFDS({
	currentObjectDefinitionFields,
	setValues,
	values,
}: IProps) {
	const {predefinedValues = []} = values.parameters as ObjectActionParameters;

	// if (predefinedValues?.length === 0) {
	// 	predefinedValues = [{name: 'text', value: '', inputAsValue: false, required: true}];
	// }

	const [visibleModal, setVisibleModal] = useState(false);

	const [visibleWarningModal, setVisibleWarningModal] = useState(false);

	const {observer, onClose} = useModal({
		onClose: () =>
			visibleWarningModal
				? setVisibleWarningModal(false)
				: setVisibleModal(false),
	});

	const props = useMemo(() => {
		const items = predefinedValues.map((item) => {
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
				newValue: (
					<ExpressionBuilder
						error=""
						feedbackMessage={Liferay.Language.get(
							'use-expressions-to-create-a-condition'
						)}
						label={Liferay.Language.get('expression-builder')}
						name="conditionExpression"
						onChange={({target: {value}}: any) =>
							setValues({conditionExpression: value})
						}
						onOpenModal={() => {
							const parentWindow = Liferay.Util.getOpener();

							parentWindow.Liferay.fire(
								'openExpressionBuilderModal',
								{
									onSave: {},
									source: {},
								}
							);
						}}
						placeholder={Liferay.Language.get(
							'input-a-value-or-create-an-expression.'
						)}
						value=""
					/>
				),
			};
		});

		return getDataSetProps(items);
	}, [predefinedValues]);

	useEffect(() => {
		const deleteDataSetField = (event: any) => {
			const [name, required] = event.itemData.name.props.children;

			if (required) {
				alert('Required fields cannot be deleted.');

				return;
			}

			const newPredefinedValues = predefinedValues?.filter(
				(field) => field.name !== name
			);

			setValues({
				parameters: {
					...values.parameters,
					predefinedValues: newPredefinedValues,
				},
			});
		};

		const openModal = (event: any) => {
			setVisibleModal(true);
		};

		Liferay.on('deleteDataSetField', deleteDataSetField);
		Liferay.on('openModalAddColumns', openModal);

		return () => {
			Liferay.detach('deleteDataSetField');
			Liferay.detach('openModalAddColumns');
		};
	}, [setVisibleModal]);

	const getSelectedFields = () => {
		const objectFields: ObjectField[] = [];

		predefinedValues?.forEach(({name}) => {
			currentObjectDefinitionFields.forEach((field) => {
				if (field.name === name) {
					objectFields.push(field);
				}
			});
		});

		return objectFields;
	};

	return (
		<>
			<Card title={Liferay.Language.get('predefined-values')}>
				<div id="lfr-object-web__predefined-values-render-fds">
					<FrontendDataSet {...props} />
				</div>
			</Card>

			{visibleModal && (
				<ModalAddColumns
					disableRequired
					getName={({name}: ObjectField) => name}
					items={currentObjectDefinitionFields}
					observer={observer}
					onClose={onClose}
					onSave={(items) => {
						let newPredefinedValues = [];
						newPredefinedValues = items.map(({name, required}) => {
							let existValue;
							predefinedValues.forEach((item) => {
								if (item.name === name) {
									existValue = item;

									return;
								}
							});

							return existValue
								? existValue
								: {
										name,
										required,
										value: '',
										inputAsValue: false,
								  };
						});
						setValues({
							parameters: {
								...values.parameters,
								predefinedValues: newPredefinedValues as PredefinedValue[],
							},
						});
					}}
					selected={getSelectedFields() as ObjectField[]}
				/>
			)}
		</>
	);
}

interface IProps {
	currentObjectDefinitionFields: ObjectField[];
	predefinedValues?: PredefinedValue[];
	setValues: (params: Partial<ObjectAction>) => void;
	values: Partial<ObjectAction>;
}

interface IDataSetProps {
	apiURL?: string;
	appURL?: string;
	batchTasksStatusApiURL?: string;
	creationMenu: any;
	id: string;
	items: any[];
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
			component?: React.FC<any>;
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
