#!/usr/bin/python3

import gi
gi.require_version('Gdk', '3.0')
from gi.repository import Gdk, GLib

def update(keymap):
        print(Gdk.Keymap.get_modifier_state(keymap))
        return True

if __name__=="__main__":

        #Gdk.init()

        loop = GLib.MainLoop()

        display = Gdk.Display.get_default()
        keymap = Gdk.Keymap.get_for_display(display)
        print(Gdk.Keymap.get_modifier_state(keymap))
        
        GLib.timeout_add_seconds(1, update, keymap)

        loop.run()
