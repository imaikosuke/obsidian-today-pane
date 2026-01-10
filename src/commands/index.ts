import { Plugin } from "obsidian";
import { openTodayNoteWithErrorHandling } from "../utils/viewManager";

/**
 * Register plugin commands
 * @param plugin - Plugin instance
 */
export function registerCommands(plugin: Plugin): void {
	// Add a ribbon icon to open today's note
	plugin.addRibbonIcon("calendar-days", "Open today's note", () => {
		void openTodayNoteWithErrorHandling(plugin);
	});

	// Add a command to open today's note
	plugin.addCommand({
		id: "open",
		name: "Open today's note",
		callback: () => {
			void openTodayNoteWithErrorHandling(plugin);
		},
	});
}
