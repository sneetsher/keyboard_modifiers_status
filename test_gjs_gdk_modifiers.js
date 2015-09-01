#!/usr/bin/gjs

//This script is only to test on non supported gnome shell version
//or to help in debuging

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Lang = imports.lang;
const mainloop = imports.mainloop;

//OK
Gtk.init(null, null);
//NO
//Gdk.init(ARGV);

print("Hello World!");

let _keymap = Gdk.Keymap.get_default();
let _state = _keymap.get_modifier_state ();

GLib.timeout_add_seconds(0, 1, function () {
    _state = _keymap.get_modifier_state ();
    print(""+_state);
    return true;
    });

//OK
//Gtk.main();
//OK
mainloop.run();
