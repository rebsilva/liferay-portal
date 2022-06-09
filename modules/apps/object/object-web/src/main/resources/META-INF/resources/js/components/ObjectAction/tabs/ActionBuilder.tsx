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

import ClayForm, {ClayToggle, ClayCheckbox, ClaySelect, ClaySelectWithOption} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import {ClayTooltipProvider} from '@clayui/tooltip';
import {
	Card,
	CodeMirrorEditor,
	CustomItem,
	ExpressionBuilder,
	FormCustomSelect,
	FormError,
	Input,
} from '@liferay/object-js-components-web';
import {fetch} from 'frontend-js-web';
import React, {useEffect, useMemo, useState} from 'react';
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

export default function ActionBuilder({
	errors,
	ffNotificationTemplates,
	objectDefinitionsRelationshipsURL,
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

	const [relationships, setRelationships] = useState<ObjectDefinitionsRelationship[]>([]);

	const [currentObjectDefinitionFields, setCurrentObjectDefinitionFields ] = useState<ObjectField[]>([]);

	const [predefinedValues, setPredefinedValues] = useState<PredefinedValue[]>([]);

	const fetchObjectDefinitions = async () => {
		const response = await fetch(objectDefinitionsRelationshipsURL);

		const relationships = (await response.json()) as ObjectDefinitionsRelationship[];
		const relatedObjects: SelectItem[] = [];
		const nonRelatedObjects: SelectItem[] = [];

		relationships?.forEach((object) => {
			
			const {id, label} = object;

			const target = object.related ? relatedObjects : nonRelatedObjects;

			target.push({label, value: id});
		});

		objectsOptionsList = [];

		objectsOptionsList.push({
			disabled: true,
			label: Liferay.Language.get('choose-an-object'),
			selected: true,
			value: '',
		});

		const fillSelect = (label: string, options: SelectItem[]) => {
			if (options.length) {
				objectsOptionsList.push({label, options, type: 'group'});
			}
		}

		fillSelect(Liferay.Language.get('related-objects'), relatedObjects);

		fillSelect(Liferay.Language.get('non-related-objects'), nonRelatedObjects);

		setRelationships(relationships);

	};

	const fetchObjectFields = async (objectDefinitionId: number) => {
		const response = await fetch(
			`/o/object-admin/v1.0/object-definitions/${objectDefinitionId}/object-fields`,
			{
				headers: HEADERS,
				method: 'GET',
			}
		);

		const {items} = (await response.json()) as {items: ObjectField[]};

		const currentObjectDefinitionFields = items.filter(
			(field) => field.businessType !== 'Relationship' //&& !filter.system 
			// falar com gabriel ou carol depois
		);

		// talvez mudar para forEach depois se não der para tirar esse filter do relationship

		setCurrentObjectDefinitionFields(currentObjectDefinitionFields);

		// logo depois que o objeto é selecionado, se retorna por default
		// os fields required para o FDS, por isso esse filter abaixo existe

		const requiredFields: PredefinedValue[] = [];

		currentObjectDefinitionFields.forEach(({name, required}) => {
				if (required === true) {
					requiredFields.push({name, value: "", inputAsValue: false, required})
				}
			}
		);

		setValues(((values: Partial<ObjectAction>) => (
			{
			parameters:{
				...values.parameters,
				predefinedValues: requiredFields
			}
		}))as any);
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

	const handleSave = (conditionExpression?: string) => {
		setValues({conditionExpression});
	};

	const dataSetFields = useMemo(() => {
		if (!values.parameters?.predefinedValues) {
			return [] as PredefinedValue[];
		}

		const rows = values.parameters.predefinedValues;

		//console.log(rows);

		return rows;

	},[values]);

	console.log("tentando");

	return (
		<>
			<Card title={Liferay.Language.get('trigger')}>
				<Card
					title={Liferay.Language.get('when[object]')}
					viewMode="inline"
				>
					<FormCustomSelect
						error={errors.objectActionTriggerKey}
						onChange={({value}) =>
							setValues({
								conditionExpression: undefined,
								objectActionTriggerKey: value,
							})
						}
						options={objectActionTriggers}
						placeholder={Liferay.Language.get('choose-a-trigger')}
						value={actionTriggers.get(
							values.objectActionTriggerKey ?? ''
						)}
					/>
				</Card>
			</Card>

			{Liferay.FeatureFlags['LPS-152181'] &&
				['onAfterAdd', 'onAfterDelete', 'onAfterUpdate'].some(
					(key) => key === values.objectActionTriggerKey
				) && (
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
							<ExpressionBuilder
								error={errors.conditionExpression}
								feedbackMessage={Liferay.Language.get(
									'use-expressions-to-create-a-condition'
								)}
								label={Liferay.Language.get(
									'expression-builder'
								)}
								name="conditionExpression"
								onChange={({target: {value}}: any) =>
									setValues({conditionExpression: value})
								}
								onOpenModal={() => {
									const parentWindow = Liferay.Util.getOpener();

									parentWindow.Liferay.fire(
										'openExpressionBuilderModal',
										{
											onSave: handleSave,
											source: values.conditionExpression,
										}
									);
								}}
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
						<FormCustomSelect
							error={errors.objectActionExecutorKey}
							onChange={({value}) => {
								if (value === 'add-object-entry') {
									fetchObjectDefinitions();
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
	
										const object = relationships.find(({id}) => 
											id == objectDefinitionId
										)

										const parameters: ObjectActionParameters = {
												objectDefinitionId,
												predefinedValues: [],
										};

										if (object?.related) {
											parameters.relatedObjectEntries = false;
										}
										
										setValues({parameters});

										fetchObjectFields(objectDefinitionId);
									}}
									options={objectsOptionsList}
									value={
										values.parameters?.objectDefinitionId
									}
								/>
								{(values.parameters?.hasOwnProperty('relatedObjectEntries')) && (
									<>
										<ClayCheckbox
											checked={
												values.parameters
													.relatedObjectEntries === true
											}
											disabled={false}
											label={Liferay.Language.get(
												'also-relate-entries'
											)}
											onChange={({target: {checked}}) => {
												setValues({
													parameters: {
														...values.parameters,
														relatedObjectEntries: checked,
													},
												});
											}}
										/>
										<ClayTooltipProvider>
											<div
												data-tooltip-align="top"
												title={Liferay.Language.get(
													'automatically-relate-object-entries-involved-in-the-action'
												)}
											>
												<ClayIcon
													className=".lfr-object__action-builder-tooltip-icon"
													symbol="question-circle-full"
												/>
											</div>
										</ClayTooltipProvider>
									</>
								)}
							</>
						)}

						{ffNotificationTemplates &&
							values.objectActionExecutorKey ===
								'notificationTemplate' && (
								<FormCustomSelect
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
							predefinedValues={dataSetFields}
							setValues={setValues}
							values={values}
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
	objectDefinitionsRelationshipsURL: string;
	objectActionExecutors: CustomItem[];
	objectActionTriggers: CustomItem[];
	setValues: (values: Partial<ObjectAction>) => void;
	values: Partial<ObjectAction>;
}

interface SelectItem {
	label: string; 
	value: number;
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
