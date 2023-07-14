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
import {ClayDropDownWithItems} from '@clayui/drop-down';
import ClayIcon from '@clayui/icon';
import {getLocalizableLabel} from '@liferay/object-js-components-web';
import React from 'react';

import {defaultLanguageId} from '../../utils/constants';

interface CardHeaderProps {
	erc: string;
	items: IItem[];
	label: LocalizedValue<string>;
	name?: string;
}

export default function CardHeader({erc, items, label, name}: CardHeaderProps) {
	return (
		<div className="lfr__object-web-view-object-definitions-card-header">
			<div>
				<div className="d-flex lfr__object-web-view-object-definitions-title-kebab">
					<h3 className="mb-0">
						{getLocalizableLabel(defaultLanguageId, label, name)}
					</h3>

					<ClayDropDownWithItems
						className="lfr__object-web-view-object-definitions-actions"
						items={items}
						trigger={
							<ClayButton
								aria-label={Liferay.Language.get(
									'folder-actions'
								)}
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

					<strong className="ml-2">{erc}</strong>

					<span
						className="ml-3 text-secondary"
						title={Liferay.Language.get(
							'unique-key-for-referencing-the-picklist-definition'
						)}
					>
						<ClayIcon symbol="question-circle" />
					</span>
				</div>
			</div>

			<ClayButton
				aria-label={Liferay.Language.get('view-in-model-builder')}
				className="lfr__object-web-view-object-definitions-view-in-model-builder-button"
				displayType="secondary"
			>
				{Liferay.Language.get('view-in-model-builder')}
			</ClayButton>
		</div>
	);
}
