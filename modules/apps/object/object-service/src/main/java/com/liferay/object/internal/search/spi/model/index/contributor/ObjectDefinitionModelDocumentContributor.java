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

package com.liferay.object.internal.search.spi.model.index.contributor;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectFolder;
import com.liferay.object.service.ObjectFolderLocalService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.search.Document;
import com.liferay.portal.kernel.search.Field;
import com.liferay.portal.search.spi.model.index.contributor.ModelDocumentContributor;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Carolina Barbosa
 */
@Component(
	property = "indexer.class.name=com.liferay.object.model.ObjectDefinition",
	service = ModelDocumentContributor.class
)
public class ObjectDefinitionModelDocumentContributor
	implements ModelDocumentContributor<ObjectDefinition> {

	@Override
	public void contribute(
		Document document, ObjectDefinition objectDefinition) {

		try {
			ObjectFolder objectFolder =
				_objectFolderLocalService.getObjectFolder(
					objectDefinition.getObjectFolderId());

			document.addKeyword(
				"objectFolderExternalReferenceCode",
				objectFolder.getExternalReferenceCode());

			document.addLocalizedKeyword(
				"localized_label", objectDefinition.getLabelMap(), true, true);
			document.addText(Field.NAME, objectDefinition.getShortName());
			document.remove(Field.USER_NAME);
		}
		catch (PortalException portalException) {
			if (_log.isWarnEnabled()) {
				_log.warn(
					"Unable to index object definition " +
						objectDefinition.getObjectDefinitionId(),
					portalException);
			}
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectDefinitionModelDocumentContributor.class);

	@Reference
	private ObjectFolderLocalService _objectFolderLocalService;

}