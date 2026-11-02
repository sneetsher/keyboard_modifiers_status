/*
 * Exploratory GTK 3 modifier-state polling snippet.
 * Compile with: make build-experiments
 */

#include <gtk/gtk.h>

static gboolean update(gpointer data) {
    GdkKeymap *kmap = GDK_KEYMAP(data);
    guint state;
    state = gdk_keymap_get_modifier_state(kmap);
    printf("%i\n", state);
    return G_SOURCE_CONTINUE;
}

int main (int argc, char **argv) {

    gtk_init(&argc, &argv);
    
    GdkDisplay * dpy;
    dpy = gdk_display_get_default();
    
    GdkKeymap * kmap;
    kmap = gdk_keymap_get_for_display(dpy);

    g_timeout_add_seconds(1, update, kmap);

    gtk_main();
}
