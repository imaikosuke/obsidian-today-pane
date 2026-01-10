/**
 * Plugin settings interface
 */
export interface TodayPaneSettings {
	/**
	 * Whether to automatically open today's note when Obsidian starts
	 */
	autoOpenOnStartup: boolean;

	/**
	 * Folder to save daily notes (automatically retrieved if empty)
	 */
	customDailyNoteFolder: string;

	/**
	 * Date format for daily notes (automatically retrieved if empty)
	 */
	customDailyNoteFormat: string;

	/**
	 * Template file for daily notes (automatically retrieved if empty)
	 */
	customDailyNoteTemplate: string;
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: TodayPaneSettings = {
	autoOpenOnStartup: true,
	customDailyNoteFolder: "",
	customDailyNoteFormat: "",
	customDailyNoteTemplate: "",
};
