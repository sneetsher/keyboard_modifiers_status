# Keyboard Modifiers Status

A GNOME Shell extension that displays active keyboard modifiers in the top panel. It is especially useful with Sticky Keys, showing modifiers that are active, latched, or locked.

## What it shows

- Shift, Caps Lock, Control, Alt, Num Lock, Scroll Lock, Super, and AltGr.
- Active, latched, and locked states where GNOME Shell and the session expose them. Xorg support is limited; the previous Xorg modifier-state API was dropped from GNOME Shell 49.
- Custom symbols and wrappers, with controls for which symbols are displayed.
- A configurable panel location and indicator order.

## Compatibility and support

The extension metadata lists GNOME Shell versions 45 through 51. The available modifier-state details can vary by Shell version, display backend, and accessibility support. The extension supports the `user` and `unlock-dialog` session modes; it is not configured for the login screen.

This is an extension-level solution to a feature that would be more appropriately provided by GNOME Shell itself. See the [upstream GNOME Shell issue](https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/4706).

## Install and enable

Install from the [GNOME Extensions page](https://extensions.gnome.org/extension/975/keyboard-modifiers-status/) or install a locally packed copy:

```sh
gnome-extensions pack
gnome-extensions install keyboard_modifiers_status@*.zip
```

Then log out and back in, and enable the extension:

```sh
gnome-extensions enable keyboard_modifiers_status@sneetsher
```

## Preferences

Open the preferences window:

```sh
gnome-extensions prefs keyboard_modifiers_status@sneetsher
```

Use the preferences to change modifier symbols, choose presets or save custom symbols, adjust panel placement, and optionally show a translucent desktop overlay. Drag the overlay to move it; its position is saved across sessions. Symbol changes apply immediately; changes to panel side or indicator order apply after disabling and re-enabling the extension. Settings are also available through `gsettings` or the repository helper `./scripts/gsettings-wrapper.sh`. The full key list and defaults are in the [GSettings schema](schemas/org.gnome.shell.extensions.keyboard-modifiers-status.gschema.xml).

For example, place the indicator at the end of the left panel section:

```sh
./scripts/gsettings-wrapper.sh set panel-side LEFT
./scripts/gsettings-wrapper.sh set indicator-order -1
```

To list all settings or reset them to their defaults:

```sh
./scripts/gsettings-wrapper.sh
./scripts/gsettings-wrapper.sh reset-recursively
```

## Accessibility and limitations

Sticky Keys can make latched and locked modifier states visible; availability depends on the active GNOME Shell session and modifier-state APIs. GNOME's “separate input sources for each window” setting remembers each window's keyboard layout/input source, but does not provide a separate modifier-state snapshot per window. This extension therefore displays the current seat/compositor modifier state; its panel indicator and optional desktop overlay cannot show a different Caps Lock or modifier state for each window. Supporting per-window modifier state requires a GNOME Shell/Mutter API that exposes such state. The extension is enabled in the normal user and unlock-dialog modes. System-wide or login-screen deployment is not covered by the standard extension install; consult the [GNOME system administrator guide](https://help.gnome.org/admin/system-admin-guide/stable/extensions-enable.html.en) for managed extension settings.

## For developers

See [HACKING.md](HACKING.md) for debugging and packaging, and [experiments/README.md](experiments/README.md) for standalone API experiments. These snippets are exploratory tools, not end-user tests.
