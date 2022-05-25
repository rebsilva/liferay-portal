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

import {ClayCheckbox, ClaySelect, ClaySelectWithOption} from '@clayui/form';
import {fetch} from 'frontend-js-web';
import React, {useMemo, useState} from 'react';

import {FormError} from '../../../hooks/useForm';
import Card from '../../Card/Card';
import CodeMirrorEditor from '../../CodeMirrorEditor';
import CustomSelect, {CustomItem} from '../../Form/CustomSelect/CustomSelect';
import Input from '../../Form/Input';

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
	getObjectDefinitionsRelationshipsURL,
	objectActionExecutors,
	objectActionTriggers,
	setValues,
	values,
}: IProps) {
	const [objectList, setObjectList] = useState<
		Map<number, {label: string; related?: boolean}>
	>();

	const getObjectDefinitionsRelations = async () => {
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

		objectsOptionsList = [
			{
				disabled: true,
				label: Liferay.Language.get('choose-an-object'),
				selected: true,
				value: '',
			},
			{
				label: Liferay.Language.get('related-objects'),
				options: relatedObjects,
				type: 'group',
			},
			{
				label: Liferay.Language.get('non-related-objects'),
				options: nonRelatedObjects,
				type: 'group',
			},
		];

		return objectListMap;
	};

	const handleFetch = async () => {
		setObjectList(await getObjectDefinitionsRelations());
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

			<Card title={Liferay.Language.get('action')}>
				<Card
					title={Liferay.Language.get('then[object]')}
					viewMode="inline"
				>
					<CustomSelect
						error={errors.objectActionExecutorKey}
						onChange={({value}) => {
							if (value === 'add-object-entry') {
								handleFetch();
							}

							setValues({
								objectActionExecutorKey: value,
								parameters: {},
							});
						}}
						options={objectActionExecutors}
						placeholder={Liferay.Language.get('choose-an-action')}
						value={actionExecutors.get(
							values.objectActionExecutorKey ?? ''
						)}
					/>

					{values.objectActionExecutorKey === 'add-object-entry' && (
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
								}}
								options={objectsOptionsList}
								value={values.parameters?.objectDefinitionId}
							/>
							{(values.parameters?.relatedEntries === false ||
								values.parameters?.relatedEntries === true) && (
								<ClayCheckbox
									checked={values.parameters.relatedEntries}
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
				</Card>

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
						onChange={(script) =>
							setValues({
								parameters: {
									...values.parameters,
									script,
								},
							})
						}
						options={{
							mode: 'groovy',
							value: values.parameters?.script ?? '',
						}}
					/>
				)}
			</Card>
		</>
	);
}

interface IProps {
	errors: FormError<ObjectAction & ObjectActionParameters>;
	getObjectDefinitionsRelationshipsURL: string;
	objectActionExecutors: CustomItem[];
	objectActionTriggers: CustomItem[];
	setValues: (values: Partial<ObjectAction>) => void;
	values: Partial<ObjectAction>;
}
