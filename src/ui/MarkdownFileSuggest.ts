import { AbstractInputSuggest, App, TFile } from "obsidian";

/**
 * Suggest class for Markdown files
 */
export class MarkdownFileSuggest extends AbstractInputSuggest<TFile> {
	private inputEl: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	/**
	 * Get suggestions based on the query
	 * @param query - Entered query
	 * @returns List of suggestions (max 5 items)
	 */
	getSuggestions(query: string): TFile[] {
		if (!query) {
			return [];
		}

		const lowerCaseQuery = query.toLowerCase().replace(/\\/g, "/");
		const files = this.app.vault.getMarkdownFiles();
		
		return files
			.filter((file) => {
				const path = file.path.toLowerCase();
				const basename = file.basename.toLowerCase();
				return path.includes(lowerCaseQuery) || basename.includes(lowerCaseQuery);
			})
			.sort((a, b) => {
				const aPath = a.path.toLowerCase();
				const bPath = b.path.toLowerCase();
				const aBase = a.basename.toLowerCase();
				const bBase = b.basename.toLowerCase();

				// Priority 1: basename starts with query
				const aBaseStarts = aBase.startsWith(lowerCaseQuery);
				const bBaseStarts = bBase.startsWith(lowerCaseQuery);
				if (aBaseStarts && !bBaseStarts) return -1;
				if (!aBaseStarts && bBaseStarts) return 1;

				// Priority 2: path starts with query
				const aPathStarts = aPath.startsWith(lowerCaseQuery);
				const bPathStarts = bPath.startsWith(lowerCaseQuery);
				if (aPathStarts && !bPathStarts) return -1;
				if (!aPathStarts && bPathStarts) return 1;

				// Priority 3: shorter path length first
				return aPath.length - bPath.length;
			})
			.slice(0, 5);
	}

	/**
	 * Render the suggestion
	 * @param file - Suggestion file
	 * @param el - Element to render into
	 */
	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.createDiv({ text: file.basename, cls: "suggestion-title" });
		el.createEl("small", { text: file.path, cls: "suggestion-content" });
	}

	/**
	 * Handle suggestion selection
	 * @param file - Selected file
	 */
	selectSuggestion(file: TFile): void {
		this.inputEl.value = file.path;
		// Call the trigger method that Obsidian adds to HTMLElement
		// This triggers the Setting's onChange event
		const el = this.inputEl as HTMLElement & { trigger: (name: string) => void };
		if (typeof el.trigger === "function") {
			el.trigger("input");
		}
		this.close();
	}
}
