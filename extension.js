/*
    Keyboard Modifiers Status for gnome-shell
    Copyright (C) 2015  Abdellah Chelli

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//
import St from 'gi://St';
import Clutter from 'gi://Clutter';

// This extension displays the currently active keyboard modifiers in the panel.
// Modifier and wrapper symbols are configurable through GSettings and the provided preferences dialog.

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import GLib from 'gi://GLib';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const tag = 'KMS-Ext:';

// Mapping of logical modifier names to the Clutter.ModifierType constants used by GNOME Shell.
// These values are stable across versions and avoid relying on internal bit ordering.
const MODIFIER_ENUM = {
    SHIFT:   Clutter.ModifierType.SHIFT_MASK,
    LOCK:    Clutter.ModifierType.LOCK_MASK,
    CONTROL: Clutter.ModifierType.CONTROL_MASK,
    MOD1:    Clutter.ModifierType.MOD1_MASK,
    MOD2:    Clutter.ModifierType.MOD2_MASK,
    MOD3:    Clutter.ModifierType.MOD3_MASK,
    MOD4:    Clutter.ModifierType.MOD4_MASK,
    MOD5:    Clutter.ModifierType.MOD5_MASK,
};

const MODIFIER_SYMBOLS = new Map([
    ['shift-symbol', MODIFIER_ENUM.SHIFT],
    ['caps-symbol', MODIFIER_ENUM.LOCK],
    ['control-symbol', MODIFIER_ENUM.CONTROL],
    ['alt-symbol', MODIFIER_ENUM.MOD1],
    ['num-symbol', MODIFIER_ENUM.MOD2],
    ['scroll-symbol', MODIFIER_ENUM.MOD3],
    ['super-symbol', MODIFIER_ENUM.MOD4],
    ['altgr-symbol', MODIFIER_ENUM.MOD5],
]);

// Gnome-shell extension interface
// constructor, enable, disable
export default class KMS extends Extension {

    constructor(metadata) {
        super(metadata);
        // Don't create or initialize anything here. Use enable() method for initialization.
        // Follow the guidelines: https://gjs.guide/extensions/review-guidelines/review-guidelines.html
        console.debug(`${tag} constructor() ... done ${this.metadata.name}`);
    }

    enable() {
        console.debug(`${tag} enable() ... in`);

        // Last retrieved modifier state and previous values for change tracking.
        this._state = 0;
        this._prev_state = null;
        this._latch = 0;
        this._prev_latch = null;
        this._lock = 0;
        this._prev_lock = null;

        // Symbols read from settings describing each modifier and extra wrapper characters.
        this._symModifiers = [];
        this._symLatch = '';
        this._symLock = '';
        this._symIcon = '';  // prefix symbol
        this._symOpening = '';
        this._symClosing = '';

        this._panSide = 2;
        this._indOrder = 0;
        this._registeredPanelSide = null;
        this._registeredIndicatorOrder = null;

        // Create the indicator displayed in the top panel.
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, true);
        this._indicator.reactive = false;
        this._indicator.can_focus = false;
        this._indicator.track_hover = false;
        this._indicatorText = '';
        this._label = new St.Label({ style_class: 'state-label', text: this._indicatorText });
        this._indicator.add_child(this._label);

        // GSettings object for retrieving user preferences.
        this._settings = this.getSettings();
        this._loadSettings();
        this._settingsChangedId = this._settings.connect('changed', (_settings, key) => {
            console.debug(`${tag} Setting changed: ${key}`);
            try {
                this._settings_changed(key);
            } catch (e) {
                console.error(`${tag} Failed to handle setting "${key}": ${e.message}`);
                throw e;
            }
        });

        if (this._settings.get_boolean('overlay-enabled'))
            this._createOverlay();

        this._register_indicator();

        //console.debug(`${tag} Running Wayland: ` + Meta.is_wayland_compositor());

        console.debug(`${tag} Acquiring keyboard seat`);
        try {
            // Gnome-shell v51 removed Clutter.get_default_backend()
            this._seat = global.stage.context.get_backend().get_default_seat();
        } catch (e) {
            console.debug(`${tag} Stage backend seat lookup failed; trying Clutter backend: ${e.message}`);
            try {
                // Clutter 1.24+ exposes the default seat via the backend object.
                this._seat = Clutter.get_default_backend().get_default_seat();
            } catch (e) {
                console.debug(`${tag} Clutter backend seat lookup failed; trying DeviceManager: ${e.message}`);
                // Older versions fall back to DeviceManager.
                try {
                    this._seat = Clutter.DeviceManager.get_default();
                } catch (fallbackError) {
                    console.error(`${tag} Failed to acquire keyboard seat using all available APIs: ${fallbackError.message}`);
                    throw fallbackError;
                }
            }
        }

        if (this._seat) {
            // Listen for changes from the "sticky keys" accessibility feature.
            try {
                this._mods_update_id = this._seat.connect('kbd-a11y-mods-state-changed', this._a11y_mods_update.bind(this));
            } catch (e) {
                console.error(`${tag} Failed to connect keyboard accessibility modifier signal: ${e.message}`);
                throw e;
            }
            console.debug(`${tag} Connected keyboard accessibility modifier signal`);
        } else {
            console.warn(`${tag} No keyboard seat available; latch/lock updates will be unavailable`);
        }

        // Periodically refresh the indicator (200ms).
        this._timeout_id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, this._update.bind(this));
        console.debug(`${tag} Started modifier state polling (200ms)`);

        console.debug(`${tag} enable() ... out`);
    }

    // Tear down everything created in enable().
    disable() {
	/*
	 * Keep active in all modes
	 * This ext shows modifiers status, gnome-shell don't have such
	 * accessibility feature yet. As inside user session, users who
	 * need it, require modifiers status for any keyboard typing.
	 */
        console.debug(`${tag} disable() ... in`);

        if (this._timeout_id) {
            GLib.source_remove(this._timeout_id);
            this._timeout_id = null;
        }

        if (this._seat) {
            if (this._mods_update_id) {
                this._seat.disconnect(this._mods_update_id);
                this._mods_update_id = null;
            }
            this._seat = null;
        };

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
            this._label = null;
            this._indicatorText = '';
        }
        this._destroyOverlay();
        this._registeredPanelSide = null;
        this._registeredIndicatorOrder = null;

        if (this._settings) {
            if (this._settingsChangedId) {
                this._settings.disconnect(this._settingsChangedId);
                this._settingsChangedId = null;
            }
            this._settings = null;
        }
        this._symModifiers = [];
        this._symLatch = '';
        this._symLock = '';
        this._symIcon = '';
        this._symOpening = '';
        this._symClosing = '';

        this._state = 0;
        this._prev_state = null;
        this._latch = 0;
        this._prev_latch = null;
        this._lock = 0;
        this._prev_lock = null;

        console.debug(`${tag} disable() ... out`);
    }

    // Read all user-configurable symbols from GSettings.
    _loadSettings() {
        if (!this._settings) {
            console.warn(`${tag} this._settings is null`);
            return;
        }

        try {
            this._symModifiers = [...MODIFIER_SYMBOLS].map(([key, mask]) => [
                mask,
                this._settings.get_string(key),
            ]);
            this._symLatch = this._settings.get_string('latch-symbol');
            this._symLock = this._settings.get_string('lock-symbol');
            this._symIcon = this._settings.get_string('icon-symbol');
            this._symOpening = this._settings.get_string('opening-symbol');
            this._symClosing = this._settings.get_string('closing-symbol');
            this._panSide = this._settings.get_enum('panel-side');
            this._indOrder = this._settings.get_int('indicator-order');
        } catch (e) {
            console.error(`${tag} Failed to load extension settings: ${e.message}`);
            throw e;
        }
        console.debug(`${tag} Loaded settings: ${this._symModifiers.length} modifier symbols, panel side ${this._panSide}, order ${this._indOrder}`);
    }

    _settings_changed(key) {
        const modifierMask = MODIFIER_SYMBOLS.get(key);
        if (modifierMask !== undefined) {
            const modifier = this._symModifiers.find(([mask]) => mask === modifierMask);
            if (!modifier)
                throw new Error(`No modifier symbol configured for setting "${key}"`);
            modifier[1] = this._settings.get_string(key);
            this._refreshIndicator(true);
            return;
        }

        switch (key) {
            case 'latch-symbol':
                this._symLatch = this._settings.get_string(key);
                break;
            case 'lock-symbol':
                this._symLock = this._settings.get_string(key);
                break;
            case 'icon-symbol':
                this._symIcon = this._settings.get_string(key);
                break;
            case 'opening-symbol':
                this._symOpening = this._settings.get_string(key);
                break;
            case 'closing-symbol':
                this._symClosing = this._settings.get_string(key);
                break;
            case 'panel-side':
                this._panSide = this._settings.get_enum(key);
                this._log_deferred_placement_change();
                return;
            case 'indicator-order':
                this._indOrder = this._settings.get_int(key);
                this._log_deferred_placement_change();
                return;
            case 'panel-indicator-enabled':
                if (this._indicator)
                    this._indicator.visible = this._settings.get_boolean(key);
                return;
            case 'overlay-enabled':
                if (this._settings.get_boolean(key))
                    this._createOverlay();
                else
                    this._destroyOverlay();
                return;
            case 'overlay-x':
            case 'overlay-y':
                this._positionOverlayFromSettings();
                return;
            default:
                return;
        }

        this._refreshIndicator(true);
    }

    _register_indicator() {
        const panelBox = ['left', 'center', 'right'][this._panSide] ?? 'right';
        try {
            Main.panel.addToStatusArea(
                this.uuid,
                this._indicator,
                this._indOrder,
                panelBox
            );
        } catch (e) {
            console.error(`${tag} Failed to register indicator in panel status area (${panelBox}, order ${this._indOrder}): ${e.message}`);
            this._indicator.destroy();
            this._indicator = null;
            this._label = null;
            throw e;
        }

        this._indicator.visible = this._settings.get_boolean('panel-indicator-enabled');
        this._registeredPanelSide = this._panSide;
        this._registeredIndicatorOrder = this._indOrder;
        console.debug(`${tag} Registered indicator in panel status area (${panelBox}, order ${this._indOrder})`);
    }

    _log_deferred_placement_change() {
        if (this._registeredPanelSide !== this._panSide ||
            this._registeredIndicatorOrder !== this._indOrder) {
            console.debug(`${tag} Panel placement preference changed; disable and re-enable the extension to apply it`);
        }
    }

    _createOverlay() {
        if (this._overlay)
            return;

        this._overlay = new St.Widget({
            style_class: 'kms-desktop-overlay',
            reactive: true,
            can_focus: false,
            track_hover: true,
            layout_manager: new Clutter.BinLayout(),
        });
        this._overlay.accessible_name = _('Draggable modifier status overlay');
        this._overlayLabel = new St.Label({
            style_class: 'kms-desktop-overlay-label',
            text: this._indicatorText,
        });
        this._overlay.add_child(this._overlayLabel);

        this._overlay.connect('button-press-event', (_actor, event) => {
            if (event.get_button() !== Clutter.BUTTON_PRIMARY)
                return Clutter.EVENT_PROPAGATE;

            const [pointerX, pointerY] = global.get_pointer();
            this._overlayDragStart = {
                pointerX,
                pointerY,
                x: this._overlay.x,
                y: this._overlay.y,
            };
            this._overlayDragEventId = global.stage.connect('captured-event', (_stage, capturedEvent) =>
                this._handleOverlayDragEvent(capturedEvent));
            return Clutter.EVENT_STOP;
        });

        try {
            Main.layoutManager.addChrome(this._overlay, {
                affectsStruts: false,
                trackFullscreen: false,
            });
        } catch (e) {
            console.error(`${tag} Failed to add desktop overlay to Shell chrome: ${e.message}`);
            this._overlay.destroy();
            this._overlay = null;
            this._overlayLabel = null;
            throw e;
        }

        this._overlayStageSizeId = global.stage.connect('notify::size', () => {
            this._positionOverlayFromSettings();
        });
        this._positionOverlayFromSettings();
        console.debug(`${tag} Created draggable desktop overlay`);
    }

    _handleOverlayDragEvent(event) {
        if (!this._overlayDragStart)
            return Clutter.EVENT_PROPAGATE;

        if (event.type() === Clutter.EventType.MOTION) {
            const [pointerX, pointerY] = global.get_pointer();
            this._setOverlayPosition(
                this._overlayDragStart.x + pointerX - this._overlayDragStart.pointerX,
                this._overlayDragStart.y + pointerY - this._overlayDragStart.pointerY
            );
            return Clutter.EVENT_STOP;
        }

        if (event.type() === Clutter.EventType.BUTTON_RELEASE &&
            event.get_button() === Clutter.BUTTON_PRIMARY) {
            this._overlayDragStart = null;
            this._saveOverlayPosition();
            global.stage.disconnect(this._overlayDragEventId);
            this._overlayDragEventId = null;
            return Clutter.EVENT_STOP;
        }

        return Clutter.EVENT_PROPAGATE;
    }

    _destroyOverlay() {
        if (this._overlayDragEventId) {
            global.stage.disconnect(this._overlayDragEventId);
            this._overlayDragEventId = null;
        }
        this._overlayDragStart = null;

        if (this._overlayStageSizeId) {
            global.stage.disconnect(this._overlayStageSizeId);
            this._overlayStageSizeId = null;
        }

        if (this._overlay) {
            Main.layoutManager.removeChrome(this._overlay);
            this._overlay.destroy();
            this._overlay = null;
            this._overlayLabel = null;
        }
    }

    _overlaySize() {
        const [minWidth, naturalWidth] = this._overlay.get_preferred_width(-1);
        const [minHeight, naturalHeight] = this._overlay.get_preferred_height(-1);
        return [
            Math.max(this._overlay.width, minWidth, naturalWidth),
            Math.max(this._overlay.height, minHeight, naturalHeight),
        ];
    }

    _positionOverlayFromSettings() {
        if (!this._overlay || !this._settings)
            return;

        const [width, height] = this._overlaySize();
        const maxX = Math.max(0, global.stage.width - width);
        const maxY = Math.max(0, global.stage.height - height);
        this._setOverlayPosition(
            this._settings.get_double('overlay-x') * maxX,
            this._settings.get_double('overlay-y') * maxY
        );
    }

    _setOverlayPosition(x, y) {
        if (!this._overlay)
            return;

        const maxX = Math.max(0, global.stage.width - this._overlay.width);
        const maxY = Math.max(0, global.stage.height - this._overlay.height);
        this._overlay.set_position(
            Math.min(Math.max(x, 0), maxX),
            Math.min(Math.max(y, 0), maxY)
        );
    }

    _saveOverlayPosition() {
        if (!this._overlay || !this._settings)
            return;

        const [width, height] = this._overlaySize();
        const maxX = Math.max(1, global.stage.width - width);
        const maxY = Math.max(1, global.stage.height - height);
        const x = this._overlay.x / maxX;
        const y = this._overlay.y / maxY;
        if (this._settings.get_double('overlay-x') !== x)
            this._settings.set_double('overlay-x', x);
        if (this._settings.get_double('overlay-y') !== y)
            this._settings.set_double('overlay-y', y);
    }


    // Called periodically to refresh the label with the current modifier state.
    _update() {
        // `global` is provided by GNOME Shell and exposes Meta.Display APIs.
        // See GNOME Shell architecture overview:
        // https://gjs.guide/extensions/overview/architecture.html#shell
        // Note: modifiers state from get_pointer is the base not the effective
        // On latch active, it is on too. but on lock active, it is off
        // Not the case, using Gdk.Keymap.get_default().get_modifier_state() which
        // is the effective

        // Current pointer position and modifier mask.
        const [x, y, m] = global.get_pointer();

        if (typeof m !== 'undefined') {
            this._state = m;
        };

        this._refreshIndicator();
        return GLib.SOURCE_CONTINUE;
    }

    _refreshIndicator(force = false) {
        const stateChanged = this._state != this._prev_state ||
            this._latch != this._prev_latch ||
            this._lock != this._prev_lock;
        if (!force && !stateChanged)
            return;

        if (stateChanged) {
            console.debug(`${tag} Modifier state changed: ${this._prev_state}->${this._state}, latch ${this._prev_latch}->${this._latch}, lock ${this._prev_lock}->${this._lock}`);
        } else {
            console.debug(`${tag} Refreshing indicator after settings change`);
        }

        this._indicatorText = this._symIcon + this._symOpening;
        // Iterate using the predefined modifier masks
        for (const [mask, sym] of this._symModifiers) {
            // Display the symbol whenever the modifier is active, latched or locked.
            if ((this._state & mask) || (this._latch & mask) || (this._lock & mask))
                this._indicatorText += sym;
            // Append latch/lock indicators if necessary.
            if (this._latch & mask)
                this._indicatorText += this._symLatch;
            if (this._lock & mask)
                this._indicatorText += this._symLock;
        }
        this._indicatorText += this._symClosing;

        this._label.text = this._indicatorText;
        if (this._overlayLabel) {
            this._overlayLabel.text = this._indicatorText;
            this._positionOverlayFromSettings();
        }

        this._prev_state = this._state;
        this._prev_latch = this._latch;
        this._prev_lock = this._lock;
    }

    // Callback for the 'kbd-a11y-mods-state-changed' signal emitted by Clutter.Seat.
    // Updates stored latch and lock states used by the indicator.
    _a11y_mods_update(_seat, latch_new, lock_new) {
        if (typeof latch_new !== 'undefined') {
            this._latch = latch_new;
        };
        if (typeof lock_new !== 'undefined') {
            this._lock = lock_new;
        };
        this._refreshIndicator();
        return GLib.SOURCE_CONTINUE;
    }

}
