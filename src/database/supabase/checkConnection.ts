// database/checkConnection.ts

import { supabase } from "./supabase";

export async function checkDatabase() {
	const { error } = await supabase
		.from("characters")
		.select("id")
		.limit(1);

	if (error) {
		console.error("Supabase connection failed:", error);
		return false;
	}

	console.log("Supabase connection successful.");
	return true;
}
