#!/usr/bin/gjs

// This script is only to test on non supported gnome shell version
// or to help in debuging

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
//const Lang = imports.lang;
//const mainloop = imports.mainloop;

// OK
Gtk.init(null);
// NO
//Gdk.init(ARGV);

print("GJS testing script!");

let _keymap = Gdk.Keymap.get_default();
print(_keymap)
let _state = _keymap.get_modifier_state();
print("init_state: ",_state,_keymap.get_caps_lock_state(),_keymap.get_num_lock_state(),_keymap.get_scroll_lock_state())


GLib.timeout_add_seconds(0, 1, function () {
    _state = _keymap.get_modifier_state();
    print(""+_state);
    return true;
    });

// OK
Gtk.main();
// OK
//mainloop.run();
