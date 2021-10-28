#!/usr/bin/gjs

// This script is only to test on non supported gnome shell version
// or to help in debuging

/*
Meta/Mutter & Clutter can't be imported here

*/

let t = 0;


const GLib = imports.gi.GLib;

imports.gi.versions.Gtk = "4.0";
const Gtk = imports.gi.Gtk;
print(`${Gtk.MAJOR_VERSION}.${Gtk.MINOR_VERSION}.${Gtk.MICRO_VERSION}`);

imports.gi.versions.Gdk = "4.0";
const Gdk = imports.gi.Gdk;

const Gio = imports.gi.Gio;


const mainloop = imports.mainloop;



// OK
Gtk.init();
// NO
//Gdk.init();
/*
const app = new Gtk.Application({
    application_id: 'org.gnome.Sandbox.ImageViewerExample',
    flags: Gio.ApplicationFlags.FLAGS_NONE
});
app.connect('activate', app => {*/
    print("GJS testing script!");
    
    const backend = Gdk.DisplayManager.get();
    print(backend);
    print(backend.get_default_display());

    const display = Gdk.Display.get_default();
    print(display);
    
    const seat = display.get_default_seat();
    print(seat)
    
    const keyboard = seat.get_keyboard();
    print(keyboard);

    let state = keyboard.get_modifier_state();
    print("init_state: ",state,keyboard.get_caps_lock_state(),keyboard.get_num_lock_state(),keyboard.get_scroll_lock_state(), keyboard.get_timestamp());


    GLib.timeout_add_seconds(0, 1, function () {
        t += 1;
        state = keyboard.get_modifier_state();
        print(`${t} state: `,
            state,
            keyboard.get_caps_lock_state(),
            keyboard.get_num_lock_state(),
            keyboard.get_scroll_lock_state(),
            keyboard.get_timestamp()
            );
        return true;
        });
//});
// OK
//Gtk.main();
// OK
mainloop.run();
//app.run(null);
