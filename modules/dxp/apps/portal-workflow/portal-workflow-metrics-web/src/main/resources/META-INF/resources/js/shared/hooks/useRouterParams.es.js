/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useMemo} from 'react';
import {useLocation, useParams} from 'react-router';

import {getFiltersParam} from '../components/filter/util/filterUtil.es';

const useRouterParams = () => {
	const {search} = useLocation();
	const params = useParams();

	const filters = useMemo(() => getFiltersParam(search), [search]);

	return useMemo(() => ({...params, filters}), [filters, params]);
};

export {useRouterParams};
