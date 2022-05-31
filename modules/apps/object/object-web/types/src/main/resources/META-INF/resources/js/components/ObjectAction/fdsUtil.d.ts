export declare function onActionDropdownItemClick<T>({
	action,
	itemData,
}: {
	action: FDSAction;
	itemData: T;
}): void;
interface FDSAction {
	target: 'event' | 'async';
	id: string;
}
export {};
