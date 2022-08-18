<img alt="openCountdown Logo" height="90px" src="https://git.project-name-here.de/Project-Name-Here/openCountdown/raw/branch/master/static/logo/logoProposal.svg">

# openCountdown
openCountdown is a professional software for event countdowns. It can be used in a live settings such as a music event. 
Support for companion is currently being worked on [here](https://github.com/bitfocus/companion-module-pnh-opencountdown).

<a href="https://bitfocus.io/companion/?ref=pnh-Opencountdown" target="_new"><img alt="Controllable by Companion" src="https://bitfocus.io/companion-badge.png?ref=pnh-Opencountdown"></a>

# Installation
You can download complete binaries from the release tab.
## Development build
1. Download the repository
2. `npm install` to install dependecies
3. `npm start` to launch

### Startup Arguments
One can pass a `--headless` argument to start the server in headless mode. This will disable the GUI.
## Packaging
This is more a comment for the future version of me. There is one command for packaging using nexe.
```bash
npx nexe index.js --build --python python3 --resource "./{lang,templates,static}/**/*" --ouput "openCountdown.exe”
```
Where `--python` is only needed in some envoirments for some reason. Also  adjust `--output` for your target OS.

*Small disclaimer: Please do not use openCountdown for military or life-depending applications. Please also refrain from using openCountdown for launching rockets.*



# ToDo
Endpoint documentation is currently pretty thin. This will be changed in the future.
- [ ] Endpoint docs (in Progress)
- [ ] Better WS frames