default:
	@echo Help:
	@echo make install
	@echo make debug
	@echo make dist
	@echo make clean

build:
	#test-c
	gcc `pkg-config --cflags gdk-3.0` -o lab/test_c_gdk_modifiers lab/test_c_gdk_modifiers.c `pkg-config --libs gdk-3.0`
	gcc `pkg-config --cflags gtk+-3.0` -o lab/test_c_gtk_modifiers lab/test_c_gtk_modifiers.c `pkg-config --libs gtk+-3.0`

install:
	mkdir -p ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/
	cp ./*.js* ./*.css ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/
	mkdir -p ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/schemas
	cp schemas/*.gschema.xml ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/schemas
	glib-compile-schemas ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/schemas

test: test-js

clean: dist-clean
	rm lab/test_c_gdk_modifiers
	rm lab/test_c_gtk_modifiers

dist-clean:
	rm package/keyboard_modifiers_status@sneetsher.zip || echo skipped

dist: dist-clean
	mkdir -p package
	glib-compile-schemas schemas
	zip -j package/keyboard_modifiers_status@sneetsher.zip \
./*.js* ./*.css schemas/*.gschema.xml schemas/gschemas.compiled
	rm schemas/gschemas.compiled

test-js:
	gjs ./lab/test_gjs_gdk_modifiers.js

test-py:
	python3 ./lab/test_py_gdk_modifiers.py

test-c:
	./lab/test_c_gdk_modifiers

test-c-gtk:
	./lab/test_c_gtk_modifiers


debug:
	journalctl -f -o cat /usr/bin/gnome-shell
