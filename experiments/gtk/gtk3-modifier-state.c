/*
 * Exploratory GTK 3 modifier-state polling snippet.
 * Compile with: make build-experiments
 */

#include <gtk/gtk.h>

static void update(GdkKeymap * kmap) {
    guint state;
    state = gdk_keymap_get_modifier_state(kmap);
    printf("%i\n", state);
}

int main (int argc, char **argv) {

    gtk_init(&argc, &argv);
    
    GdkDisplay * dpy;
    dpy = gdk_display_get_default();
    
    GdkKeymap * kmap;
    kmap = gdk_keymap_get_for_display(dpy);

    g_timeout_add_seconds(1, (GSourceFunc) update, kmap);

    gtk_main();
}
