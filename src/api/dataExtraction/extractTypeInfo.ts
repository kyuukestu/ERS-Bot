import { TypeDataSchema, type TypeData } from '../z-schemas/apiSchemas';
import { typeColors } from '~/ui/colors';

export type TypeInfo = ReturnType<typeof extractTypeInfo>;

export const extractTypeInfo = (rawData: unknown) => {
	const data: TypeData = TypeDataSchema.parse(rawData);

	const sprite =
		data.sprites?.['generation-viii']?.['sword-shield']?.name_icon ?? null;

	if (!sprite) {
		throw new Error(`No type icon available for type: ${data.name}`);
	}

	return {
		name: data.name,
		color: typeColors[data.name],
		sprite,
	};
};
