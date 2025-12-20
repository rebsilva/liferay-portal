/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayLayout from '@clayui/layout';
import ClayList from '@clayui/list';
import React, {useCallback} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router';

import {useFilter} from '../../hooks/useFilter.es';
import {useRoutePath} from '../../hooks/useRoutePath.es';
import {sub} from '../../util/lang.es';
import {compile} from '../../util/path-to-regexp.es';
import {removeFilters, removeItem} from '../filter/util/filterUtil.es';

const ResultsBar = ({children}) => {
	return (
		<nav className="mt-0 subnav-tbar subnav-tbar-primary tbar tbar-inline-xs-down">
			<ClayLayout.ContainerFluid>
				<ClayList.ItemText className="tbar-nav tbar-nav-wrap">
					{children}
				</ClayList.ItemText>
			</ClayLayout.ContainerFluid>
		</nav>
	);
};

const Clear = ({filters = [], filterKeys = [], withoutRouteParams}) => {
	const {dispatch, filterState} = useFilter({withoutRouteParams});
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const path = useRoutePath();

	const handleClearAll = useCallback(() => {
		filters.map((filter) => {
			filter.items.map((item) => {
				item.active = false;
			});
		});

		filterKeys.forEach((key) => {
			delete filterState[key];
		});

		dispatch(filterState);

		if (!withoutRouteParams) {
			const query = removeFilters(location.search);

			const pathname = path
				? compile(path)({...params, page: 1})
				: location.pathname;

			navigate({pathname, search: query}, {replace: true});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterState, location, navigate, params, path, withoutRouteParams]);

	return (
		<ClayList.ItemText className="tbar-item tbar-item-expand">
			<div className="tbar-section text-right">
				<ClayButton
					className="component-link tbar-link"
					displayType="link"
					onClick={handleClearAll}
					small
				>
					{Liferay.Language.get('clear-all')}
				</ClayButton>
			</div>
		</ClayList.ItemText>
	);
};

const FilterItem = ({filter, item, withoutRouteParams}) => {
	const {dispatch, filterState} = useFilter({withoutRouteParams});
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const path = useRoutePath();

	const removeFilter = useCallback(() => {
		item.active = false;

		filterState[filter.key] = filterState[filter.key]
			? filterState[filter.key].filter(({key}) => key !== item.key)
			: undefined;

		dispatch(filterState);

		if (!withoutRouteParams) {
			const query = removeItem(filter.key, item, location.search);

			const pathname = path
				? compile(path)({...params, page: 1})
				: location.pathname;

			navigate({pathname, search: query}, {replace: true});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterState, location, navigate, params, path, withoutRouteParams]);

	return (
		<ClayList.ItemText className="tbar-item">
			<div className="tbar-section">
				<span className="component-label label label-dismissible tbar-label">
					<span className="label-item label-item-expand">
						<div className="label-section">
							<span className="font-weight-normal">{`${filter.name}: `}</span>

							<strong>
								{filter.items[0].key !== 'custom'
									? item.label || item.name
									: item.resultName}
							</strong>
						</div>
					</span>

					{!filter.pinned && (
						<span className="label-item label-item-after">
							<ClayButton
								className="text-dark"
								displayType="unstyled"
								onClick={removeFilter}
							>
								<ClayIcon symbol="times" />
							</ClayButton>
						</span>
					)}
				</span>
			</div>
		</ClayList.ItemText>
	);
};

const FilterItems = ({filters = [], hideFilters = [], ...props}) => {
	return filters
		.filter(
			(filterItem) =>
				!hideFilters.find((hideItem) => filterItem.key === hideItem)
		)
		.map((filter) =>
			filter.items.map((item, index) => (
				<FilterItem
					filter={filter}
					item={item}
					key={index}
					{...props}
				/>
			))
		);
};

const TotalCount = ({search, totalCount}) => {
	let resultText = Liferay.Language.get('x-results-for-x');

	if (totalCount === 1) {
		resultText = Liferay.Language.get('x-result-for-x');
	}

	return (
		<ClayList.ItemText className="tbar-item">
			<div className="tbar-section">
				<span className="component-text text-truncate-inline">
					<span className="text-truncate">
						{sub(resultText, [totalCount, search])}
					</span>
				</span>
			</div>
		</ClayList.ItemText>
	);
};

ResultsBar.Clear = Clear;
ResultsBar.FilterItems = FilterItems;
ResultsBar.TotalCount = TotalCount;

export default ResultsBar;
