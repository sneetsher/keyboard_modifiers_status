const St = imports.gi.St;
const Gdk = imports.gi.Gdk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;

const Mainloop = imports.mainloop;


const tag = "KMS-GSE:";
const symbols = "⇧⇬⋀⌥①◆⌘⎇";

let button, label, keymap;
let state, prev_state;

function _update() {
    state = keymap.get_modifier_state();
    if (state != prev_state) {
        log(tag+"Status changed...", prev_state, state);
        label.text = " ";
        for (var i=0; i<=8; i++ ) {
            if (state & 1<<i) {
                label.text += symbols[i];
            } else {
                //label.text += "";
            }
        }
        label.text += " ";
        prev_state = state;
    }
}

function init() {
    log(`${tag} init() ... begin ${Me.metadata.name}`);
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: false,
                          can_focus: false,
                          x_expand: true,
                          y_expand: false,
                          track_hover: false });
    label = new St.Label({ style_class: "state-label", text: "" });
    button.set_child(label);

    keymap = Gdk.Keymap.get_default();
    keymap.connect('state_changed',  _update );

    Mainloop.timeout_add(1000, _update );
    log(tag+"init() ... end");
}

function enable() {
    log(tag+"enable() ... begin");
    Main.panel._rightBox.insert_child_at_index(button, 0);
    log(tag+"enable() ... end");
}

function disable() {
    log(tag+"disable() ... begin");
    Main.panel._rightBox.remove_child(button);
    log(tag+"disable() ... end");
}
