# nifki
Make your own computer games, or just mess about with everyone else's!


## Build

cargo build --release


## Configuration

The server can be configured using three environment variables:

- NIFKI_WIKI_ROOT - the directory of the wiki files.
- NIFKI_JS_ROOT - the directory of the Javascript runtime.
- NIFKI_STATIC_ROOT - the directory of the static files (in this repo).
- NIFKI_BASE_URL - the globally visible URL of the web server (default: `http://SERVER_ADDRESS`)

The server always listens on `localhost:8080`. One way that the `BASE_URL` can differ from `localhost:8080` is if the server is exposed to the internet via a proxy.


## Systemd configuration

The file `nifki.service` belongs in `$HOME/.config/systemd/user/`. Edit it as needed.

Run the following commands:

```sh
loginctl enable-linger
systemctl --user enable nifki.service
systemctl --user start nifki.service
```

Replace `start` with `stop`, `restart` or `status` as appropriate. Systemd will log `stdout` and `stderr` by default, which makes for a usable server log. View it with

```sh
journalctl --user-unit nifki
```
