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

import {SetStateAction} from 'react';
import {ViewObjectDefinitionsModals} from './ViewObjectDefinitions';
export declare function deleteObjectDefinition(
	id: number,
	objectDefinitionName: string
): Promise<void>;
export declare function deleteFolder(
	id: number,
	folderName: string
): Promise<void>;
export declare function getFolderActions(
	actions: [],
	selectedFolderName: string,
	setShowModal: (value: SetStateAction<ViewObjectDefinitionsModals>) => void
): (
	| {
			id: string;
			label: string;
			onClick: () => void;
			symbolLeft: string;
			value: string;
	  }
	| {
			label: string;
			onClick: () => void;
			symbolLeft: string;
			value: string;
			id?: undefined;
	  }
)[];
export declare function normalizeName(str: string): string;
