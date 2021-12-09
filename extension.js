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
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
//const Meta = imports.gi.Meta;

//
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

//
const dbg = false;

//
const tag = "KMS-Ext:";
const mod_sym = "⇧⇬⋀⌥①◆⌘⎇";
const latch_sym = "'";
const lock_sym = "◦";
const icon = ""; //"⌨ ";
const opening = ""; //"_";
const closing = ""; //"_";

//
let button, label;
let indicator;
let state, prev_state;
let seat;
let latch, lock;
let x, y, m;
let timeout_id, mods_update_id;


//
function _update() {
    //if(dbg) log(`${tag} _update() ... in`);
    //TODO: search for documentation about global
    //Note: modifiers state from get_pointer is the base not the effective
    // On latch active, it is on too. but on lock active, it is off
    // Not the case, using Gdk.Keymap.get_default().get_modifier_state() which
    // is the effective
    [x, y, m] = global.get_pointer();
    if (typeof m !== 'undefined') {
        state = m;
    };
    if ((state != prev_state) || latch || lock) {
        //if(dbg) log(`${tag} State changed... ${prev_state}, ${state}`);
        indicator = icon + opening + " ";
        //TODO: don't relay on internal order
        //      use standard pre-defined constant masks
        for (var i=0; i<8; i++ ) {
            if ((state & 1<<i) || (lock & 1<<i)) {
                indicator += mod_sym[i];
            } else {
                //indicator += "";
            };
            if (latch & 1<<i) {
                indicator += latch_sym + " ";
            } else {
                //indicator += "";
            };
            if (lock & 1<<i) {
                indicator += lock_sym + " ";
            } else {
                //indicator += "";
            };
        }
        indicator += " " + closing;
        label.text = indicator;
        prev_state = state;
    }
    //if(dbg) log(`${tag} init() ... out`);
    return true;
}


function _a11y_mods_update(o, latch_new, lock_new) {
    //if(dbg) log(`${tag} _a11y_mods_update() ... in`);
    //TODO: search what's the 1st parameter
    if (typeof latch_new !== 'undefined') {
        latch = latch_new;
    };
    if (typeof lock_new !== 'undefined') {
        lock = lock_new;
    };
    //if(dbg) log(`${tag} latch: ${latch}, lock: ${lock});
    //if(dbg) log(`${tag} _a11y_mods_update() ... out`);
    return true;
}

// Gnome-shell extension interface
// init, enable, disable

function init() {
    if(dbg) log(`${tag} init() ... in - ${Me.metadata.name}`);
    if(dbg) log(`${tag} init() ... out`);
}


function enable() {
    if(dbg) log(`${tag} enable() ... in`);
    
    //
    state = 0;
    state_prev = 0;
    latch = 0;
    lock = 0;
    timeout_id = null;
    mods_update_id = null;
    
    //
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: false,
                          can_focus: false,
                          x_expand: true,
                          y_expand: false,
                          track_hover: false });
    label = new St.Label({ style_class: "state-label", text: "" });
    button.set_child(label);
    
    //if(dbg) log(`${tag} Running Wayland: ` + Meta.is_wayland_compositor());
    
    try {
        seat = Clutter.get_default_backend().get_default_seat();
    } catch (e) {
        seat = Clutter.DeviceManager.get_default();
    };
    
    if (seat) {
        mods_update_id = seat.connect("kbd-a11y-mods-state-changed", _a11y_mods_update);
    };
    
    Main.panel._rightBox.insert_child_at_index(button, 0);
    timeout_id = Mainloop.timeout_add(200, _update );
    
    if(dbg) log(`${tag} enable() ... out`);
}


function disable() {
    if(dbg) log(`${tag} disable() ... in`);
    
    Main.panel._rightBox.remove_child(button);
    
    Mainloop.source_remove(timeout_id);
    
    if (seat && mods_update_id) {
        seat.disconnect(mods_update_id);
    };
    
    button.destroy_all_children();
    button.destroy();
    button = null;
    label = null;
    
    if(dbg) log(`${tag} disable() ... out`);
}
