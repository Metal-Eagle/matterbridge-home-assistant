# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.0.1 (2024-07-24)


### 🚀 Chore

* update node-types to 20 ([45bdaa6](https://github.com/t0bst4r/matterbridge-home-assistant/commit/45bdaa6e7443a9f116cc0390010bb7222c7338bf))



## 2.0.0 (2024-07-24)


### ⚠ BREAKING CHANGES

* Version 2 requires several configuration changes. See the documentation for more details.

- In version 1.x `matterbridge` was not listed as a `dependencies` or `peerDependency`. This has been changed in version
  2.0.0. It is now listed as a peer dependency.
  When installed in a local `package.json` file, this is not a problem. But since `matterbridge` installs all its
  plugins globally, this will lead to an error running `matterbridge` with `matterbridge-home-assistant`, because of
  npm's "new" (>= 7) strategy for peer-dependencies.
  To solve this, you need to enable [legacy-peer-deps](https://docs.npmjs.com/cli/v10/using-npm/config#legacy-peer-deps)
  in your npm config (`npm config set legacy-peer-deps true`) or in an environment
  variable (`npm_config_legacy_peer_deps=true`). In the pre-built docker image and the native Home Assistant Addon, this
  is already configured.
- In version 1.x this plugin was meant to be configured using multiple environment variables. Due to the growing number
  of configuration options, this has been changed. This plugin requires to be configured using a configuration JSON file
  or one single environment variable containing the whole JSON configuration.
  **Please see the configuration section in the projects readme.**

### ✨ Features

* split matterbridge-home-assistant into multiple libraries ([3b87b78](https://github.com/t0bst4r/matterbridge-home-assistant/commit/3b87b7844e0475b03f35a56f1bdeaa7bf6a5b599))