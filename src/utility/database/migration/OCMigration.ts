import OC from '../../../models/OCSchema';
import { connectDB } from '../../../mongoose/connection'; // use your existing connection util

(async () => {
	try {
		await connectDB();

		const OCs = await OC.find();

		for (const oc of OCs) {
			let modified = false;

			if (
				Array.isArray(oc.party) &&
				typeof oc.party[0] === 'object' &&
				oc.party[0] !== null
			) {
				const newParty = oc.party
					.map((entry: any) => entry.pokemon || entry._id)
					.filter(Boolean);

				oc.set('party', newParty); // ✅ proper way to replace a DocumentArray
				modified = true;
			}

			if (
				Array.isArray(oc.storage) &&
				typeof oc.storage[0] === 'object' &&
				oc.storage[0] !== null
			) {
				const newStorage = oc.storage
					.map((entry: any) => entry.pokemon || entry._id)
					.filter(Boolean);

				oc.set('storage', newStorage); // ✅ proper way again
				modified = true;
			}

			if (modified) {
				await oc.save();
				console.log(`✅ Migrated OC: ${oc.name}`);
			} else {
				console.log(`↪️ Already clean: ${oc.name}`);
			}
		}

		console.log('🎉 Migration complete.');
		process.exit(0);
	} catch (err) {
		console.error('❌ Migration failed:', err);
		process.exit(1);
	}
})();
