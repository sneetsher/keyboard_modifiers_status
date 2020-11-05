default:
	@echo Help:
	@echo make build
	@echo make install
	@echo make uninstall
	@echo make dist
	@echo make test
	@echo make clean

build: dist

build-test:
	#test-c
	gcc `pkg-config --cflags gdk-3.0` -o test_c_gdk_modifiers test_c_gdk_modifiers.c `pkg-config --libs gdk-3.0`
	gcc `pkg-config --cflags gtk+-3.0` -o test_c_gtk_modifiers test_c_gtk_modifiers.c `pkg-config --libs gtk+-3.0`

install:
	gnome-extensions install --force keyboard_modifiers_status@sneetsher.shell-extension.zip
	gnome-extensions enable keyboard_modifiers_status@sneetsher

uninstall:
	gnome-extensions disable keyboard_modifiers_status@sneetsher
	gnome-extensions uninstall keyboard_modifiers_status@sneetsher

test: test-js

clean: dist-clean
	rm test_c_gdk_modifiers
	rm test_c_gtk_modifiers

dist-clean:
	rm keyboard_modifiers_status@sneetsher.shell-extension.zip

dist:
	gnome-extensions pack --extra-source=LICENSE

test-js:
	gjs ./test_gjs_gdk_modifiers.js

test-py:
	python3 ./test_py_gdk_modifiers.py

test-c:
	./test_c_gdk_modifiers

test-c-gtk:
	./test_c_gtk_modifiers
