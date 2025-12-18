/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
import {Route, Routes} from 'react-router';

import {FilterContextProvider} from '../../shared/components/filter/FilterContext.es';
import {usePageTitle} from '../../shared/hooks/usePageTitle.es';
import IndexesPage from './indexes-page/IndexesPage.es';

export default function SettingsContainer() {
	usePageTitle(Liferay.Language.get('settings'));

	return (
		<FilterContextProvider>
			<Routes>
				<Route element={<IndexesPage />} path="/settings/indexes" />
			</Routes>
		</FilterContextProvider>
	);
}
