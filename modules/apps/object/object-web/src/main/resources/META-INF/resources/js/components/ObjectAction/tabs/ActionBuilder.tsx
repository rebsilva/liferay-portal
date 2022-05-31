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

import ClayForm, {
	ClayCheckbox,
	ClaySelect,
	ClaySelectWithOption,
	ClayToggle,
} from '@clayui/form';
import {fetch} from 'frontend-js-web';
import React, {useEffect, useMemo, useState} from 'react';

import {FormError} from '../../../hooks/useForm';
import Card from '../../Card/Card';
import CodeMirrorEditor from '../../CodeEditor/CodeMirrorEditor';
import CustomSelect, {CustomItem} from '../../Form/CustomSelect/CustomSelect';
import Input from '../../Form/Input';
import PredefinedValueFDS from '../PredefinedValueFDS';

import './ActionBuilder.scss';

const HEADERS = new Headers({
	'Accept': 'application/json',
	'Content-Type': 'application/json',
});

let objectsOptionsList: Array<
	(
		| React.ComponentProps<typeof ClaySelect.Option>
		| React.ComponentProps<typeof ClaySelect.OptGroup>
	) & {
		options?: Array<React.ComponentProps<typeof ClaySelect.Option>>;
		type?: 'group';
	}
>;

let currentObjectDefinitionFields: ObjectField[] = [];

export default function ActionBuilder({
	errors,
	ffNotificationTemplates,
	getObjectDefinitionsRelationshipsURL,
	objectActionExecutors,
	objectActionTriggers,
	setValues,
	values,
}: IProps) {
	const [notificationTemplates, setNotificationTemplates] = useState<any[]>(
		[]
	);
	const [
		selectedNotificationTemplate,
		setSelectedNotificationTemplate,
	] = useState('');

	const [objectList, setObjectList] = useState<
		Map<number, {label: string; related?: boolean}>
	>();
	const [dataSetFields, setDataSetFields] = useState<ObjectField[]>();

	const handleFetchObjectDefinitions = async () => {
		const result = await fetch(getObjectDefinitionsRelationshipsURL);

		const objectArray = (await result.json()) as ObjectSettings[]; // tem que ter undefined aqui?
		const objectListMap = new Map<
			number,
			{label: string; related?: boolean}
		>();
		const relatedObjects: {label: string; value: number}[] = [];
		const nonRelatedObjects: {label: string; value: number}[] = [];

		objectArray?.forEach((object) => {
			if (object.related) {
				const {id, label, related} = object;
				objectListMap.set(id, {
					label,
					related,
				});
				relatedObjects.push({label, value: id});
			}
			else {
				const {id, label} = object;
				objectListMap.set(id, {label});
				nonRelatedObjects.push({label, value: id});
			}
		});

		objectsOptionsList = [];

		objectsOptionsList.push({
			disabled: true,
			label: Liferay.Language.get('choose-an-object'),
			selected: true,
			value: '',
		});

		if (relatedObjects.length > 0) {
			objectsOptionsList.push({
				label: Liferay.Language.get('related-objects'),
				options: relatedObjects,
				type: 'group',
			});
		}

		if (nonRelatedObjects.length > 0) {
			objectsOptionsList.push({
				label: Liferay.Language.get('non-related-objects'),
				options: nonRelatedObjects,
				type: 'group',
			});
		}

		setObjectList(objectListMap);
	};

	const handleFetchObjectFields = async (objectDefinitionId: number) => {
		const response = await fetch(
			`/o/object-admin/v1.0/object-definitions/${objectDefinitionId}/object-fields`,
			{
				headers: HEADERS,
				method: 'GET',
			}
		);

		const {items} = (await response.json()) as {items: ObjectField[]};

		currentObjectDefinitionFields = items;

		// logo depois que o objeto é selecionado, se retorna por default
		// os fields required para o FDS, por isso esse filter abaixo existe

		const requiredFields = items.filter((field) => field.required === true);

		setDataSetFields(requiredFields);
	};

	const actionExecutors = useMemo(() => {
		const executors = new Map<string, string>();

		objectActionExecutors.forEach(({label, value}) => {
			value && executors.set(value, label);
		});

		return executors;
	}, [objectActionExecutors]);

	const actionTriggers = useMemo(() => {
		const triggers = new Map<string, string>();

		objectActionTriggers.forEach(({label, value}) => {
			value && triggers.set(value, label);
		});

		return triggers;
	}, [objectActionTriggers]);

	useEffect(() => {
		if (values.objectActionExecutorKey === 'notificationTemplate') {
			const makeFetch = async () => {
				const response = await fetch(
					'/o/notification/v1.0/notification-templates',
					{
						method: 'GET',
					}
				);

				const {items} = (await response.json()) as any;

				const notificationsArray = items.map(
					(item: TNotificationTemplate) => {
						return {
							label: item.name,
							value: item.id,
						};
					}
				);

				setNotificationTemplates(notificationsArray);
			};

			makeFetch();
		}
	}, [values]);

	const setPredefinedValues = () => {

		// se for logo após a mudança de seleção de um objeto fazer desse jeito abaixo

		const predefinedValues = dataSetFields?.map(({name, required}) => {
			return {name, inputAsValue: false, value: '', required};
		});

		// senão alterar apenas algum/alguns dos parâmetros

		return predefinedValues;
	};

	useEffect(() => {
		const predefinedValues = setPredefinedValues();
		setValues({
			parameters: {
				...values.parameters,
				predefinedValues,
			},
		});
	}, [dataSetFields]); // tentar tirar esse useEffect depois

	return (
		<>
			<Card title={Liferay.Language.get('trigger')}>
				<Card
					title={Liferay.Language.get('when[object]')}
					viewMode="inline"
				>
					<CustomSelect
						error={errors.objectActionTriggerKey}
						onChange={({value}) =>
							setValues({objectActionTriggerKey: value})
						}
						options={objectActionTriggers}
						placeholder={Liferay.Language.get('choose-a-trigger')}
						value={actionTriggers.get(
							values.objectActionTriggerKey ?? ''
						)}
					/>
				</Card>
			</Card>

			{Liferay.FeatureFlags['LPS-152181'] && (
				<Card title={Liferay.Language.get('condition')}>
					<ClayForm.Group>
						<ClayToggle
							label={Liferay.Language.get('enable-condition')}
							name="condition"
							onToggle={(enable) =>
								setValues({
									conditionExpression: enable
										? ''
										: undefined,
								})
							}
							toggled={
								!(values.conditionExpression === undefined)
							}
						/>
					</ClayForm.Group>

					{values.conditionExpression !== undefined && (
						<Input
							feedbackMessage={Liferay.Language.get(
								'use-expressions-to-create-a-condition'
							)}
							label={Liferay.Language.get('expression-builder')}
							name="conditionExpression"
							onChange={({target: {value}}) =>
								setValues({conditionExpression: value})
							}
							placeholder={Liferay.Language.get(
								'create-an-expression'
							)}
							value={values.conditionExpression as string}
						/>
					)}
				</Card>
			)}

			<Card title={Liferay.Language.get('action')}>
				<Card
					title={Liferay.Language.get('then[object]')}
					viewMode="inline"
				>
					<div className="lfr-object__action-builder-then">
						<CustomSelect
							error={errors.objectActionExecutorKey}
							onChange={({value}) => {
								if (value === 'add-object-entry') {
									handleFetchObjectDefinitions();
								}
								else {
									setDataSetFields([]);
								}
								setValues({
									objectActionExecutorKey: value,
									parameters: {},
								});
							}}
							options={objectActionExecutors}
							placeholder={Liferay.Language.get(
								'choose-an-action'
							)}
							value={actionExecutors.get(
								values.objectActionExecutorKey ?? ''
							)}
						/>

						{values.objectActionExecutorKey ===
							'add-object-entry' && (
							<>
								on
								<ClaySelectWithOption
									aria-label={Liferay.Language.get(
										'choose-an-object'
									)}
									onChange={({target: {value}}) => {
										const objectDefinitionId = parseInt(
											value,
											10
										);
										const object = objectList?.get(
											objectDefinitionId
										);
										if (object?.related) {
											setValues({
												parameters: {
													objectDefinitionId,
													predefinedValues: [],
													relatedEntries: false,
												},
											});
										}
										else {
											setValues({
												parameters: {
													objectDefinitionId,
													predefinedValues: [],
												},
											});
										}

										handleFetchObjectFields(
											objectDefinitionId
										);
									}}
									options={objectsOptionsList} // isso aqui eu preciso mudar para pegar a label de acordo com as traduções
									value={
										values.parameters?.objectDefinitionId
									}
								/>
								{(values.parameters?.relatedEntries === false ||
									values.parameters?.relatedEntries ===
										true) && (
									<ClayCheckbox
										checked={
											values.parameters.relatedEntries
										}
										disabled={false}
										label={Liferay.Language.get(
											'also-relate-entries'
										)}
										onChange={({target: {checked}}) => {
											setValues({
												parameters: {
													...values.parameters,
													relatedEntries: checked,
												},
											});
										}}
									/>
								)}
							</>
						)}

						{ffNotificationTemplates &&
							values.objectActionExecutorKey ===
								'notificationTemplate' && (
								<CustomSelect
									className="lfr-object__action-builder-notification-then"
									error={errors.objectActionExecutorKey}
									label={Liferay.Language.get('notification')}
									onChange={({label, value}) => {
										setSelectedNotificationTemplate(label);
										setValues({
											parameters: {
												...values.parameters,
												notificationTemplateId: value,
											},
										});
									}}
									options={notificationTemplates}
									required
									value={selectedNotificationTemplate}
								/>
							)}
					</div>
				</Card>

				{values.objectActionExecutorKey === 'add-object-entry' &&
					values.parameters?.objectDefinitionId && (
						<PredefinedValueFDS
							currentObjectDefinitionFields={
								currentObjectDefinitionFields
							}
							dataSetFields={dataSetFields}
							setDataSetFields={setDataSetFields}
						/>
					)}

				{values.objectActionExecutorKey === 'webhook' && (
					<>
						<Input
							error={errors.url}
							label={Liferay.Language.get('url')}
							name="url"
							onChange={({target: {value}}) => {
								setValues({
									parameters: {
										...values.parameters,
										url: value,
									},
								});
							}}
							required
							value={values.parameters?.url}
						/>

						<Input
							label={Liferay.Language.get('secret')}
							name="secret"
							onChange={({target: {value}}) => {
								setValues({
									parameters: {
										...values.parameters,
										secret: value,
									},
								});
							}}
							value={values.parameters?.secret}
						/>
					</>
				)}

				{values.objectActionExecutorKey === 'groovy' && (
					<CodeMirrorEditor
						fixed
						mode="groovy"
						onChange={(script) =>
							setValues({
								parameters: {
									...values.parameters,
									script,
								},
							})
						}
						value={values.parameters?.script ?? ''}
					/>
				)}
			</Card>
		</>
	);
}

interface IProps {
	errors: FormError<ObjectAction & ObjectActionParameters>;
	ffNotificationTemplates: boolean;
	getObjectDefinitionsRelationshipsURL: string;
	objectActionExecutors: CustomItem[];
	objectActionTriggers: CustomItem[];
	setValues: (values: Partial<ObjectAction>) => void;
	values: Partial<ObjectAction>;
}

type TNotificationTemplate = {
	bcc: string;
	body: LocalizedValue<string>;
	cc: string;
	description: string;
	from: string;
	fromName: LocalizedValue<string>;
	id: number;
	name: string;
	subject: LocalizedValue<string>;
	to: LocalizedValue<string>;
};
