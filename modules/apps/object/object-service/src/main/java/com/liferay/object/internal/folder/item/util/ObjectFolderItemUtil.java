/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.folder.item.util;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.relationship.util.ObjectRelationshipUtil;

/**
 * @author Murilo Stodolni
 */
public class ObjectFolderItemUtil {

	public static boolean hasOnlyLinkedRelatedObjectDefinition(
		ObjectDefinition objectDefinition, long objectFolderId) {

		for (ObjectDefinition relatedObjectDefinition :
				ObjectRelationshipUtil.getRelatedObjectDefinitions(
					objectDefinition)) {

			if (!relatedObjectDefinition.isLinkedToObjectFolder(
					objectFolderId)) {

				return false;
			}
		}

		return true;
	}

}