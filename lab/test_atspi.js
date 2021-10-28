// small script to test: modifiers
// using: gjs, atspi, x11, wayland

const Atspi = imports.gi.Atspi;

let c = 0;

function onPress (event) {
    c += 1;
    log(`${c} key press: mod ${event.modifiers} key ${event.event_string}`);
    return true;
}

function onRelease (event) {
    c += 1;
    log(`${c} key release: mod ${event.modifiers} key ${event.event_string}`);
    if (event.event_string == "Escape") {
        Atspi.event_quit();
    }
    return true;
}

function onMouse (event) {
    log(`M ${event}`);
    return true;
}


Atspi.init();

const pressListener = [];
const releaseListener = [];

for (let i=0; i<=255; i++) {
    log(`Listener registered .. ${i}`);

    pressListener[i] = Atspi.DeviceListener.new(onPress);
    Atspi.register_keystroke_listener(
        pressListener[i],
        null,
        i,
        Atspi.EventType.KEY_PRESSED_EVENT,
        Atspi.KeyListenerSyncType.SYNCHRONOUS
        );

    releaseListener[i] = Atspi.DeviceListener.new(onRelease);
    Atspi.register_keystroke_listener(
        releaseListener[i],
        null,
        i,
        Atspi.EventType.KEY_RELEASED_EVENT,
        Atspi.KeyListenerSyncType.SYNCHRONOUS
        );
}

const mouseListener = Atspi.EventListener.new(onMouse);
mouseListener.register("mouse:");


Atspi.event_main();
Atspi.exit();
