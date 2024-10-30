const pull = <T>(array: T[], ...values: T[]): T[] => {
	if (array.length === 0) {
		return array;
	}
	const removeSet = new Set(values);
	const filtered = array.filter(item => !removeSet.has(item));
	array.length = 0;
	Array.prototype.push.apply(array, filtered);
	return array;
}

export {
	pull,
}