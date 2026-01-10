import { App, Vault } from "obsidian";

/**
 * Type definitions for Obsidian internal plugins
 */
export interface InternalPlugins {
	plugins?: {
		dailyNotes?: {
			instance?: DailyNotesInstance;
			enabled?: boolean;
			options?: DailyNoteOptions;
			settings?: DailyNoteOptions;
		};
	};
	getPluginById?: (id: string) => {
		instance?: DailyNotesInstance;
		enabled?: boolean;
		options?: DailyNoteOptions;
		settings?: DailyNoteOptions;
	} | null;
	dailyNotes?: {
		instance?: DailyNotesInstance;
		enabled?: boolean;
		options?: DailyNoteOptions;
		settings?: DailyNoteOptions;
	};
}

/**
 * Type definition for the daily note plugin instance
 */
export interface DailyNotesInstance {
	options?: DailyNoteOptions;
	settings?: DailyNoteOptions;
}

/**
 * Daily note option settings
 */
export interface DailyNoteOptions {
	folder?: string;
	template?: string;
	format?: string;
}

/**
 * Type definition for the Obsidian plugin manager
 */
export interface PluginManager {
	plugins?: {
		[key: string]: {
			settings?: DailyNoteOptions;
			options?: DailyNoteOptions;
		};
	};
}

/**
 * Type definition for vault configuration
 */
export interface VaultConfig {
	dailyNoteFolder?: string;
	dailyNoteFormat?: string;
	dailyNoteTemplate?: string;
}

/**
 * Extended vault type (for internal API access)
 */
export interface ExtendedVault extends Vault {
	config?: VaultConfig;
}

/**
 * Internal API type definition for Workspace
 */
export interface WorkspaceInternal {
	rightSplit?: {
		containerEl?: HTMLElement;
	};
	rightSidebar?: {
		containerEl?: HTMLElement;
	};
	rightDock?: {
		containerEl?: HTMLElement;
	};
	getLeaves?: () => LeafInternal[];
}

/**
 * Internal API type definition for Leaf
 */
export interface LeafInternal {
	containerEl?: HTMLElement;
	view?: {
		file?: {
			path: string;
		};
	};
	detach?: () => void;
}

/**
 * Extended App type (for internal API access)
 * Extend the App type using an intersection type
 */
export type ExtendedApp = App & {
	internalPlugins?: InternalPlugins;
	plugins?: PluginManager;
	vault?: ExtendedVault;
	workspace?: WorkspaceInternal;
};
