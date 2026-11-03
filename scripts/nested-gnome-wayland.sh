#!/bin/sh -e

export G_MESSAGES_DEBUG=all
export MUTTER_DEBUG_DUMMY_MODE_SPECS=1366x768
export SHELL_DEBUG=all

# Check if we need `mutter-devkit` (GNOME 49)
if [ "$(gnome-shell --version | awk '{print int($3)}')" -ge 49 ]; then
    dbus-run-session gnome-shell --devkit --wayland \
    2>&1 | grep -P KMS\|CRITICAL
else
    dbus-run-session gnome-shell --nested --wayland \
    2>&1 | grep -P KMS\|CRITICAL
fi
