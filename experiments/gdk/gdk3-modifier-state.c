/*
 * Exploratory GDK 3 modifier-state polling snippet.
 * Compile with: make build-experiments
 */

#include <gdk/gdk.h>

GMainLoop *mainloop;

static void update(GdkKeymap * kmap) {
    guint state;
    state = gdk_keymap_get_modifier_state(kmap);
    printf("%i\n", state);
}

int main (int argc, char **argv) {    

    gdk_init(&argc, &argv);
    
    GdkDisplay * dpy;
    dpy = gdk_display_get_default();
    
    GdkKeymap * kmap;
    kmap = gdk_keymap_get_for_display(dpy);

    g_timeout_add_seconds(1, (GSourceFunc) update, kmap);

    mainloop = g_main_loop_new(g_main_context_default(), FALSE);
    g_main_loop_run(mainloop);    
}
