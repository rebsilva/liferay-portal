/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useMemo, useState, isValidElement} from 'react';
/**
 * React Router v7 Data Router utilities.
 * createMemoryRouter is required for hooks like 'useMatches'.
 */
import {
	createMemoryRouter,
	RouterProvider,
} from 'react-router';

import {AppContext} from '../../src/main/resources/META-INF/resources/js/components/AppContext.es';
import {FilterContextProvider} from '../../src/main/resources/META-INF/resources/js/shared/components/filter/FilterContext.es';

/**
 * MockRouter updated for React Router v7 Data Router.
 * This implementation allows tests to use 'useMatches', 'useParams', and 'useLocation'.
 */
const MockRouter = ({
	children,
	initialPath = '/1/20/title%3Aasc',
	initialReindexStatuses = [],
	isAmPm,
	path = '/:page/:pageSize/:sort',
	query = '?backPath=%2F',
	userId = '1',
	userName = 'Test Test',
}) => {
	const [title, setTitle] = useState(null);
	const [reindexStatuses, setReindexStatuses] = useState(
		initialReindexStatuses
	);
	const [fetchDateModified, setFetchDateModified] = useState(false);

	const contextState = useMemo(
		() => ({
			defaultDelta: 20,
			deltaValues: [5, 10, 20, 30, 50, 75],
			fetchDateModified,
			isAmPm,
			maxPages: 3,
			portletNamespace: 'workflow',
			reindexStatuses,
			setFetchDateModified,
			setReindexStatuses,
			setTitle,
			title,
			userId,
			userName,
		}),
		[reindexStatuses, title, fetchDateModified, isAmPm, userId, userName]
	);

	/**
	 * Normalizes 'children' into a valid React element for the route configuration.
	 */
	const content = useMemo(() => {
		if (!children) return null;

		if (isValidElement(children)) {
			return children;
		}

		if (typeof children === 'function') {
			const Component = children;
			return <Component />;
		}

		return children;
	}, [children]);

	/**
	 * Configures the Data Router instance.
	 * Data Routers decouple routing logic from the component tree, enabling Data APIs.
	 */
	const router = useMemo(() => {
		const routes = [
			{
				element: content,
				path: path,
			},
			{
				element: content,
				path: '*',
			},
		];

		return createMemoryRouter(routes, {
			initialEntries: [`${initialPath}${query}`],
		});
	}, [content, path, initialPath, query]);

	return (
		<AppContext.Provider value={contextState}>
			<FilterContextProvider>
				{/* RouterProvider must be used when creating routers with createMemoryRouter */}
				<RouterProvider router={router} />
			</FilterContextProvider>
		</AppContext.Provider>
	);
};

export {MockRouter};