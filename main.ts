import { Notice, Plugin } from "obsidian";
import { registerCommands } from "./src/commands";
import { openTodayNoteWithErrorHandling } from "./src/utils/viewManager";
import { TodayPaneSettings, DEFAULT_SETTINGS } from "./src/settings";
import { TodayPaneSettingTab } from "./src/ui/SettingsTab";

/**
 * Plugin to display today's note
 */
export default class TodayPanePlugin extends Plugin {
	settings!: TodayPaneSettings;

	/**
	 * Save settings
 */
	async saveSettings(): Promise<void> {
		try {
			await this.saveData(this.settings);
		} catch {
			new Notice("Error.");
		}
	}

	/**
	 * Called when the plugin is loaded
 */
	async onload(): Promise<void> {
		try {
			// Load settings
			const loadedData = (await this.loadData()) as Partial<TodayPaneSettings> | null;
			this.settings = { ...DEFAULT_SETTINGS, ...loadedData };

			// Add settings tab
			this.addSettingTab(new TodayPaneSettingTab(this.app, this));

			// Register commands
			registerCommands(this);
			
			// Only if the setting is enabled, open today's note after the workspace layout is ready
			// This ensures it opens correctly even when Obsidian restarts
			if (this.settings.autoOpenOnStartup) {
				this.app.workspace.onLayoutReady(async () => {
					await openTodayNoteWithErrorHandling(this);
				});
			}
		} catch {
			new Notice("Error.");
		}
	}

}
