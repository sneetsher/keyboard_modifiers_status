# Keyboard Modifiers Status - Gnome-Shell Extension

 A Gnome-Shell extension that shows keyboard modifiers status. It is more useful when accessibility feature - sticky keys is active. 

## Features

 - Indicates status of all modifiers supported by GNU/Linux (8bits): Shift, Caps, Control, Alt, AltGr, Meta/Cmd/Win, Num, Scroll.
 - Shows all states not just effective: (Off, Active, Latched, Locked) in Wayland; (Off, Active) in Xorg session but it was dropped from Gnome-shell 49 and later.
 - Customizable symbol for each key, which allows to display just selected ones.
 - Customizable display location on Gnome-shell top bar (through CLI or any gsettings editor): left|center|right x first|..|last

### Some alternatives and some still coming
| Year | Repo | Display | Key | Feature |
|:---|:---|:---|:---|:---|
| 2011-... | https://github.com/kazysmaster/gnome-shell-extension-lockkeys | EXT(Topbar) | Num,Caps | (show effective; click to set) |
| 2015-... | this | EXT(Topbar) | Shift,Caps,Control,Alt,AltGr,Meta,Num,Scroll | (show effective,latch,lock) |
| 2016-2018 | https://github.com/caasiu/gnome-shell-extension-KeysIndicator | EXT(Topbar) | Ctrl,Shift,Alt,Caps,Num | (show effective) |
| 2021 | https://github.com/marf41/stickind | CLI(XKB) | Shift,Ctrl,Alt,AltGr,Win | (show effective,latch,lock) |
| 2025-... | https://github.com/tomasmark79/kbd-informer/ | EXT(Topbar+Notify) | Shift,Caps,Control,Alt,AltGr,Meta,Num,Scroll | (show effective,latch,lock) |

- Search extension portal for: "lock key" ...
  
## Let's not forget top objective to fix such basic feature upstream in Gnome-shell itself

If you know someone with good knowledge of Gnome technologies and wanting to give it a try. At least to triage the bug report and give feedback about related Gnome structures, libs and instructions for any developer to take it. 

- Here is the related Bug Report: https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/4706

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

      gnome-extensions prefs keyboard_modifiers_status@sneetsher

- Preferences are accessible through CLI using `gsettings`, or with the repository wrapper `./scripts/gsettings-wrapper.sh`. For the full option list, check the [GSettings schema](schemas/org.gnome.shell.extensions.keyboard-modifiers-status.gschema.xml):

      # At left within menu corner, last position
      ./scripts/gsettings-wrapper.sh set panel-side LEFT
      ./scripts/gsettings-wrapper.sh set indicator-order -1

      # At center with date, first position
      ./scripts/gsettings-wrapper.sh set panel-side CENTER
      ./scripts/gsettings-wrapper.sh set indicator-order 0

      # List all settings; reset all to defaults, including key symbols
      ./scripts/gsettings-wrapper.sh
      ./scripts/gsettings-wrapper.sh reset-recursively

## Extras

- KMS extension is enabled by default in `user`|`lock` session. `login` session require superuser system install, change login manager configuration, probably approval request by developer through gnome extension portal.
- To enable an extension for all users (machine-wide: `user`|`lock` session for all users), Just gsettings/dconf override/lock of enabled extensions to force it Or just change default only (individual users can disable it) 

    See https://help.gnome.org/admin/system-admin-guide/stable/extensions-enable.html.en


## Developer hints

For anyone looking to modify it or creating alternative solution preferably  upstream in Gnome-shell itself. Check:
- [HACKING.md](HACKING.md)
- [Technology experiments](experiments/README.md)
- Already known limitations, check open issues.
