#!/bin/bash

schema=~/.local/share/gnome-shell/extensions/keyboard_modifiers_status@sneetsher/schemas/
id=org.gnome.shell.extensions.keyboard-modifiers-status



if [ "$#" -gt 0 ]; then
  set -x
  gsettings --schemadir "$schema" "$1" "$id" "${@:2}"
else
  set -x
  gsettings --schemadir "$schema" list-recursively "$id"
fi
