# Unsplash New Tab Chrome Extention

A Chrome extension that shows Unsplash photos on each new tab. Can be configured to show your own Unsplash photos, your friend's photos, your likes, your friend's likes, or random photos from across Unsplash.

[View it on the Chrome Web Store.](https://chromewebstore.google.com/detail/unsplash-new-tab/kllefpnjajpfpnddcfnhpionedaioaap)

## FAQ

Q: Upon installing, I see a warning "This extension is not trusted by Enhanced Safe Browsing". Is this extension safe?

A: Yes, trust me, it is safe! The Chrome Web Store is cautious and shows [this warning](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/3g8tu00by2g?pli=1) when developer accounts are new to the store. I hope that this warning will go away one day soon.

## Developer stuff

To get started developing:

1. If you don't already have it, install ESLint globally. _`npm` wasn't used for development because it felt too heavy-handed. This extension is meant to be small and lightweight._
1. Clone this repository
1. [Load the extension "unpacked" into Chrome.](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)

If you'd like to check your JS for issues/bugs, you can run ESLint via: `eslint --ext .js .`
