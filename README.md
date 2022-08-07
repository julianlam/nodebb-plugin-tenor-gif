# Tenor GIF Integration for NodeBB

![Searching 'pizza' in the via modal window](/screenshot.png)

This plugin adds a "GIF" button to the default composer and allows you to search and insert GIFs. It is powered by the [Tenor GIF service](https://tenor.com). Kudos to Tenor/Alphabet for providing a simple and easy-to-use API! ❤️

Install the plugin via the admin dashboard, or `npm i nodebb-plugin-tenor-gif`. You'll need to register for a Tenor GIF API key from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

Then insert said API, save the config, and reload/restart NodeBB.

# Migrating from v1 to v2

We are now using v2 of the Tenor GIF API.
Register for a new v2 API key from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and replace the existing key.