import { typeEndPoint } from '~/api/endpoints';
import {
	extractTypeInfo,
	type TypeInfo,
} from '~/api/dataExtraction/extractTypeInfo';

export async function getTypeIcon(type: string) {
	const TypeInfo: TypeInfo = extractTypeInfo(await typeEndPoint(type));

	return { sprite: TypeInfo.sprite };
}
