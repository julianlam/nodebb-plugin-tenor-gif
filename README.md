# Klipy GIF Integration for NodeBB

![Searching 'pizza' in the via modal window](/screenshot.png)

This plugin adds a "GIF" button to the default composer and allows you to search and insert GIFs. It is powered by the [Klipy GIF service](https://klipy.com).

Install the plugin via the admin dashboard, or `npm i nodebb-plugin-tenor-gif`. You'll need to register for a Klipy API key from the [Klipy Partner Portal](https://partner.klipy.com/).

Then insert said API key, save the config, and reload/restart NodeBB.

## Migration from Tenor

Google has sunset the Tenor GIF API. This plugin now uses Klipy as its GIF provider. The Klipy API is fully compatible with the previous Tenor API — simply replace your old Tenor API key with a Klipy API key from the [Klipy Partner Portal](https://partner.klipy.com/) and everything continues to work.