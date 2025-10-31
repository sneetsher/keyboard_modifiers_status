import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Preferences dialog for the Keyboard Modifiers Status extension.
// It exposes customizable symbols grouped into modifier, accessibility and wrapper categories.
// Each category has some presets and Customized symbols can be saved into "Saved" preset.

const tag = 'KMS-Ext-Prefs:';

export default class Prefs extends ExtensionPreferences {

	fillPreferencesWindow(window) {
		console.debug(`${tag} fillPreferencesWindow() ... in`);

		this._settings = this.getSettings();
		this._schema = this._settings.settings_schema;
		this._window = window;
		this._signalHandlers = [];
		this._pendingSignalUnblocks = new Set();

		// Keys grouped by their meaning in the settings schema.
		const modifiersKeys = ['shift-symbol', 'caps-symbol', 'control-symbol', 'alt-symbol', 'num-symbol', 'scroll-symbol', 'super-symbol', 'altgr-symbol'];
		const accessibilityKeys = ['latch-symbol', 'lock-symbol'];
		const wrapperKeys = ['icon-symbol', 'opening-symbol', 'closing-symbol'];

		// Cache current values from GSettings and previously saved preset.
		this._currentSymbols = this._getSchemaModifierSymbols([].concat(modifiersKeys, accessibilityKeys, wrapperKeys));
		this._savedSymbols = this._settings.get_value('saved-symbols').deep_unpack();
		console.debug(`${tag} this._currentSymbols: ${JSON.stringify(this._currentSymbols)}`);
		console.debug(`${tag} this._savedSymbols: ${JSON.stringify(this._savedSymbols)}`);

		// Keep references to entry widgets for each key to sync changes.
		this._groupEntries = {};
		this._page = new Adw.PreferencesPage();

		// Add groups with presets into the page.
		this._addGroup(
			_('Modifier symbols' ),
			_('Modifier symbols show which modifier keys are currently pressed.'),
			modifiersKeys,
			new Map([
				[_('Mac'), this._getSchemaDefaults(modifiersKeys)], // ['⇧', '⇬', '⋀', '⌥', '①', '◆', '⌘', '⎇']
				[_('PC'),  ['⇧', '⇪', '⌃', '⎇', '⇭', '⇳', '❖', '⎈']],
			])
		);
		this._addGroup(
			_('Accesibility symbols' ),
			_('Accessibility symbols indicate latched or locked key states for assistive input.'),
			accessibilityKeys,
			new Map([
				[_('Degrees'), this._getSchemaDefaults(accessibilityKeys)], // ['\'', '°']
				[_('DotPair'),  ['.', ':']],
			])
		);
		this._addGroup(
			_('Wrapper symbols' ),
			_('Wrapper symbols visually enclose active modifiers to enhance clarity.'),
			wrapperKeys,
			new Map([
				[_('Keyboard'), ['⌨', '', '']],
				[_('Brackets'),  ['', '[', ']']],
			])
		);

		window.add(this._page);
		window.show();

		// Connect the cleanup method to the close-request signal
		window.connect('close-request', () => this._cleanup());

		console.debug(`${tag} fillPreferencesWindow() ... out`);
	}

	// Helper to build a preference group with a presets drop-down and entry fields.
	_addGroup(title, description, keys, presets) {
		console.debug(`${tag} _addGroup() ... in`);
		const group = new Adw.PreferencesGroup({title: title, description: description});

		// Create presets UI elements.
		const headerBox = new Gtk.Box({spacing: 6});
		// Allows to choose from presets, including the Saved preset.
		const presetsDropDown = Gtk.DropDown.new_from_strings([_('Custom')].concat(Array.from(presets.keys()), [_('Saved')]));
		presetsDropDown.valign = Gtk.Align.CENTER;
		// Allows persisting the current custom symbols.
		const saveButton = Gtk.Button.new_with_label(_('Save'));
		saveButton.add_css_class('suggested-action');
		saveButton.valign      = Gtk.Align.CENTER;
		saveButton.visible = false;
		headerBox.append(new Gtk.Label({label: _('Presets')}));
		headerBox.append(presetsDropDown);
		headerBox.append(saveButton);
		group.set_header_suffix(headerBox);

		const savedIndex = presets.size + 1;
		// Helper function to refresh the visibility of the Save button.
		const refreshSaveButton = () => {
			console.debug(`${tag} refreshSaveButton: selected: ${presetsDropDown.selected}, differ: ${this._currentDifferSaved(keys)}`);
			saveButton.visible = presetsDropDown.selected === 0 && this._currentDifferSaved(keys);
		};

		// Helper function to update the presets dropdown, according to currently used symbols.
		const updatePresetsBox = (dropdownNotifyId) => {
			console.debug(`${tag} _addGroup: updatePresetsBox(${dropdownNotifyId})`);
			let foundIdx = 0;
			// Check if current symbols are the same as Saved symbols.
			if (!this._currentDifferSaved(keys)) {
				foundIdx = savedIndex;
			} else {
				// Check if current symbols are the same as any of the hardcoded presets symbols.
				foundIdx = Array.from(presets).findIndex(([_title, preset]) => keys.every((k, i) => this._currentSymbols[k] == preset[i])) + 1;
			}
			if (presetsDropDown.selected != foundIdx) {
				// Dropdown selected item has to change, but first block signals from triggering the update of the dropdown.
				presetsDropDown.block_signal_handler(dropdownNotifyId);
				console.debug(`${tag} updatePresetsBox: set dropdown selected: ${foundIdx}`);
				presetsDropDown.selected = foundIdx;
				// Wait until idle, to not unblock too early. When unblocking without wait, the dropdown update is sometimes triggered.
				this._queueSignalUnblock(presetsDropDown, dropdownNotifyId);
			}
			refreshSaveButton();
		};

		// If dropdown is changed, apply the selected preset.
		const dropdownNotifyId = presetsDropDown.connect('notify::selected', () => {
			const idx = presetsDropDown.selected;
			console.debug(`${tag} presetsDropDown.notify::selected saveButton.visible: ${saveButton.visible}, selected: ${idx}`);
			if (idx === 0) {
				updatePresetsBox(dropdownNotifyId);
				return;
			}
			// Helper function to apply the selected preset.
			const applyPreset = () => {
				const values = idx === savedIndex
					? keys.map(k => this._savedSymbols[k] ?? '')
					: Array.from(presets.values())[idx - 1];
				console.debug(`${tag} presetsDropDown.notify::selected: applyPreset ${idx}: ${values}`);
				// Change each text entry and current settings according to selected preset.
				keys.forEach((k, i) => {
					const val = values[i];
					if (this._groupEntries[k] && this._currentSymbols[k] !== val) {
						this._currentSymbols[k] = val;
						const { entry, changedId } = this._groupEntries[k];
						if (entry) {
							// Block entry update signal before changing, to not trigger update.
							entry.block_signal_handler(changedId);
							console.debug(`${tag} presetsDropDown.notify::selected: applyPreset: change entry text: ${entry.text} -> ${val}`);
							entry.text = val;
							// Wait before unblocking, to not unblock too early and trigger update.
							this._queueSignalUnblock(entry, changedId);
						}
						console.debug(`${tag} presetsDropDown.notify::selected: applyPreset: set ${k} to ${val}`);
						// Save to settings.
						this._settings.set_string(k, val);
					}
				});
				refreshSaveButton();
			};
			// A visible save button indicates unsaved changes when switching from custom preset in dropdown.
			if (saveButton.visible) {
				this._showSwitchDialog(title, keys, presetsDropDown, dropdownNotifyId, applyPreset);
				return;
			}
			applyPreset();
		});
		this._signalHandlers.push({ obj: presetsDropDown, id: dropdownNotifyId });

		// Save symbols to Saved preset when save button is clicked.
		this._signalHandlers.push({
			obj: saveButton,
			id: saveButton.connect('clicked', () => {
				console.debug(`${tag} saveButton:clicked`);
				keys.forEach(k => {
					this._savedSymbols[k] = this._currentSymbols[k];
				});
				console.debug(`${tag} saveButton:clicked: set saved symbols to: ${JSON.stringify(this._savedSymbols)}`);
				this._settings.set_value('saved-symbols', new GLib.Variant('a{ss}', this._savedSymbols));
				updatePresetsBox(dropdownNotifyId);
			})
		});

		// When saved symbols are changed outside from these preferences, update the UI elements.
		this._signalHandlers.push({
			obj: this._settings,
			id: this._settings.connect('changed::saved-symbols', () => {
				console.debug(`${tag} settings:changed::saved-symbols`);
				const newSavedSymbols = this._settings.get_value('saved-symbols').deep_unpack();
				const equal = this._symbolsObjectsEqual(this._savedSymbols, newSavedSymbols);
				console.debug(`${tag} settings:changed::saved-symbols: new ${JSON.stringify(newSavedSymbols)}, equal:${equal}`);
				if (!equal) {
					updatePresetsBox(dropdownNotifyId);
				}
			})
		});

		// Update the newly created dropbox and save button accordingly to current set symbols.
		updatePresetsBox(dropdownNotifyId);

		// Create a row with label and text entry for each symbol settings.
		keys.forEach(key => {
			const schemaKey = this._schema.get_key(key);
			if (!schemaKey) {
				console.warn(`${tag} schema doesn't contain modifier key: ${key}`);
				return;
			}
			// Check for duplicate keys.
			if (this._groupEntries[key]) {
				console.warn(`${tag} addGroup: duplicate key: ${key}`);
				return;
			}
			// Create the row with text entry.
			const entry = new Gtk.Entry({text: _(this._currentSymbols[key])});
			const row = new Adw.ActionRow({title: _(schemaKey.get_summary())});
			row.add_suffix(entry);
			row.activatable_widget = entry;
			group.add(row);
			console.debug(`${tag} _addGroup: add entry ${key}: ${entry.text}`);
			// If entry is changed, change the setting and update presets box.
			const entry_changed_id = entry.connect('changed', () => {
				console.debug(`${tag} _addGroup: entry::changed ${key}: ${this._currentSymbols[key]} -> ${entry.text})`);
				if (this._currentSymbols[key] !== entry.text) {
					this._currentSymbols[key] = entry.text;
					console.debug(`${tag} _addGroup: entry::changed ${key}: set setings key: ${entry.text}`);
					this._settings.set_string(key, entry.text);
					updatePresetsBox(dropdownNotifyId);
				}
			});
			this._groupEntries[key] = {
				entry: entry,
				changedId: entry_changed_id
			};
			this._signalHandlers.push({ obj: entry, id: entry_changed_id });

			// Handle the settings changed outside of this presets and populate UI elements if needed..
			this._signalHandlers.push({
				obj: this._settings,
				id: this._settings.connect(`changed::${key}`, () => {
					console.debug(`${tag} _addGroup: setting::changed::${key}() ... in`);
					const val = this._settings.get_string(key);
					if (this._currentSymbols[key] !== val) {
						console.debug(`${tag} _addGroup: setting::changed::${key} : ${this._currentSymbols[key]} -> ${val})`);
						this._currentSymbols[key] = val;
						// Block entry update signal before changing, to not trigger update.
						entry.block_signal_handler(entry_changed_id);
						console.debug(`${tag} _addGroup: entry::changed ${key}: entry textset ${val}`);
						entry.text = val;
						// Wait before unblocking, to not unblock too early and trigger update.
						this._queueSignalUnblock(entry, entry_changed_id);
						updatePresetsBox(dropdownNotifyId);
					}
					console.debug(`${tag} _addGroup: setting::changed::${key}() ... out`);
				})
			});
		});

		this._page.add(group);
		console.debug(`${tag} _addGroup() ... out`);
	}

	// Create and show an dialog with custom and saved symbols overview and ask if cancel, save & switch or switch without saving.
	_showSwitchDialog(title, keys, presetsDropDown, dropdownNotifyId, applyPreset) {
		console.debug(`${tag} _showSwitchDialog(title: ${title}, ...)`);

		const dialog = new Adw.MessageDialog({
			transient_for: this._window,
			modal: true,
			heading: _(`Unsaved custom symbols`),
			body: _(`Switching presets to`) + `"${presetsDropDown.get_selected_item().get_string()}" ` + _(`will discard your custom symbols. Do you want to save before switching?`),
		});

		// Show table of differing values between current custom symbols and the last saved preset.
		const grid = new Gtk.Grid({
			column_spacing: 12,
			row_spacing: 12,
			halign: Gtk.Align.CENTER,
			hexpand: true,
			margin_top: 12,
			margin_bottom: 12,
			margin_start: 12,
			margin_end: 12,
		});
		// Fill header of the table.
		const headers = [title, _('Custom'), _('Saved')];
		headers.forEach((h, i) => {
			const label = new Gtk.Label({
				label: h,
				halign: Gtk.Align.CENTER,
				hexpand: true,
				width_chars: Math.max(6, h.length),
			});
			label.add_css_class('heading');
			grid.attach(label, i, 0, 1, 1);
		});
		// Fill rows of the table.
		let row = 1;
		keys.forEach(k => {
			const current = this._currentSymbols[k] ?? '';
			const saved = this._savedSymbols[k] ?? '';
			if (current !== saved) {
				const cells = [_(this._schema.get_key(k).get_summary()), current, saved];
				cells.forEach((v, i) => {
					const label = new Gtk.Label({
						label: v,
						halign: Gtk.Align.CENTER,
						hexpand: true,
					});
					if (i === 0)
						label.add_css_class('heading');
					grid.attach(label, i, row, 1, 1);
				});
				row++;
			}
		});
		if (row > 1)
			dialog.set_extra_child(grid);

		// Add response buttons.
		dialog.add_response('cancel', _('Cancel'));
		dialog.add_response('save', _('Save'));
		dialog.add_response('switch', _('Switch'));
		dialog.set_response_appearance('save', Adw.ResponseAppearance.SUGGESTED);
		dialog.set_response_appearance('switch', Adw.ResponseAppearance.DESTRUCTIVE);
		dialog.set_default_response('cancel');
		dialog.set_close_response('cancel');
		this._signalHandlers.push({
			obj: dialog,
			id: dialog.connect('response', (_d, resp) => {
				console.debug(`${tag} _showSwitchDialog: dialog:response: ${resp}`);
				if (resp === 'cancel') {
					// Cancel was clicked, return dropdown to Custom preset, but block signal first to not trigger the update again.
					presetsDropDown.block_signal_handler(dropdownNotifyId);
					presetsDropDown.selected = 0; // Custom preset.
					// Wait before unblocking to not unblock too early and triggering the update.
					this._queueSignalUnblock(presetsDropDown, dropdownNotifyId);
				} else {
					// Save or Switch was clicked. Switch anyways, but if save was clicked, save first.
					if (resp === 'save') {
						keys.forEach(k => {
							this._savedSymbols[k] = this._currentSymbols[k];
						});
						this._settings.set_value('saved-symbols', new GLib.Variant('a{ss}', this._savedSymbols));
					}
					applyPreset();
				}
				dialog.destroy();
			})
		});
		dialog.show();
	}

	// Convenience helpers for manipulating GSettings values.
	_getSchemaDefaults(keys) {
		return keys.map(k => this._settings.get_default_value(k).deep_unpack());
	}
	_getSchemaModifierSymbols(keys) {
		return Object.fromEntries(keys.map(k => [k, this._settings.get_string(k)]));
	}
	_symbolsObjectsEqual(a, b) {
		return Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(k => (b[k] ?? '') === (a[k] ?? ''));
	}
	_currentDifferSaved(keys) {
		// Returns true when the current values diverge from the last saved preset.
		return keys.some(k => this._currentSymbols[k] !== (this._savedSymbols[k] ?? ''));
	}

	// Queue signal handler unblock so idle sources can finish even if window closes.
	_queueSignalUnblock(obj, handlerId, customUnblock = null) {
		if (!obj || !handlerId)
			return;
		if (!this._pendingSignalUnblocks)
			this._pendingSignalUnblocks = new Set();

		const entry = {
			obj,
			handlerId,
			unblockFn: customUnblock ?? (() => obj.unblock_signal_handler(handlerId)),
			sourceId: 0,
		};

		entry.sourceId = GLib.idle_add(null, () => {
			this._pendingSignalUnblocks?.delete(entry);
			try {
				entry.unblockFn?.();
			} catch (e) {
				console.debug(`${tag} _queueSignalUnblock: unblock failed for handler ${handlerId}: ${e}`);
			}
			return GLib.SOURCE_REMOVE;
		});

		if (entry.sourceId)
			this._pendingSignalUnblocks.add(entry);
		else {
			try {
				entry.unblockFn?.();
			} catch (e) {
				console.debug(`${tag} _queueSignalUnblock: immediate unblock failed for handler ${handlerId}: ${e}`);
			}
		}
	}

	// Flush queued unblocks and remove their idle sources during cleanup.
	_drainPendingSignalUnblocks() {
		if (!this._pendingSignalUnblocks?.size)
			return;
		for (const entry of this._pendingSignalUnblocks) {
			if (entry.sourceId)
				GLib.source_remove(entry.sourceId);
			try {
				entry.unblockFn?.();
			} catch (e) {
				console.debug(`${tag} _drainPendingSignalUnblocks: unblock failed for handler ${entry.handlerId}: ${e}`);
			}
		}
		this._pendingSignalUnblocks.clear();
	}

	// Cleanup method to disconnect all signal handlers and nullify object references.
	_cleanup() {
		console.debug(`${tag} _cleanup() ... in`);
		this._drainPendingSignalUnblocks();
		// Disconnect all signal handlers
		if (this._signalHandlers) {
			this._signalHandlers.forEach(({ obj, id }) => {
				if (obj && id) {
					obj.disconnect(id);
				}
			});
			this._signalHandlers = null;
		}
		this._pendingSignalUnblocks = null;

		// Nullify object references
		this._settings = null;
		this._schema = null;
		this._window = null;
		this._currentSymbols = null;
		this._savedSymbols = null;
		this._groupEntries = null;
		this._page = null;
		console.debug(`${tag} _cleanup() ... out`);
	}
}
