# Keyboard Modifiers Status - Gnome-Shell Extension

 A Gnome-Shell extension that shows keyboard modifiers status. It is more useful when accessibility feature - sticky keys is active. 

 Current supported features:

 - Indicates status of these modifiers: Shift, Caps, Control, Alt, AltGr, Meta/Cmd, Num, (Scroll?)
 - Shows these states: (Off, Latched, Locked) in Wayland, (Off, Active) in Xorg

## Install

Choose a method

- Simply, from Gnome extensions portal site

    https://extensions.gnome.org/extension/975/keyboard-modifiers-status/

- Manually

    1. Extract it into a subfolder `keyboard_modifiers_status@sneetsher` in `~/.local/share/gnome-shell/extensions/`
    
            unzip keyboard_modifiers_status@sneetsher.zip -d ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher

        or

            make install
    
    2. Restart gnome-shell, using <kbd>Alt</kbd>+<kbd>F2</kbd> then `r`+<kbd>Enter</kbd> with Xorg or logout/login with Wayland.
    
    3. Enable it
    
            gnome-extensions enable keyboard_modifiers_status@sneetsher


## Extras

- The preferences window allows customizing modifier mappings and display symbols.
  Symbols can be adjusted individually, loaded from presets or saved as a custom preset.

- Enable an extension for all users (machine-wide)

    See https://help.gnome.org/admin/system-admin-guide/stable/extensions-enable.html.en



## Alternatives

- https://github.com/kazysmaster/gnome-shell-extension-lockkeys
- https://github.com/caasiu/gnome-shell-extension-KeysIndicator

- https://github.com/marf41/stickind

## Modifier indication (Push to a fix upstream in Gnome-shell)

- Feature Request/Bug Report: https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/4706

## Developer hints

For anyone looking to modify it or creating anternative solution. Check [HACKING.md](HACKING.md) file.
