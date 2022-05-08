# A11y: Exploring modifiers sources

Some interesting pointer related to modifiers state, latch & lock for developing the extension

## ATSPI2

- https://gjs-docs.gnome.org/atspi20~2.0_api/atspi.device#method-get_locked_modifiers
  or https://gjs-docs.gnome.org/atspi20~2.0_api/atspi.device#vfunc-get_locked_modifiers
- https://gjs-docs.gnome.org/atspi20~2.0_api/atspi.deviceevent #property-modifiers

## Meta (± Mutters)

- https://gjs-docs.gnome.org/meta8~8_api/meta.display#method-get_compositor_modifiers
  or https://gjs-docs.gnome.org/meta8~8_api/meta.display#property-compositor_modifiers


## Clutter (~ forked)

- https://gjs-docs.gnome.org/clutter8~8_api/clutter.seat#signal-kbd-a11y-mods-state-changed
- clutter.seat.method-get_keyboard()


## GTK

### GTK4/c

- https://docs.gtk.org/gtk4/ctor.EventControllerKey.new.html
- https://docs.gtk.org/gtk4/signal.EventControllerKey.modifiers.html
- https://docs.gtk.org/gtk4/method.EventController.get_current_event_state.html

- https://docs.gtk.org/gtk4/input-handling.html

## GDK

### GDK3/c

Xorg: Display -> Seat -> Keymap

- https://docs.gtk.org/gdk3/type_func.Keymap.get_default.html
- https://docs.gtk.org/gdk3/method.Keymap.get_modifier_state.html
- https://docs.gtk.org/gdk3/method.Keymap.get_caps_lock_state.html
- https://docs.gtk.org/gdk3/method.Keymap.get_num_lock_state.html
- https://docs.gtk.org/gdk3/method.Keymap.get_scroll_lock_state.html
- https://docs.gtk.org/gdk3/signal.Keymap.state-changed.html

- https://docs.gtk.org/gdk3/type_func.Display.get_default.html
- https://docs.gtk.org/gdk3/method.Display.get_default_seat.html
- https://docs.gtk.org/gdk3/method.Seat.get_keyboard.html
- https://docs.gtk.org/gdk3/method.Seat.get_pointer.html

### GDK3/js

Xorg: Display -> Seat/DeviceManager -> Keymap

### GDK4/c

Wayland: Display -> Seat -> Device

- https://docs.gtk.org/gdk4/type_func.Display.get_default.html
  or gdk_display_manager_get_default_display (gdk_display_manager_get ())
  Check type to know mode: GdkWaylandDisplay, GdkX11Display, ...
- https://docs.gtk.org/gdk4/method.Display.get_default_seat.html
- https://docs.gtk.org/gdk4/method.Seat.get_keyboard.html
- https://docs.gtk.org/gdk4/method.Seat.get_pointer.html
- https://docs.gtk.org/gdk4/method.Device.get_modifier_state.html
  or https://docs.gtk.org/gdk4/property.Device.modifier-state.html
- https://docs.gtk.org/gdk4/method.Device.get_caps_lock_state.html
  or https://docs.gtk.org/gdk4/property.Device.caps-lock-state.html
- https://docs.gtk.org/gdk4/method.Device.get_num_lock_state.html
  or https://docs.gtk.org/gdk4/property.Device.num-lock-state.html
- https://docs.gtk.org/gdk4/method.Device.get_scroll_lock_state.html
  or https://docs.gtk.org/gdk4/property.Device.scroll-lock-state.html

- https://docs.gtk.org/gdk4/method.Event.get_modifier_state.html
- https://docs.gtk.org/gdk4/method.KeyEvent.get_consumed_modifiers.html
- https://docs.gtk.org/gdk4/method.KeyEvent.is_modifier.html

- https://docs.gtk.org/gobject/signal.Object.notify.html
- https://docs.gtk.org/gdk4/func.set_allowed_backends.html
  prior gdk_display_open(), gtk_init(), or gtk_init_check()


### GDK4/js

- https://gjs-docs.gnome.org/gdk40~4.0_api/gdk.device#method-get_modifier_state
  or https://gjs-docs.gnome.org/gdk40~4.0_api/gdk.device#property-modifier_state
- https://gjs-docs.gnome.org/gdk40~4.0_api/gdk.keyevent#method-get_consumed_modifiers


## Other general search to check
- https://wiki.gnome.org/Attic/GnomeShell/Extensions/Writing
- https://extensions.gnome.org/extension/112/remove-accesibility/
- https://bugzilla.gnome.org/show_bug.cgi?id=788564
  [wayland]: Add keyboard a11y, support for slow-keys, sticky-keys, bounce-keys, toggle-keys
- https://gitlab.gnome.org/search?search=latch&group_id=8&project_id=547&scope=&search_code=true&snippets=false&repository_ref=gnome-41&nav_source=navbar