# Hacking

This is a very small and simple extension. It can be easily modified or used as demo/tutorial.


## Debug tools

- LookingGlass tool.
- Follow system log, using `make debug` (extension prints Shell and Clutter versions on startup)


## Package

Quick command to prepare the package to be uploaded to extensions.gnome.org, manualy install or distribution

See `make dist`


## Notes

I wrote before this a similar indicator for Ubutnu Unity. It is based on `Xlib` and can collect both the state & locks. (It works also for Gnome-Shell with help of a Unity-Indicator extension that works as proxy)


## Resources

- https://gjs.guide/

    Structure is not same as code. Not all libs have a way to check which version of API currently running.
    
    Visitor coder who just developing an extension may have hard time. Example, `Mutter` is called `Meta` in side extension. `Mutter` has its own version of `Clutter`. `GTK`/`GDK` are alien to `St`/`Clutter` still many mix them while there a way in pure to `Mutter` using `St`/`Clutter`

- https://docs.gtk.org/

    Good to explore libs classes/structures features.

- 201709 https://stackoverflow.com/questions/28522031/how-to-handle-keyboard-events-in-gnome-shell-extensions
  
  TODO: Check if can handle global key event

- 202006 3.36 https://www.codeproject.com/Articles/5271677/How-to-Create-A-GNOME-Extension


- Search source code repositories like github & gitlab for updated gnome-shell-extensions and GI libraries usage.
