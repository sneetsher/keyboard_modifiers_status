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

//
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import GLib from 'gi://GLib';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

//
const dbg = false;

//TODO: convert into preferrence.
const tag = "KMS-Ext:";
const mod_sym = "⇧⇬⋀⌥①◆⌘⎇";
const latch_sym = "'";
const lock_sym = "◦";
const icon = ""; //"⌨ ";
const opening = ""; //"_";
const closing = ""; //"_";


// Gnome-shell extension interface
// init, enable, disable

export default class KMS extends Extension {

    seat = null;
    button = null;
    label = null;

    state = 0;
    prev_state = 0;
    latch = 0;
    prev_latch = 0;
    lock = 0;
    prev_lock = 0;

    indicator = null;

    timeout_id = null;
    mods_update_id = null;


    constructor(metadata) {
        super(metadata);

        console.debug(`${tag} constructor() ... done ${this.metadata.name}`);
    }

    enable() {
        console.debug(`${tag} enable() ... in`);

        // Initialize properties
        this.seat = null;
        this.button = null;
        this.label = null;

        this.state = 0;
        this.prev_state = 0;
        this.latch = 0;
        this.prev_latch = 0;
        this.lock = 0;
        this.prev_lock = 0;

        this.indicator = null;

        this.timeout_id = null;
        this.mods_update_id = null;

        // Create UI elements
        this.button = new St.Bin({ style_class: 'panel-button',
            reactive: false,
            can_focus: false,
            x_expand: true,
            y_expand: false,
            track_hover: false });
        this.label = new St.Label({ style_class: "state-label", text: "" });
        this.button.set_child(this.label);

        //console.debug(`${tag} Running Wayland: ` + Meta.is_wayland_compositor());

        try {
            this.seat = Clutter.get_default_backend().get_default_seat();
        } catch (e) {
            this.seat = Clutter.DeviceManager.get_default();
        };

        if (this.seat) {
            this.mods_update_id = this.seat.connect("kbd-a11y-mods-state-changed", this._a11y_mods_update.bind(this));
        };

        Main.panel._rightBox.insert_child_at_index(this.button, 0);
        this.timeout_id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, this._update.bind(this));

        console.debug(`${tag} enable() ... out`);
    }


    disable() {
        console.debug(`${tag} disable() ... in`);

        Main.panel._rightBox.remove_child(this.button);

        GLib.source_remove(this.timeout_id);

        if (this.seat && this.mods_update_id) {
            this.seat.disconnect(this.mods_update_id);
        };

        this.button.destroy_all_children();
        this.button.destroy();

        this.seat = null;
        this.button = null;
        this.label = null;

        this.state = 0;
        this.prev_state = 0;
        this.latch = 0;
        this.prev_latch = 0;
        this.lock = 0;
        this.prev_lock = 0;

        this.indicator = null;

        this.timeout_id = null;
        this.mods_update_id = null;

        console.debug(`${tag} disable() ... out`);
    }

    //
    _update() {
        console.debug(`${tag} _update() ... in`);
        //TODO: search for documentation about global
        //Note: modifiers state from get_pointer is the base not the effective
        // On latch active, it is on too. but on lock active, it is off
        // Not the case, using Gdk.Keymap.get_default().get_modifier_state() which
        // is the effective

        const [x, y, m] = global.get_pointer();

        if (typeof m !== 'undefined') {
            this.state = m;
        };

        if ((this.state != this.prev_state) || this.latch != this.prev_latch || this.lock != this.prev_lock) {
            console.debug(`${tag} State changed... ${this.prev_state}, ${this.state}`);
            this.indicator = icon + opening + " ";
            //TODO: don't relay on internal order
            //      use standard pre-defined constant masks
            for (var i=0; i<8; i++ ) {
                if ((this.state & 1<<i) || (this.lock & 1<<i)) {
                    this.indicator += mod_sym[i];
                } else {
                    //indicator += "";
                };
                if (this.latch & 1<<i) {
                    this.indicator += latch_sym + " ";
                } else {
                    //indicator += "";
                };
                if (this.lock & 1<<i) {
                    this.indicator += lock_sym + " ";
                } else {
                    //indicator += "";
                };
            }
            this.indicator += " " + closing;

            this.label.text = this.indicator;

            this.prev_state = this.state;
            this.prev_latch = this.latch;
            this.prev_lock = this.lock;
        }

        console.debug(`${tag} _update() ... out`);
        //return true;
        return GLib.SOURCE_CONTINUE;
    }


    _a11y_mods_update(o, latch_new, lock_new) {
        console.debug(`${tag} _a11y_mods_update() ... in`);
        //TODO: search what's the 1st parameter
        if (typeof latch_new !== 'undefined') {
            this.latch = latch_new;
        };
        if (typeof lock_new !== 'undefined') {
            this.lock = lock_new;
        };
        console.debug(`${tag} latch: ${this.latch}, lock: ${this.lock}`);
        console.debug(`${tag} _a11y_mods_update() ... out`);
        //return true;
        return GLib.SOURCE_CONTINUE;
    }

}
