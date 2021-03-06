# Gnome-Shell Keyboard Modifiers Status

 A Gnome-Shell extension that shows keyboard modifiers status. It is much useful when accessibility feature - sticky keys is active.
 
## Install

- From Gnome extensions site

    https://extensions.gnome.org/extension/975/keyboard-modifiers-status/

- Manually

    1. Extract it into a subfolder `keyboard_modifiers_status@sneetsher` in `~/.local/share/gnome-shell/extensions/`
    
            unzip keyboard_modifiers_status@sneetsher.zip -d ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher
    
    2. Restart gnome-shell (using <kbd>Alt</kbd>+<kbd>F2</kbd> then `r`+<kbd>Enter</kbd> or logout/login), Enable it in Gnome Tweak, Then restart gnome-shell again.
    
## Debug

Beside LookingGlass tools, this is a simple commandline to fetch and display the modifiers state. To run:

    gjs ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/test_gjs_gdk_modifiers.js

## Package

Quick command to prepare the package to be uploaded to extensions.gnome.org, manualy install or distribution

    zip -j keyboard_modifiers_status@sneetsher.zip ./*

## Hacking

This is a very small and simple extension. It can be easily modified or used as demo/tutorial.

The important function is [\_update()](https://github.com/sneetsher/keyboard_modifiers_status/blob/9ff126488e99ba7b46dc38a3a0fde32cd131cc3f/extension.js#L8). There you can change for example:

- The indicator symbols. 
- The loop, make it skip some keys. Like Caps and NumLock which are already on physical keyboard.

## Personal Note, Current Limitation

### Modifiers Lock Status

Objective, I was aiming to get full status (current modifiers key state + their lock state). However, I could not find interface for modifiers locks within GTK GI library.

Current status, it is shows only current state.

Workaraound, I wrote before this a similar indicator for Ubutnu Unity. It is based on Xlib and can collect both the state & locks. (It works also for Gnome Shell with help of a Unity-Indicator extension that works as proxy)

Search:
- Found some tutorial about using lower level libs with GJS extensions but all of them use DBUS & deamon which it is an overkill.
- Another option is writing small binding for required xlib functions but it wasn't right time as Wayland migration in progress neither having time to learn new patform like GJS.
- It may be possible to extract the state directly from keymap structure variable without help of API functions (which support only Num, Caps, Scroll)

### Wayland Support

See[#5](https://github.com/sneetsher/keyboard_modifiers_status/issues/5)
