'use strict';

//GJS
const Mainloop = imports.mainloop;

//Gnome
const Gdk = imports.gi.Gdk;
const St = imports.gi.St;

//Gnome-Shell
const Main = imports.ui.main;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
let MinorVersion = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

//Local
const SYMBOLS = "⇧⇬⋀⌥①◆⌘⎇";

let button, label, keymap;

function _update() {
    let state = keymap.get_modifier_state();    
    label.text = " ";
    for (var i=0; i<=8; i++ ) { 
        if (state & 1<<i) {
            label.text += SYMBOLS[i];
        } else {
            //label.text += "";
        }
    }
    label.text += " ";
}

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
    if (MinorVersion >=38) {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: false,
                          can_focus: false,
                          x_expand: true,
                          y_expand: false,
                          track_hover: false });
    } else {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: false,
                          can_focus: false,
                          x_fill: true,
                          y_fill: false,
                          track_hover: false });
    }
    label = new St.Label({ style_class: "state-label", text: "" });
    button.set_child(label);

    keymap = Gdk.Keymap.get_default();
    keymap.connect('state_changed',  _update );
    Mainloop.timeout_add(1000, _update );
}

function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    Main.panel._rightBox.remove_child(button);
}
