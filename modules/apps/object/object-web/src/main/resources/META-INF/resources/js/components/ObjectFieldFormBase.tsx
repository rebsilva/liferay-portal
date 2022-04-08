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

import ClayForm, {ClayToggle} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import {fetch} from 'frontend-js-web';
import React, {ChangeEventHandler, ReactNode, useMemo, useState} from 'react';

import useForm, {FormError, invalidateRequired} from '../hooks/useForm';
import {
	normalizeFieldSettings,
	updateFieldSettings,
} from '../utils/fieldSettings';
import {toCamelCase} from '../utils/string';
import CustomSelect from './Form/CustomSelect/CustomSelect';
import Input from './Form/Input';
import Select from './Form/Select';

import './EditObjectField.scss'; // criar um novo para o objectfieldformbase

const REQUIRED_MSG = Liferay.Language.get('required');

const documentsAndMedia = {
	description: Liferay.Language.get(
		'users-can-upload-or-select-existing-files-from-documents-and-media'
	),
	label: Liferay.Language.get(
		'upload-or-select-from-documents-and-media-item-selector'
	),
	value: 'documentsAndMedia',
};

const userComputer = {
	description: Liferay.Language.get(
		'files-can-be-stored-in-an-object-entry-or-in-a-specific-folder-in-documents-and-media'
	),
	label: Liferay.Language.get('upload-directly-from-users-computer'),
	value: 'userComputer',
};

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId() as Liferay.Language.Locale;

const headers = new Headers({
	'Accept': 'application/json',
	'Content-Type': 'application/json',
});

async function fetchPickList() {
	const result = await fetch(
		'/o/headless-admin-list-type/v1.0/list-type-definitions?pageSize=-1',
		{
			headers,
			method: 'GET',
		}
	);

	const {items = []} = (await result.json()) as {
		items: IPickList[] | undefined;
	};

	return items.map(({id, name}) => ({id, name}));
}

export default function ObjectFieldFormBase({
	allowMaxLength,
	charBlacklist,
	charLastBlacklist,
	children,
	disabled,
	errors,
	handleChange,
	namesBlacklist,
	objectField: values,
	objectFieldTypes,
	objectName,
	setValues,
	showDocumentsAndMediaOption,
}: IProps) {

	// const [invalidPathMessage, setInvalidPathMessage] = useState('');

	const validateSourceFolder = (folderPath: string) => {

		// folder name cannot end with invalid last characters

		for (let i = 0; i < charLastBlacklist.length; i++) {
			if (folderPath.endsWith(charLastBlacklist[i])) {
				return false;
			}
		}

		// folder name cannot contain invalid characters

		for (let i = 0; i < charBlacklist.length; i++) {
			if (folderPath.includes(charBlacklist[i])) {
				return false;
			}
		}

		// folder name cannot be a reserved word

		return !folderPath
			.split('/')
			.some((word) => namesBlacklist.includes(word));
	};

	const businessTypeMap = useMemo(() => {
		const businessTypeMap = new Map<string, ObjectFieldType>();

		objectFieldTypes.forEach((type) => {
			businessTypeMap.set(type.businessType, type);
		});

		return businessTypeMap;
	}, [objectFieldTypes]);

	const [pickList, setPickList] = useState<IPickList[]>([]);

	const handleSettingsChange = ({name, value}: ObjectFieldSetting) =>
		setValues({
			objectFieldSettings: updateFieldSettings(
				values.objectFieldSettings,
				{name, value}
			),
		});

	const handleTypeChange = async (option: ObjectFieldType) => {
		if (option.businessType === 'Picklist') {
			setPickList(await fetchPickList());
		}

		let objectFieldSettings: ObjectFieldSetting[] | undefined;

		switch (option.businessType) {
			case 'Attachment':
				objectFieldSettings = [
					{
						name: 'acceptedFileExtensions',
						value: 'jpeg, jpg, pdf, png',
					},
					{
						name: 'fileSource',
						value: showDocumentsAndMediaOption
							? ''
							: 'userComputer',
					},
					{
						name: 'maximumFileSize',
						value: 100,
					},
					{
						name: 'showFilesInDocumentsAndMedia',
						value: false,
					},
				];
				break;

			case 'LongText':
			case 'Text':
				if (allowMaxLength) {
					objectFieldSettings = [
						{
							name: 'showCounter',
							value: false,
						},
					];
				}
				break;

			default:
				break;
		}

		const isSearchableByText =
			option.businessType === 'Attachment' || option.dbType === 'String';

		const indexedAsKeyword = isSearchableByText && values.indexedAsKeyword;

		const indexedLanguageId =
			isSearchableByText && !values.indexedAsKeyword
				? values.indexedLanguageId ?? defaultLanguageId
				: null;

		setValues({
			DBType: option.dbType,
			businessType: option.businessType,
			indexedAsKeyword,
			indexedLanguageId,
			objectFieldSettings,
		});
	};

	return (
		<>
			<Input
				disabled={disabled}
				error={errors.name}
				label={Liferay.Language.get('field-name')}
				name="name"
				onChange={handleChange}
				required
				value={
					values.name ??
					toCamelCase(values.label?.[defaultLanguageId] ?? '')
				}
			/>

			<CustomSelect<ObjectFieldType>
				disabled={disabled}
				error={errors.businessType}
				label={Liferay.Language.get('type')}
				onChange={handleTypeChange}
				options={objectFieldTypes}
				required
				value={businessTypeMap.get(values.businessType ?? '')?.label}
			/>

			{values.businessType === 'Attachment' && (
				<AttachmentSourceProperty
					disabled={disabled}
					error={errors.fileSource}
					objectFieldSettings={
						values.objectFieldSettings as ObjectFieldSetting[]
					}
					objectName={objectName}
					onSettingsChange={handleSettingsChange}
					setValues={setValues}
					showDocumentsAndMediaOption={showDocumentsAndMediaOption}
				/>
			)}

			{values.businessType === 'Picklist' && (
				<Select
					disabled={disabled}
					error={errors.listTypeDefinitionId}
					label={Liferay.Language.get('picklist')}
					onChange={({target: {value}}: any) =>
						setValues({
							listTypeDefinitionId: Number(pickList[value].id),
						})
					}
					options={pickList.map(({name}) => name)}
					required
				/>
			)}
			{children}
			<ClayToggle
				disabled={disabled}
				label={Liferay.Language.get('mandatory')}
				name="required"
				onToggle={(required) => setValues({required})}
				toggled={values.required}
			/>
		</>
	);
}

export function useObjectFieldForm({
	initialValues,
	onSubmit,
}: IUseObjectFieldForm) {
	const validate = (field: Partial<ObjectField>) => {
		const errors: ObjectFieldErrors = {};

		const label = field.label?.[defaultLanguageId];

		const settings = normalizeFieldSettings(field.objectFieldSettings);

		if (invalidateRequired(label)) {
			errors.label = REQUIRED_MSG;
		}

		if (invalidateRequired(field.name ?? label)) {
			errors.name = REQUIRED_MSG;
		}

		if (!field.businessType) {
			errors.businessType = REQUIRED_MSG;
		}
		else if (field.businessType === 'Attachment') {
			if (
				invalidateRequired(
					settings.acceptedFileExtensions as string | undefined
				)
			) {
				errors.acceptedFileExtensions = REQUIRED_MSG;
			}
			if (!settings.fileSource) {
				errors.fileSource = REQUIRED_MSG;
			}
			if (!settings.maximumFileSize) {
				errors.maximumFileSize = REQUIRED_MSG;
			}
			else if (settings.maximumFileSize < 0) {
				errors.maximumFileSize = Liferay.Util.sub(
					Liferay.Language.get(
						'only-integers-greater-than-or-equal-to-x-are-allowed'
					),
					0
				);
			}

			// ver como fazer para usar a função aqui

			// let validacion = validateSourceFolder(settings.storageFolder as string);

			
			// if (settings.showFilesInDocumentsAndMedia &&
			// 	invalidateRequired(settings.storageFolder as string | undefined)
			// ) {
			// 	errors.storageFolder = REQUIRED_MSG;
			// }
			// else if ( settings.showFilesInDocumentsAndMedia &&
			// 	!validateSourceFolder(settings.storageFolder as string)
			// ) {
			// 	errors.storageFolder = Liferay.Language.get(
			// 		'mudar-isso-aqui-depois'
			// 	);
			// }

		}
		else if (
			field.businessType === 'Text' ||
			field.businessType === 'LongText'
		) {
			if (settings.showCounter && !settings.maxLength) {
				errors.maxLength = REQUIRED_MSG;
			}
		}
		else if (field.businessType === 'Picklist') {
			if (!field.listTypeDefinitionId) {
				errors.listTypeDefinitionId = REQUIRED_MSG;
			}
		}

		return errors;
	};

	const {errors, handleChange, handleSubmit, setValues, values} = useForm<
		ObjectField,
		{[key in ObjectFieldSettingName]: any}
	>({
		initialValues,
		onSubmit,
		validate,
	});

	return {errors, handleChange, handleSubmit, setValues, values};
}

function AttachmentSourceProperty({
	disabled,
	error,
	objectFieldSettings,
	objectName,
	onSettingsChange,
	setValues,
	showDocumentsAndMediaOption,
}: IAttachmentSourcePropertyProps) {
	const attachmentSources = showDocumentsAndMediaOption
		? [userComputer, documentsAndMedia]
		: [userComputer];

	const settings = normalizeFieldSettings(objectFieldSettings);

	const attachmentSource = attachmentSources.find(
		({value}) => value === settings.fileSource
	);

	return (
		<>
			<CustomSelect
				disabled={disabled}
				error={error}
				label={Liferay.Language.get('request-files')}
				onChange={({value}) =>
					onSettingsChange({
						name: 'fileSource',
						value,
					})
				}
				options={attachmentSources}
				required
				value={
					showDocumentsAndMediaOption
						? attachmentSource?.label
						: userComputer.label
				}
			/>

			{settings.fileSource === 'userComputer' && (
				<ClayForm.Group className="lfr-objects__edit-object-field-container">
					<ClayToggle
						disabled={disabled}
						label={Liferay.Language.get(
							'show-files-in-documents-and-media'
						)}
						name="showFilesInDocumentsAndMedia"
						onToggle={(value) => {
							const updatedSettings: ObjectFieldSetting[] = objectFieldSettings.filter(
								(setting) => {
									return (
										setting.name !==
											'showFilesInDocumentsAndMedia' &&
										setting.name !== 'storageFolder'
									);
								}
							);

							updatedSettings.push({
								name: 'showFilesInDocumentsAndMedia',
								value,
							});

							if (value) {
								updatedSettings.push({
									name: 'storageFolder',
									value: `/${objectName}`,
								});
							}

							setValues({
								objectFieldSettings: updatedSettings,
							});
						}}
						toggled={!!settings.showFilesInDocumentsAndMedia}
					/>

					<div
						data-tooltip-align="top"
						title={Liferay.Language.get(
							'when-activated-users-can-define-a-folder-within-documents-and-media-to-display-the-files-leave-it-unchecked-for-files-to-be-stored-individually-per-entry'
						)}
					>
						<ClayIcon
							className="lfr-objects__edit-object-field-tooltip-icon"
							symbol="question-circle-full"
						/>
					</div>
				</ClayForm.Group>
			)}
		</>
	);
}

interface IAttachmentSourcePropertyProps {
	disabled?: boolean;
	error?: string;
	objectFieldSettings: ObjectFieldSetting[];
	objectName: string;
	onSettingsChange: (setting: ObjectFieldSetting) => void;
	setValues: (values: Partial<ObjectField>) => void;
	showDocumentsAndMediaOption: boolean;
}
interface IUseObjectFieldForm {
	initialValues: Partial<ObjectField>;
	onSubmit: (field: ObjectField) => void;
}
interface IPickList {
	id: string;
	name: string;
}

interface IProps {
	allowMaxLength?: boolean;
	charBlacklist: string[];
	charLastBlacklist: string[];
	children?: ReactNode;
	disabled?: boolean;
	errors: ObjectFieldErrors;
	handleChange: ChangeEventHandler<HTMLInputElement>;
	namesBlacklist: string[];
	objectField: Partial<ObjectField>;
	objectFieldTypes: ObjectFieldType[];
	objectName: string;
	setValues: (values: Partial<ObjectField>) => void;
	showDocumentsAndMediaOption: boolean;
}

export type ObjectFieldErrors = FormError<
	ObjectField & {[key in ObjectFieldSettingName]: any}
>;
