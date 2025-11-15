import { App, PluginSettingTab, Setting } from "obsidian";
import TodayPanePlugin from "../../main";
import { TodayPaneSettings } from "../settings";

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

		containerEl.createEl("h2", { text: "Today Pane の設定" });

		new Setting(containerEl)
			.setName("起動時に自動で開く")
			.setDesc("Obsidianを開いたときに、今日のノートを自動で開きます")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoOpenOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.autoOpenOnStartup = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

