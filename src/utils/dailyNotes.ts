import { App, Notice, TFile } from "obsidian";
import { ExtendedApp, DailyNoteOptions, DailyNotesInstance } from "../types/obsidian-internal";
import { TodayPaneSettings } from "../settings";

/**
 * Daily note settings information
 */
export interface DailyNoteSettings {
	folder: string;
	template: string;
	format: string;
}

/**
 * Get settings from daily note options
 * @param options - Daily note options
 * @returns Settings information, or null
 */
function extractSettingsFromOptions(options: DailyNoteOptions | undefined): DailyNoteSettings | null {
	if (!options) {
		return null;
	}

	return {
		folder: options.folder || "",
		template: options.template || "",
		format: options.format || "YYYY-MM-DD",
	};
}

/**
 * Get settings from daily note plugin object
 * @param dailyNotesPlugin - Daily note plugin object
 * @returns Settings information, or null
 */
function extractSettingsFromPlugin(
	dailyNotesPlugin: {
		instance?: DailyNotesInstance;
		options?: DailyNoteOptions;
		settings?: DailyNoteOptions;
	} | null
): DailyNoteSettings | null {
	if (!dailyNotesPlugin) {
		return null;
	}

	// Try to get from instance
	if (dailyNotesPlugin.instance) {
		const options = dailyNotesPlugin.instance.options || dailyNotesPlugin.instance.settings;
		if (options) {
			const settings = extractSettingsFromOptions(options);
			if (settings) {
				return settings;
			}
		}
	}

	// Try to get from the plugin object itself
	if (dailyNotesPlugin.options || dailyNotesPlugin.settings) {
		const settings = extractSettingsFromOptions(
			dailyNotesPlugin.options || dailyNotesPlugin.settings
		);
		if (settings) {
			return settings;
		}
	}

	return null;
}

/**
 * Get daily note settings from Obsidian internal plugins
 * @param app - Obsidian application instance
 * @returns Settings information, or null
 */
function getSettingsFromInternalPlugins(app: ExtendedApp): DailyNoteSettings | null {
	try {
		const internalPlugins = app.internalPlugins;
		
		if (!internalPlugins) {
			return null;
		}

		// Method 1: Get from plugins.dailyNotes
		const plugins = internalPlugins.plugins;
		if (plugins?.dailyNotes) {
			const settings = extractSettingsFromPlugin(plugins.dailyNotes);
			if (settings) {
				return settings;
			}
		}

		// Method 2: Use getPluginById
		if (internalPlugins.getPluginById) {
			const settings = extractSettingsFromPlugin(
				internalPlugins.getPluginById("daily-notes")
			);
			if (settings) {
				return settings;
			}
		}

		// Method 3: Direct access
		if (internalPlugins.dailyNotes) {
			const settings = extractSettingsFromPlugin(internalPlugins.dailyNotes);
			if (settings) {
				return settings;
			}
		}

		return null;
	} catch {
		new Notice("Error.");
		return null;
	}
}

/**
 * Get daily note settings from community plugins
 * @param app - Obsidian application instance
 * @returns Settings information, or null
 */
function getSettingsFromCommunityPlugins(app: ExtendedApp): DailyNoteSettings | null {
	const plugins = app.plugins;
	if (!plugins?.plugins) {
		return null;
	}

	const dailyNotes = plugins.plugins["daily-notes"];
	if (!dailyNotes) {
		return null;
	}

	return extractSettingsFromOptions(dailyNotes.settings || dailyNotes.options);
}

/**
 * Get daily note settings from vault configuration
 * @param app - Obsidian application instance
 * @returns Settings information, or null
 */
function getSettingsFromVaultConfig(app: ExtendedApp): DailyNoteSettings | null {
	const vault = app.vault;
	if (!vault?.config) {
		return null;
	}

	const config = vault.config;
	if (!config.dailyNoteFolder && !config.dailyNoteFormat) {
		return null;
	}

	return {
		folder: config.dailyNoteFolder || "",
		template: config.dailyNoteTemplate || "",
		format: config.dailyNoteFormat || "YYYY-MM-DD",
	};
}

/**
 * Get daily note settings from Obsidian
 * Try multiple methods in order to get settings.
 * If there are custom settings in plugin settings, apply them preferentially.
 * @param app - Obsidian application instance
 * @param pluginSettings - Plugin settings (optional)
 * @returns Settings information, or null (if not found)
 */
export function getDailyNoteSettings(app: App, pluginSettings?: TodayPaneSettings): DailyNoteSettings | null {
	const extendedApp = app as ExtendedApp;
	let settings: DailyNoteSettings | null = null;

	// Method 1: Get from internal plugin
	const internalSettings = getSettingsFromInternalPlugins(extendedApp);
	if (internalSettings) {
		settings = internalSettings;
	}

	// Method 2: Get from community plugin
	if (!settings) {
		const communitySettings = getSettingsFromCommunityPlugins(extendedApp);
		if (communitySettings) {
			settings = communitySettings;
		}
	}

	// Method 3: Get from vault configuration (fallback)
	if (!settings) {
		const vaultSettings = getSettingsFromVaultConfig(extendedApp);
		if (vaultSettings) {
			settings = vaultSettings;
		}
	}

	// Default if no settings are found
	if (!settings) {
		settings = {
			folder: "",
			template: "",
			format: "YYYY-MM-DD",
		};
	}

	// Overwrite with plugin settings
	if (pluginSettings) {
		if (pluginSettings.customDailyNoteFolder !== "") {
			settings.folder = pluginSettings.customDailyNoteFolder;
		}
		if (pluginSettings.customDailyNoteFormat !== "") {
			settings.format = pluginSettings.customDailyNoteFormat;
		}
		if (pluginSettings.customDailyNoteTemplate !== "") {
			settings.template = pluginSettings.customDailyNoteTemplate;
		}
	}

	return settings;
}

/**
 * Format date for daily note
 * @param date - Date to format
 * @param format - Format string (e.g., "YYYY-MM-DD", "YYYY/MM/DD", "YYYY/MM/YYYY-MM-DD")
 * @returns Formatted date string
 */
export function formatDateForDailyNote(date: Date, format: string): string {
	const year = String(date.getFullYear());
	const yearShort = year.slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const monthNoPad = String(date.getMonth() + 1);
	const day = String(date.getDate()).padStart(2, "0");
	const dayNoPad = String(date.getDate());

	// Replace from longest patterns (YYYY → YY → MM → M → DD → D)
	// Replacing YYYY first prevents incorrect replacement of YY
	// Replacing MM and DD first prevents incorrect replacement of single M or D
	return format
		.replace(/YYYY/g, year)
		.replace(/MM/g, month)
		.replace(/DD/g, day)
		.replace(/YY/g, yearShort)
		.replace(/M/g, monthNoPad)
		.replace(/D/g, dayNoPad);
}

/**
 * Get daily note file path for a specified date
 * @param app - Obsidian application instance
 * @param date - Date
 * @param pluginSettings - Plugin settings (optional)
 * @returns File path, or null (if settings not found)
 */
export function getDailyNotePathForDate(app: App, date: Date, pluginSettings?: TodayPaneSettings): string | null {
	const settings = getDailyNoteSettings(app, pluginSettings);
	if (!settings) {
		return null;
	}

	const formattedDate = formatDateForDailyNote(date, settings.format);
	
	const folder = settings.folder || "";
	const path = folder ? `${folder}/${formattedDate}.md` : `${formattedDate}.md`;
	
	return path;
}

/**
 * Get file path for today's daily note
 * @param app - Obsidian application instance
 * @param pluginSettings - Plugin settings (optional)
 * @returns File path, or null (if settings not found)
 */
export function getTodayDailyNotePath(app: App, pluginSettings?: TodayPaneSettings): string | null {
	const today = new Date();
	return getDailyNotePathForDate(app, today, pluginSettings);
}

/**
 * Check if file path is a daily note other than today's
 * @param app - Obsidian application instance
 * @param filePath - File path to check
 * @param pluginSettings - Plugin settings (optional)
 * @returns true if it's a daily note other than today's, false otherwise
 */
export function isNonTodayDailyNote(app: App, filePath: string, pluginSettings?: TodayPaneSettings): boolean {
	const settings = getDailyNoteSettings(app, pluginSettings);
	if (!settings) {
		return false;
	}

	const todayPath = getTodayDailyNotePath(app, pluginSettings);
	if (!todayPath) {
		return false;
	}

	// Return false if it's today's daily note
	if (filePath === todayPath) {
		return false;
	}

	// Check daily note folder
	const folder = settings.folder || "";
	const format = settings.format || "YYYY-MM-DD";

	// Get filename (without extension)
	const nameWithoutExt: string = (() => {
		if (folder) {
			const folderPrefix = folder.endsWith("/") ? folder : `${folder}/`;
			// Check if file path is within the daily note folder
			if (!filePath.startsWith(folderPrefix)) {
				return "";
			}
			// Get filename without the folder part
			const fileName = filePath.substring(folderPrefix.length);
			return fileName.replace(/\.md$/, "");
		} else {
			// If no folder is set, get the filename
			const fileName = filePath.split("/").pop() || "";
			return fileName.replace(/\.md$/, "");
		}
	})();

	// Generate daily note pattern based on format
	// Convert format string to regex pattern
	// YYYY -> \d{4}, YY -> \d{2}, MM -> \d{1,2}, M -> \d{1,2}, DD -> \d{1,2}, D -> \d{1,2}
	const pattern = format
		.replace(/YYYY/g, "\\d{4}")
		.replace(/YY(?![Y])/g, "\\d{2}")
		.replace(/MM(?![M])/g, "\\d{1,2}")
		.replace(/M(?![M])/g, "\\d{1,2}")
		.replace(/DD(?![D])/g, "\\d{1,2}")
		.replace(/D(?![D])/g, "\\d{1,2}")
		.replace(/([-/_.])/g, "\\$1"); // Escape separators (-, /, _, etc.)
	
	// Check if it matches the pattern
	const regex = new RegExp(`^${pattern}$`);
	return regex.test(nameWithoutExt);
}

/**
 * Get today's daily note file
 * @param app - Obsidian application instance
 * @param pluginSettings - Plugin settings (optional)
 * @returns File object, or null (if file does not exist)
 */
export function getTodayDailyNoteFile(app: App, pluginSettings?: TodayPaneSettings): Promise<TFile | null> {
	const path = getTodayDailyNotePath(app, pluginSettings);
	if (!path) {
		return Promise.resolve(null);
	}

	try {
		const file = app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			return Promise.resolve(file);
		}
	} catch {
		new Notice("Error.");
	}

	return Promise.resolve(null);
}

/**
 * Get content of the template file
 * @param app - Obsidian application instance
 * @param pluginSettings - Plugin settings (optional)
 * @returns Template file content, or empty string (if template does not exist)
 */
export async function getTemplateContent(app: App, pluginSettings?: TodayPaneSettings): Promise<string> {
	const settings = getDailyNoteSettings(app, pluginSettings);
	if (!settings || !settings.template) {
		return "";
	}

	// Get template file path
	const initialTemplatePath = settings.template;
	
	// Check if template file exists (search by original path first)
	const initialTemplateFile = app.vault.getAbstractFileByPath(initialTemplatePath);
	
	// If not found, search again with .md extension
	const templateFile = (() => {
		if (initialTemplateFile instanceof TFile) {
			return initialTemplateFile;
		}
		
		const templatePathWithExt = initialTemplatePath.endsWith(".md") 
			? initialTemplatePath 
			: `${initialTemplatePath}.md`;
		const file = app.vault.getAbstractFileByPath(templatePathWithExt);
		
		if (file instanceof TFile) {
			return file;
		}
		
		return initialTemplateFile;
	})();
	
	if (!(templateFile instanceof TFile)) {
		// Throw error if custom setting is specified but not found
		if (pluginSettings?.customDailyNoteTemplate) {
			throw new Error(`Template file not found: ${initialTemplatePath}`);
		}
		return "";
	}

	try {
		// Read template file content
		const content = await app.vault.read(templateFile);
		return content;
	} catch {
		new Notice("Error reading template file.");
		return "";
	}
}

/**
 * Replace date field in template frontmatter with dynamic date
 * @param templateContent - Template content
 * @param date - Date to replace with
 * @param dateFormat - Date format (e.g., "YYYY-MM-DD")
 * @returns Replaced template content
 */
export function replaceDateInTemplate(
	templateContent: string,
	date: Date,
	dateFormat: string
): string {
	if (!templateContent) {
		return templateContent;
	}

	// Detect start and end of frontmatter
	const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = templateContent.match(frontMatterRegex);
	
	if (!match) {
		// Return as is if no frontmatter
		return templateContent;
	}

	const frontMatter = match[1];
	const restOfContent = templateContent.substring(match[0].length);

	// Format date
	const formattedDate = formatDateForDailyNote(date, dateFormat);

	// Detect and replace date field
	// Pattern: date: (any value) or date:(any value)
	// Process line by line
	const lines = frontMatter.split('\n');
	
	const { newLines } = lines.reduce((acc, line, _index) => {
		// Detect line starting with date: (allows spaces before/after colon)
		const dateLineMatch = line.match(/^(\s*)date\s*:\s*(.*)$/);
		if (dateLineMatch && !acc.dateReplaced) {
			// Replace while maintaining indentation
			const indent = dateLineMatch[1];
			return {
				newLines: [...acc.newLines, `${indent}date: ${formattedDate}`],
				dateReplaced: true
			};
		} else {
			return {
				newLines: [...acc.newLines, line],
				dateReplaced: acc.dateReplaced
			};
		}
	}, { newLines: [] as string[], dateReplaced: false });

	const newFrontMatter = newLines.join('\n');

	// Combine frontmatter and remaining content
	return `---\n${newFrontMatter}\n---\n${restOfContent}`;
}
