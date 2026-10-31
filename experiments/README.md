# Technology experiments

These are standalone API experiments for exploring modifier state and input events. They are not end-user tests or part of the extension's test suite; they may depend on APIs or runtime versions that are unavailable on a current desktop.

All snippets that query the default display need to run in a graphical user session. A Wayland or X11 session may expose different capabilities.

## GDK

| File | API/runtime requirements | Run |
|---|---|---|
| [`gdk/gdk3-modifier-state.c`](gdk/gdk3-modifier-state.c) | GCC, `pkg-config`, GDK 3 development files (`gdk-3.0`) | `make build-experiments`, then `./experiments/gdk/gdk3-modifier-state` |
| [`gdk/gdk3-modifier-state.js`](gdk/gdk3-modifier-state.js) | GJS 1.x, GTK/GDK 3 introspection (`Gtk 3.0`, `Gdk 3.0`); uses `Gdk.Keymap` | `make experiment-gdk3-gjs` |
| [`gdk/gdk3-modifier-state.py`](gdk/gdk3-modifier-state.py) | Python 3, PyGObject, GDK 3 introspection (`Gdk 3.0`) | `make experiment-gdk3-python` |
| [`gdk/gdk4-device-state.js`](gdk/gdk4-device-state.js) | GJS 1.x, GTK/GDK 4 introspection (`Gtk 4.0`, `Gdk 4.0`); uses the default display's keyboard device | `make experiment-gdk4-device` |

The GDK 3 snippets use APIs whose availability depends on the installed GDK introspection version and display backend. The GDK 4 snippet requires GTK 4's display/seat/device APIs. Both JavaScript snippets poll until interrupted with Ctrl+C.

## GTK

| File | API/runtime requirements | Run |
|---|---|---|
| [`gtk/gtk3-modifier-state.c`](gtk/gtk3-modifier-state.c) | GCC, `pkg-config`, GTK 3 development files (`gtk+-3.0`) | `make build-experiments`, then `./experiments/gtk/gtk3-modifier-state` |

The GTK 3 snippet uses GTK's main loop and GDK 3 keymap API; stop it with Ctrl+C.

## AT-SPI

| File | API/runtime requirements | Run |
|---|---|---|
| [`at-spi/keyboard-events.js`](at-spi/keyboard-events.js) | GJS 1.x, AT-SPI 2 introspection (`Atspi 2.0`) and a running accessibility bus | `make experiment-at-spi` |

This listener registers global key and mouse events and runs until Escape is released. Use it only when global accessibility event monitoring is appropriate for the session.

## Reference notes

See [NOTES.md](NOTES.md) for links and background on modifier-state APIs.
