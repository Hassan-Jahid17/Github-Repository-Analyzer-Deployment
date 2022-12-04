

export function trimString(str: string) {
	return str.trim();
}

export function removeNewLineFromString(str: string) {
	return str.replace(/^\s+|\s+$/g, '');
}

export function clearString(str: string) {
	str = trimString(str);
	str = removeNewLineFromString(str);
	str = trimString(str);
	str = removeNewLineFromString(str);
	return str;
}
