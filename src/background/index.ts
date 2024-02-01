import { storage } from "../storage";
import Mixpanel from 'mixpanel-browser'
import { ExtensionStorage } from "./extension-storage";

const Token = '1c2572203c7851076a9e855d70e08560'

// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/
const extensionStorage = new ExtensionStorage()

async function initMixpanelStorage() {
    console.log('start initMixpanelStorage')
    await extensionStorage.load()
    Mixpanel.loadExtensionStroage(extensionStorage)
}

initMixpanelStorage().then(() => console.log('extensionStorage initialized')).catch(console.error)
chrome.runtime.onInstalled.addListener(async () => {
    console.log('onInstalled')
    if (!extensionStorage.loaded) {
        await initMixpanelStorage()
    }
    Mixpanel.init(Token, {
        debug: true,
        track_pageview: false,
        persistence: 'extensionStorage',
        ignore_dnt: true,
        loaded: (v) => {
            console.log(v.get_distinct_id())
            Mixpanel.track('onInstalled', {
                version: chrome.runtime.getManifest().version,
            })
        },
    })
});

// NOTE: If you want to toggle the side panel from the extension's action button,
// you can use the following code:
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//    .catch((error) => console.error(error));
