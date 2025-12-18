/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
import {HashRouter as Router, Route, Routes} from 'react-router';

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

const App = (props) => {
	return (
		<Router>
			<AppContextProvider {...props}>
				<FilterContextProvider>
					<HeaderController basePath="/processes" />

					<div className="portal-workflow-metrics-app">
						<Routes>
							<Route element={<ProcessListPage />} path="/" />

							<Route
								element={<ProcessListPage />}
								path="/processes/:pageSize/:page/:sort"
							/>

							<Route
								element={<ProcessMetricsContainer />}
								path="/metrics/:processId"
							/>

							<Route
								element={<InstanceListPage />}
								path="/instance/:processId/:pageSize/:page/:sort"
							/>

							<Route
								element={<SLAContainer />}
								path="/sla/:processId"
							/>

							<Route
								element={<PerformanceByStepPage />}
								path="/performance/step/:processId/:pageSize/:page/:sort"
							/>

							<Route
								element={<WorkloadByAssigneePage />}
								path="/workload/assignee/:processId/:pageSize/:page/:sort"
							/>

							<Route
								element={<PerformanceByAssigneePage />}
								path="/performance/assignee/:processId/:pageSize/:page/:sort"
							/>

							<Route
								element={<SettingsContainer />}
								path="/settings"
							/>
						</Routes>
					</div>
				</FilterContextProvider>
			</AppContextProvider>
		</Router>
	);
};

export default App;
