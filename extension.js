//
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
//const Meta = imports.gi.Meta;

//
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

//
const tag = "KMS-Ext:";
const mod_sym = "⇧⇬⋀⌥①◆⌘⎇";
const latch_sym = "'";
const lock_sym = "◦";
const icon = "⌨ ";
const opening = "_";
const closing = "_";

//
let button, label;
let indicator;
let state, prev_state;
let seat;
let latch, lock;
let x, y, m;
let timeout_id, mods_update_id;

//
state = 0;
state_prev = 0;
latch = 0;
lock = 0;


//
function _update() {
    //log(`${tag} _update() ... in`);
    //TODO: search for documentation about global
    //Note: modifiers state from get_pointer is the base not the effective
    // On latch active, it is on too. but on lock active, it is off
    // Not the case, using Gdk.Keymap.get_default().get_modifier_state() which
    // is the effective
    [x, y, m] = global.get_pointer();
    if (typeof m !== 'undefined') {
        state = m;
    };
    if ((state != prev_state) || latch || lock) {
        //log(`${tag} State changed... ${prev_state}, ${state}`);
        indicator = icon + opening + " ";
        //TODO: don't relay on internal order
        //      use standard pre-defined constant masks
        for (var i=0; i<8; i++ ) {
            if ((state & 1<<i) || (lock & 1<<i)) {
                indicator += mod_sym[i];
            } else {
                //indicator += "";
            };
            if (latch & 1<<i) {
                indicator += latch_sym + " ";
            } else {
                //indicator += "";
            };
            if (lock & 1<<i) {
                indicator += lock_sym + " ";
            } else {
                //indicator += "";
            };
        }
        indicator += " " + closing;
        label.text = indicator;
        prev_state = state;
    }
    //log(`${tag} init() ... out`);
    return true;
}


function _a11y_mods_update(o, latch_new, lock_new) {
    //log(`${tag} _a11y_mods_update() ... in`);
    //TODO: search what's the 1st parameter
    if (typeof latch_new !== 'undefined') {
        latch = latch_new;
    };
    if (typeof lock_new !== 'undefined') {
        lock = lock_new;
    };
    //log(`${tag} latch: ${latch}, lock: ${lock});
    //log(`${tag} _a11y_mods_update() ... out`);
    return true;
}

// Gnome-shell extension interface
// init, enable, disable

function init() {
    log(`${tag} init() ... in - ${Me.metadata.name}`);
    
    //
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: false,
                          can_focus: false,
                          x_expand: true,
                          y_expand: false,
                          track_hover: false });
    label = new St.Label({ style_class: "state-label", text: "" });
    button.set_child(label);
    
    //log(`${tag} Running Wayland: ` + Meta.is_wayland_compositor());
    
    seat = Clutter.get_default_backend().get_default_seat();

    log(`${tag} init() ... out`);
}


function enable() {
    log(`${tag} enable() ... in`);
    
    mods_update_id = seat.connect("kbd-a11y-mods-state-changed", _a11y_mods_update);
    
    Main.panel._rightBox.insert_child_at_index(button, 0);
    timeout_id = Mainloop.timeout_add(200, _update );
    
    log(`${tag} enable() ... out`);
}


function disable() {
    log(`${tag} disable() ... in`);
    
    Main.panel._rightBox.remove_child(button);
    Mainloop.source_remove(timeout_id);
    
    seat.disconnect(mods_update_id);
    
    log(`${tag} disable() ... out`);
}
