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
import React from 'react';

import './Toggle.scss';

export default function Toggle({
	className,
	disabled,
	label,
	name,
	onToggle,
	toggled,
	tooltip,
	tooltipAlign,
}: IProps) {
	return (
		<ClayForm.Group className={className}>
			<ClayToggle
				disabled={disabled}
				label={label}
				name={name}
				onToggle={onToggle}
				toggled={toggled}
			/>
			&nbsp;
			{tooltip && (
				<span data-tooltip-align={tooltipAlign} title={tooltip}>
					<ClayIcon
						className="lfr-objects__toggle-tooltip-icon"
						symbol="question-circle-full"
					/>
				</span>
			)}
		</ClayForm.Group>
	);
}

interface IProps {
	className?: string;
	disabled?: boolean;
	label: string;
	name: string;
	onToggle?: (val: boolean) => void;
	required?: boolean;
	toggled?: boolean;
	tooltip?: string;
	tooltipAlign?: 'bottom' | 'left' | 'right' | 'top';
}
