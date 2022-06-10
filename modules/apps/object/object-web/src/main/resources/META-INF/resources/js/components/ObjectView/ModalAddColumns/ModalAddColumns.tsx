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
import ClayForm, {ClayCheckbox} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayList from '@clayui/list';
import ClayModal from '@clayui/modal';
import {ManagementToolbar} from 'frontend-js-components-web';
import React, {FormEvent, useMemo, useState} from 'react';

import {ManagementToolbarSearch} from '../ManagementToolbarSearch/ManagementToolbarSearch';

import './ModalAddColumns.scss';

function ModalAddColumns<T extends ModalItem>({
	disableRequired,
	getName,
	items,
	observer,
	onClose,
	onSave,
	selected,
}: IProps<T>) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedItems, setSelectedItems] = useState(selected ?? []);

	const filteredItems = useMemo(() => {
		const loweredTerm = searchTerm.toLowerCase();
		const selectedIds = new Set(selectedItems.map(({id}) => id));

		return items
			.filter((item) =>
				getName(item)?.toLowerCase().includes(loweredTerm)
			)
			.map((item) => ({
				...item,
				checked:
					disableRequired && item.required
						? true
						: selectedIds.has(item.id),
			}));
	}, [disableRequired, getName, searchTerm, selectedItems, items]);

	const toggleFieldCheckbox = (id: unknown, checked: boolean) => {
		if (checked) {
			const selected = items.find((item) => item.id === id) as T;

			setSelectedItems([...selectedItems, selected]);
		}
		else {
			setSelectedItems(selectedItems.filter((item) => item.id !== id));
		}
	};

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();

		onSave(selectedItems);
		onClose();
	};

	return (
		<ClayModal
			className="lfr-object__object-view-modal-add-columns"
			observer={observer}
		>
			<ClayModal.Header>
				{Liferay.Language.get('add-columns')}
			</ClayModal.Header>

			<ClayModal.Body>
				<div className="lfr-object__object-view-modal-add-columns-selection-title">
					{Liferay.Language.get('select-the-columns')}
				</div>

				<ManagementToolbar.Container>
					<ManagementToolbar.ItemList>
						<ManagementToolbar.Item>
							<ClayCheckbox
								checked={items.length === selectedItems.length}
								indeterminate={
									selectedItems.length > 0 &&
									items.length !== selectedItems.length
								}
								onChange={() => {
									const requiredFields = selectedItems.filter(
										(item) => item.required
									);
									const selected =
										items.length - requiredFields.length ===
										selectedItems.length -
											requiredFields.length
											? [...requiredFields]
											: [...items];
									setSelectedItems(selected);
								}}
							/>
						</ManagementToolbar.Item>
					</ManagementToolbar.ItemList>

					<ManagementToolbarSearch
						query={searchTerm}
						setQuery={setSearchTerm}
					/>
				</ManagementToolbar.Container>
			</ClayModal.Body>

			<ClayForm onSubmit={(event) => onSubmit(event)}>
				<ClayList className="lfr-object__object-view-modal-add-columns-list">
					{filteredItems.map((item, index) => (
						<ClayList.Item flex key={`list-item-${index}`}>
							<ClayCheckbox
								checked={item.checked}
								disabled={disableRequired && item.required}
								label={getName(item)}
								onChange={() => {
									toggleFieldCheckbox(item.id, !item.checked);
								}}
							/>

							{disableRequired && item.required && (
								<span className="reference-mark">
									<ClayIcon symbol="asterisk" />
								</span>
							)}
						</ClayList.Item>
					))}
				</ClayList>

				<ClayModal.Footer
					last={
						<ClayButton.Group spaced>
							<ClayButton
								displayType="secondary"
								onClick={onClose}
							>
								{Liferay.Language.get('cancel')}
							</ClayButton>

							<ClayButton displayType="primary" type="submit">
								{Liferay.Language.get('save')}
							</ClayButton>
						</ClayButton.Group>
					}
				/>
			</ClayForm>
		</ClayModal>
	);
}

export default ModalAddColumns;

interface ModalItem {
	id?: unknown;
	label: LocalizedValue<string>;
	required?: boolean;
}

interface IProps<T extends ModalItem>
	extends React.HTMLAttributes<HTMLElement> {
	disableRequired?: boolean;
	getName: (label: T) => string;
	items: T[];
	observer: any;
	onClose: () => void;
	onSave: (selected: T[]) => void;
	selected?: T[];
}
