import { TypeDataSchema, type TypeData } from '../z-schemas/apiSchemas';
import { typeColors } from '~/ui/colors';

export type TypeInfo = ReturnType<typeof extractTypeInfo>;

export const extractTypeInfo = (rawData: unknown) => {
	const data: TypeData = TypeDataSchema.parse(rawData);

	const { name, sprites } = data;
	// Try to access generation-viii / sword-shield, fallback to first available
	const generationKeys = Object.keys(sprites);
	const genKey = generationKeys.includes('generation-viii')
		? 'generation-viii'
		: generationKeys[0];

	const versionKeys = Object.keys(sprites[genKey]);
	const versionKey = versionKeys.includes('sword-shield')
		? 'sword-shield'
		: versionKeys[0];

	return {
		name,
		color: typeColors[name],
		sprite: sprites[genKey][versionKey].name_icon,
	};
};
