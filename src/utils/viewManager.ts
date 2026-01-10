import { App, Notice, Plugin, Workspace, TFile } from "obsidian";
import { getTodayDailyNoteFile, getTodayDailyNotePath, isNonTodayDailyNote, getTemplateContent, replaceDateInTemplate } from "./dailyNotes";
import { ensureFolderHierarchy } from "./vault";
import { WorkspaceInternal, LeafInternal } from "../types/obsidian-internal";
import TodayPanePlugin from "../../main";

/**
 * Open today's daily note (with error handling)
 * @param plugin - Plugin instance
 */
export async function openTodayNoteWithErrorHandling(plugin: Plugin): Promise<void> {
	try {
		await openTodayNote(plugin);
	} catch {
		new Notice("Error.");
	}
}

/**
 * Get and process leaves in the right sidebar
 * @param workspaceInternal - Internal workspace object
 * @param rightSidebar - Right sidebar container
 * @param file - File to open
 * @param app - Obsidian application instance
 * @returns Leaf information in the right sidebar
 */
function getRightSidebarLeaves(
	workspaceInternal: Workspace & WorkspaceInternal,
	rightSidebar: { containerEl: HTMLElement },
	file: TFile,
	app: App,
	plugin: TodayPanePlugin
): Promise<{ rightLeafWithSameFile: LeafInternal | null; rightLeaves: LeafInternal[] }> {
	try {
		// Get all leaves (trying multiple methods)
		const allLeaves: LeafInternal[] = workspaceInternal.getLeaves
			? workspaceInternal.getLeaves()
			: workspaceInternal.getLeavesOfType("markdown") as unknown as LeafInternal[];
		
		const container = rightSidebar.containerEl;
		
		if (!container) {
			return Promise.resolve({ rightLeafWithSameFile: null, rightLeaves: [] });
		}
		
		// Filter leaves in the right sidebar
		const initialRightLeaves = allLeaves.filter((leaf) => {
			const leafEl = leaf.containerEl;
			if (!leafEl) return false;
			return container.contains(leafEl);
		});
		
		// Identify the leaf where today's daily note is already open
		const rightLeafWithSameFile = initialRightLeaves.find((leaf) => {
			const currentView = leaf.view;
			if (!currentView) return false;
			
			const currentFile = currentView.file;
			if (!currentFile) return false;
			
			return currentFile.path === file.path;
		}) || null;
		
		// Identify leaves where daily notes other than today's are open
		const leavesToClose: LeafInternal[] = [];
		for (const leaf of initialRightLeaves) {
			const currentView = leaf.view;
			if (!currentView) continue;
			
			const currentFile = currentView.file;
			if (!currentFile) continue;
			
			// Skip if today's daily note is already open
			if (currentFile.path === file.path) continue;
			
			// Close if a daily note other than today's is open
			if (isNonTodayDailyNote(app, currentFile.path, plugin.settings)) {
				leavesToClose.push(leaf);
			}
		}
		
		// Determine which leaf to reuse before closing leaves
		// If only one leaf is to be closed, reuse that leaf
		const leafToReuse = leavesToClose.length === 1 && initialRightLeaves.length === 1
			? leavesToClose[0]
			: null;
		
		if (leafToReuse) {
			return Promise.resolve({ rightLeafWithSameFile, rightLeaves: [leafToReuse] });
		}
		
		// If there are multiple leaves, close the leaves to be closed
		for (const leaf of leavesToClose) {
			try {
				if (leaf.detach) {
					leaf.detach();
				}
			} catch {
				new Notice("Error.");
			}
		}
		
		// Get leaves in the right sidebar again after closing leaves
		if (leavesToClose.length > 0) {
			// Get leaves again
			const allLeavesAfter: LeafInternal[] = workspaceInternal.getLeaves
				? workspaceInternal.getLeaves()
				: workspaceInternal.getLeavesOfType("markdown") as unknown as LeafInternal[];
			
			const rightLeaves = allLeavesAfter.filter((leaf) => {
				const leafEl = leaf.containerEl;
				if (!leafEl) return false;
				return container.contains(leafEl);
			});
			
			return Promise.resolve({ rightLeafWithSameFile, rightLeaves });
		}
		
		return Promise.resolve({ rightLeafWithSameFile, rightLeaves: initialRightLeaves });
	} catch {
		new Notice("Error.");
		return Promise.resolve({ rightLeafWithSameFile: null, rightLeaves: [] });
	}
}

/**
 * Open today's daily note
 * @param plugin - Plugin instance
 * @returns Promise<void>
 */
export async function openTodayNote(plugin: Plugin): Promise<void> {
	const todayPlugin = plugin as TodayPanePlugin;
	const { app } = plugin;
	const { workspace } = app;

	try {
		// Get today's daily note path
		const notePath = getTodayDailyNotePath(app, todayPlugin.settings);

		if (!notePath) {
			return;
		}

		const existingFile = await getTodayDailyNoteFile(app, todayPlugin.settings);

		const file = await (async () => {
			if (existingFile) {
				return existingFile;
			}

			// If the file doesn't exist yet, create it from a template
			const rawTemplateContent = await (async () => {
				try {
					return await getTemplateContent(app, todayPlugin.settings);
				} catch (e) {
					// Abort creation if the template is not found
					const message = e instanceof Error ? e.message : "Template file not found.";
					new Notice(`${message}\nCheck Today Pane → Daily note template.`);
					return null;
				}
			})();

			if (rawTemplateContent === null) {
				return null;
			}
			
			// Replace date field in template with YYYY-MM-DD format
			const today = new Date();
			const dateFormat = "YYYY-MM-DD";
			const templateContent = replaceDateInTemplate(rawTemplateContent, today, dateFormat);
			
			// Create parent folder if it doesn't exist
			const lastSlashIndex = notePath.lastIndexOf("/");
			if (lastSlashIndex !== -1) {
				const parentPath = notePath.substring(0, lastSlashIndex);
				await ensureFolderHierarchy(app, parentPath);
			}

			return await app.vault.create(notePath, templateContent);
		})();

		if (!file) {
			return;
		}

		// Open the file in the entire right sidebar
		// First, get and process leaves in the right sidebar
		const workspaceInternal = workspace as Workspace & WorkspaceInternal;
		
		// Get the right sidebar container (trying multiple methods)
		const rightSplit = workspaceInternal.rightSplit;
		const rightSidebar = workspaceInternal.rightSidebar || workspaceInternal.rightDock || rightSplit;
		const hasRightSidebar = rightSidebar && rightSidebar.containerEl;
		
		// Skip processing if the right sidebar doesn't exist
		if (!hasRightSidebar || !rightSidebar.containerEl) {
			return;
		}
		
		// Get and process leaves in the right sidebar
		// containerEl is guaranteed to exist by the hasRightSidebar check
		const { rightLeafWithSameFile, rightLeaves } = await getRightSidebarLeaves(
			workspaceInternal,
			{ containerEl: rightSidebar.containerEl },
			file,
			app,
			todayPlugin
		);
		
		// If the same file is already open, just activate that leaf
		if (rightLeafWithSameFile) {
			void workspace.revealLeaf(rightLeafWithSameFile as unknown as Parameters<typeof workspace.revealLeaf>[0]);
			return;
		}
		
		// Get existing leaves in the right sidebar
		const rightLeaf: LeafInternal | null = rightLeaves.length > 0
			? (() => {
				try {
					const topLeaf = rightLeaves.reduce((best: { leaf: LeafInternal; top: number } | null, leaf) => {
						const leafEl = leaf.containerEl;
						if (!leafEl) return best;
						
						const rect = leafEl.getBoundingClientRect();
						const isVisible = rect.width > 0 && rect.height > 0;
						const isValidPosition = rect.top > 0 || (rect.top === 0 && rect.width > 0 && rect.height > 0);
						
						if (!isVisible || !isValidPosition) return best;
						
						if (!best || rect.top < best.top) {
							return { leaf, top: rect.top };
						}
						return best;
					}, null);
					
					return topLeaf ? topLeaf.leaf : rightLeaves[0];
				} catch {
					new Notice("Error.");
					return rightLeaves[0];
				}
			})()
			: null;
		
		// If there's no existing leaf, create a new one
		const targetLeaf: Parameters<typeof workspace.revealLeaf>[0] | null = rightLeaf
			? (rightLeaf as unknown as Parameters<typeof workspace.revealLeaf>[0])
			: (() => {
				try {
					// Create a new leaf in the right sidebar
					// getRightLeaf(false) returns an existing leaf or creates a new one if it doesn't exist
					return workspace.getRightLeaf(false);
				} catch {
					new Notice("Could not create a leaf in the right sidebar.");
					return null;
				}
			})();
		
		if (!targetLeaf) {
			return;
		}
		
		// Open the file in the leaf
		await targetLeaf.openFile(file);
		void workspace.revealLeaf(targetLeaf);
	} catch {
		new Notice("Error.");
	}
}
