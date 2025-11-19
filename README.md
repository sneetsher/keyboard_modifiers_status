# Keyboard Modifiers Status - Gnome-Shell Extension

 A Gnome-Shell extension that shows keyboard modifiers status. It is more useful when accessibility feature - sticky keys is active. 

 Current supported features:

 - Indicates status of these modifiers: Shift, Caps, Control, Alt, AltGr, Meta/Cmd, Num, (Scroll?)
 - Shows these states: (Off, Active, Latched, Locked) in Wayland, (Off, Active) in Xorg session dropped from Gnome-shell 49

## Install

Choose a method

- Simply, from Gnome extensions portal site

    https://extensions.gnome.org/extension/975/keyboard-modifiers-status/

- Manually

    1. Download source archive and extract it or clone repo.
    2. Install with:

            gnome-extensions pack
            gnome-extensions install keyboard_modifiers_status@*.zip
    
    3. Logout/login.
    4. Enable it:
    
            gnome-extensions enable keyboard_modifiers_status@sneetsher

## Preferences

- The preferences window allows customizing modifier mappings and display symbols.
  Symbols can be adjusted individually, loaded from presets or saved as a custom preset.

- Prefrences are accessible through CLI to using `gsettings` or if you prefer a wrapper `./scripts/gset` from this repo. Example:

            ## at left within menu corner, last position
            ./scripts/gset set panel-side LEFT
            ./scripts/gset set indicator-order -1

            ## at center with date, first position
            ./scripts/gset set panel-side CENTER
            ./scripts/gset set indicator-order 0

            ## list all, reset all to default
            ./scripts/gset
            ./scripts/gset reset-recursively

## Extras

- Enable an extension for all users (machine-wide)

    See https://help.gnome.org/admin/system-admin-guide/stable/extensions-enable.html.en


## Alternatives

- https://github.com/kazysmaster/gnome-shell-extension-lockkeys
- https://github.com/caasiu/gnome-shell-extension-KeysIndicator

- https://github.com/marf41/stickind

## Modifier indication (Push to a fix upstream in Gnome-shell)

- Feature Request/Bug Report: https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/4706

## Developer hints

For anyone looking to modify it or creating alternative solution. Check [HACKING.md](HACKING.md) file.
