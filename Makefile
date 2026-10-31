default:
	@echo Help:
	@echo make dist
	@echo make install
	@echo make debug
	@echo make build-experiments
	@echo make clean


dist:
	gnome-extensions pack --force

pack: dist

install: dist
	gnome-extensions install keyboard_modifiers_status@*.shell-extension.zip --force

debug:
	journalctl -f -o cat /usr/bin/gnome-shell

build-experiments:
	gcc `pkg-config --cflags gdk-3.0` -o experiments/gdk/gdk3-modifier-state experiments/gdk/gdk3-modifier-state.c `pkg-config --libs gdk-3.0`
	gcc `pkg-config --cflags gtk+-3.0` -o experiments/gtk/gtk3-modifier-state experiments/gtk/gtk3-modifier-state.c `pkg-config --libs gtk+-3.0`

clean:
	rm -f experiments/gdk/gdk3-modifier-state experiments/gtk/gtk3-modifier-state

experiment-gdk3-gjs:
	gjs ./experiments/gdk/gdk3-modifier-state.js

experiment-gdk3-python:
	python3 ./experiments/gdk/gdk3-modifier-state.py

experiment-gdk4-device:
	gjs ./experiments/gdk/gdk4-device-state.js

experiment-at-spi:
	gjs ./experiments/at-spi/keyboard-events.js

run-gdk3-c-experiment: build-experiments
	./experiments/gdk/gdk3-modifier-state

run-gtk3-c-experiment: build-experiments
	./experiments/gtk/gtk3-modifier-state
