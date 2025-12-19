/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
import {Outlet, RouterProvider, createHashRouter} from 'react-router';

import {FilterContextProvider} from '../shared/components/filter/FilterContext.es';
import HeaderController from '../shared/components/header/HeaderController.es';
import {AppContextProvider} from './AppContext.es';
import InstanceListPage from './instance-list-page/InstanceListPage.es';
import PerformanceByAssigneePage from './performance-by-assignee-page/PerformanceByAssigneePage.es';
import PerformanceByStepPage from './performance-by-step-page/PerformanceByStepPage.es';
import ProcessListPage from './process-list-page/ProcessListPage.es';
import ProcessMetricsContainer from './process-metrics/ProcessMetricsContainer.es';
import SettingsContainer from './settings/SettingsContainer.es';
import SLAContainer from './sla/SLAContainer.es';
import WorkloadByAssigneePage from './workload-by-assignee-page/WorkloadByAssigneePage.es';

const Layout = () => (
	<>
		<HeaderController basePath="/processes" />

		<div className="portal-workflow-metrics-app">
			<Outlet />
		</div>
	</>
);

const router = createHashRouter([
	{
		children: [
			{
				element: <ProcessListPage />,
				handle: {
					path: '/',
				},
				index: true,
			},
			{
				element: <ProcessListPage />,
				handle: {
					path: '/processes/:pageSize/:page/:sort',
				},
				path: '/processes/:pageSize/:page/:sort',
			},

			/*
			{
				element: <ProcessMetricsContainer />,
				path: '/metrics/:processId',
			},
			{
				element: <InstanceListPage />,
				path: '/instance/:processId/:pageSize/:page/:sort',
			},
			{
				element: <SLAContainer />,
				path: '/sla/:processId',
			},
			{
				element: <PerformanceByStepPage />,
				path: '/performance/step/:processId/:pageSize/:page/:sort',
			},
			{
				element: <WorkloadByAssigneePage />,
				path: '/workload/assignee/:processId/:pageSize/:page/:sort',
			},
			{
				element: <PerformanceByAssigneePage />,
				path: '/performance/assignee/:processId/:pageSize/:page/:sort',
			},
			{
				element: <SettingsContainer />,
				path: '/settings',
			},
			*/
		],
		element: <Layout />,
		path: '/',
	},
]);

const App = (props) => {
	return (
		<AppContextProvider {...props}>
			<FilterContextProvider>
				<RouterProvider router={router} />
			</FilterContextProvider>
		</AppContextProvider>
	);
};

export default App;
