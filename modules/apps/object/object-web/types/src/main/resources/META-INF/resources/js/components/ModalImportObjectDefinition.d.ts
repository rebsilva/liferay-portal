/// <reference types="react" />

interface ModalImportObjectDefinitionProps {
	importObjectDefinitionURL: string;
	handleOnClose: () => void;
	nameMaxLength: string;
	portletNamespace: string;
}
export declare function ModalImportObjectDefinition({
	importObjectDefinitionURL,
	handleOnClose,
	nameMaxLength,
	portletNamespace,
}: ModalImportObjectDefinitionProps): JSX.Element;
export {};
