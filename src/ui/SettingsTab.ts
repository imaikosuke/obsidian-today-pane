import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import TodayPanePlugin from "../../main";

/**
 * プラグインの設定タブ
 */
export class TodayPaneSettingTab extends PluginSettingTab {
	plugin: TodayPanePlugin;

	constructor(app: App, plugin: TodayPanePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Auto-open on startup")
			.setDesc("Automatically open today's note when Obsidian starts")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoOpenOnStartup)
					.onChange(async (value) => {
						try {
							this.plugin.settings.autoOpenOnStartup = value;
							await this.plugin.saveSettings();
						} catch {
							new Notice("Error.");
						}
					})
			);
	}
}

