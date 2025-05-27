/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayForm from '@clayui/form';
import ClayIcon from '@clayui/icon';
import {useModal} from '@clayui/modal';
import React, {useState} from 'react';

import {AllowFriendlyURLContainer} from '../../ObjectDetails/AllowFriendlyURLContainer';

import './SeoContainer.scss';
import {useObjectFolderContext} from '../ModelBuilderContext/objectFolderContext';

interface SeoContainerProps {
	onSubmit?: (editedObjectDefinition?: Partial<ObjectDefinition>) => void;
	setValues: (values: Partial<ObjectDefinition>) => void;
	values: Partial<ObjectDefinition>;
}

export function SeoContainer({onSubmit, setValues, values}: SeoContainerProps) {
	const [{modelBuilderModals}, dispatch] = useObjectFolderContext();

	const [visibleModal, setVisibleModal] = useState(false);

	const {observer, onClose} = useModal({
		onClose: () => setVisibleModal(false),
	});

	// lembrar de colocar no final da url o friendly separator

	return (
		<ClayForm.Group>
			<div className="lfr-objects__model-builder-seo-container-header">
				<label className="mb-0">
					{Liferay.Language.get('object-entry-url-separator')}
				</label>

				<p className="mb-1 small text-secondary">
					http://www.liferay.com
				</p>
			</div>

			<ClayButton
				aria-label={Liferay.Language.get('show-actions')}
				className="lfr-objects__model-builder-seo-container-edit-url-button"
				displayType="secondary"
				onClick={() => setVisibleModal(true)}
			>
				<ClayIcon
					className="lfr-objects__model-builder-seo-container-button-icon"
					symbol="link"
				/>

				{Liferay.Language.get('edit-entry-url-separator')}
			</ClayButton>

			<AllowFriendlyURLContainer
				onSubmit={onSubmit}
				setValues={setValues}
				values={values}
			/>
		</ClayForm.Group>
	);
}
