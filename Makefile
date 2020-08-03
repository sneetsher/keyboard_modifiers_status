default:
	@echo Help:
	@echo make install
	@echo make test
	@echo make dev-install

build:
	#test-c
	gcc `pkg-config --cflags gdk-3.0` -o test_c_gdk_modifiers test_c_gdk_modifiers.c `pkg-config --libs gdk-3.0`
	gcc `pkg-config --cflags gtk+-3.0` -o test_c_gtk_modifiers test_c_gtk_modifiers.c `pkg-config --libs gtk+-3.0`

install:
	mkdir -p ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/
	cp ./* ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/

test: test-js

dist:
	zip -j keyboard_modifiers_status@sneetsher.zip ./*

dev-install:
	#git clone https://github.com/sneetsher/keyboard_modifiers_status.git keyboard_modifiers_status@sneetsher
	#mkdir -p ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher
	#cp ./* ~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher
	@echo pass

test-js:
	gjs ./test_gjs_gdk_modifiers.js

test-py:
	python3 test_py_gdk_modifiers.py

test-c:
	./test_c_gdk_modifiers

test-c-gtk:
	./test_c_gtk_modifiers
