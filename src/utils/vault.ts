import { App, TFolder, Notice } from "obsidian";

/**
 * フォルダ階層を再帰的に作成する（冪等）
 * @param app - Obsidianアプリケーションインスタンス
 * @param folderPath - 作成するフォルダパス（例: "daily/2026/01"）
 * @returns Promise<void>
 */
export async function ensureFolderHierarchy(app: App, folderPath: string): Promise<void> {
	if (!folderPath || folderPath === "/") {
		return;
	}

	const normalizedPath = folderPath.replace(/\\/g, "/").replace(/\/+$/, "");
	const parts = normalizedPath.split("/");
	let currentPath = "";

	for (const part of parts) {
		if (!part) continue;
		
		currentPath = currentPath ? `${currentPath}/${part}` : part;
		const folder = app.vault.getAbstractFileByPath(currentPath);

		if (!folder) {
			try {
				await app.vault.createFolder(currentPath);
			} catch {
				const message = `Could not create folder: ${currentPath}`;
				new Notice(message);
				throw new Error(message);
			}
		} else if (!(folder instanceof TFolder)) {
			const message = `A file already exists at folder path: ${currentPath}`;
			new Notice(message);
			throw new Error(message);
		}
	}
}
