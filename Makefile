default:
	@echo Help:
	@echo make install
	@echo make debug
	@echo make dist
	@echo make clean
	@echo make build-experiments

build-experiments:
	gcc `pkg-config --cflags gdk-3.0` -o experiments/gdk/gdk3-modifier-state experiments/gdk/gdk3-modifier-state.c `pkg-config --libs gdk-3.0`
	gcc `pkg-config --cflags gtk+-3.0` -o experiments/gtk/gtk3-modifier-state experiments/gtk/gtk3-modifier-state.c `pkg-config --libs gtk+-3.0`

install:
	mkdir -p ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/
	cp ./*.js* ./*.css ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/
	mkdir -p ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/schemas
	cp schemas/*.gschema.xml ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/schemas
	glib-compile-schemas ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/schemas

clean: dist-clean
	rm -f experiments/gdk/gdk3-modifier-state experiments/gtk/gtk3-modifier-state

dist-clean:
	rm package/keyboard_modifiers_status@sneetsher.zip || echo skipped

dist: dist-clean
	mkdir -p package
	zip -r package/keyboard_modifiers_status@sneetsher.zip ./*.js* ./*.css schemas

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


debug:
	journalctl -f -o cat /usr/bin/gnome-shell
