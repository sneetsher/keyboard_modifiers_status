const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Gdk = imports.gi.Gdk

let button, label, keymap;

function _update() {
    let symbols = "⇧⇬⋀⌥①◆⌘⎇";
    let state = keymap.get_modifier_state();    
    label.text = " ";
    for (var i=0; i<=8; i++ ) { 
        if (state & 1<<i) {
            label.text += symbols[i];
        } else {
            //label.text += "";
        }
    }
    label.text += " ";
}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: false,
                          can_focus: false,
                          x_fill: true,
                          y_fill: false,
                          track_hover: false });
    
    label = new St.Label({ style_class: "state-label", text: "" });
    button.set_child(label);

    keymap = Gdk.Keymap.get_default();
    keymap.connect('state_changed',  _update );
    Mainloop.timeout_add(1000, _update );
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
