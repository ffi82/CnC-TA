// ==UserScript==
// @name         CnC-TA Android helper
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2025.01.05
// @description  Alternative ways to do what is considered "default" (mouse and keyboard alternatives mostly).
// @author       ffi82
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA8VJREFUeF7tmztvE0EQgGfsQHg1IBoCiIKChoaKhuTsRMZniEAg+RwHEZGAKBAFFNASWiigoUCIIIjAj4gCRJxzQhLb5AfQIFHQIBS6CAoiGRLfkjMcMmbv4b1dc4i9MrszN/PtzOzs5ozA+cnr8W2wEZc0RUeeqvNllfDWadrH1UjLYdNYWO3YpfW9WOQBIV9WzwPA3X8GQK4cv4WAl3gZXAdaI/1ab3GSB9BGHUIiwHyBaTQBcjulFC/7MTpfUeeBQIQXzGZbhAHILMS6wrXwomX400p8R43gR08wjNoBLTrz2gLZsWFl+8mDs0ueZFucJAyAZXyL9lCni1p9YUXQVDxRiZ8jBO/xALBaI/sHe4tveOhqSwrUi5aAR0QkcE8BUc5bPHlD4ApAtPMiIHADQHM+hGDuhSMEQGPJCGIYJwBDMUS40CzPKxK4ALD26t+MJDCuRfQh1t1gzbDRpKJfrxfUsnptraiMNuonAEdTil5gAcu9EaKtPgI8TCr6GVYAgFDSevSokzyPKPAdAe3Ke7uV9gtBAvCTQ9Tc96OQQRYB7iQV/SKDaF3EVwT87fDnsS1KAKyhw1zd/bzQRtZPIfQVAQJ8abtKCcAJea4UH0PE4focAje1iH61cX5Qi2C+pN4AhCt1swl5kIoUR+z8tI0AO+esfMuV1CeIkG57zFJeSAhkUhF9kKVrpALIV9RHQOA0zTnDgPRAVM9OVBIZQshAEAAgYjbZM5XOzqsDoRBkqDYhjGs9P84mjQ8dgMuFhhkFQQTglpK03UICoIWLF5IyAgJYA7wsnKwBsgjKXUBug7IPaCAg+wDZB1AIeNlPZSMkG6HgnQa9RK7sBGUnKDtB2Qm6doKZ6VhXuDNM/cjRulUJ4jbodCdY+1rbmT4888dXak6XoscA4FkjLQJ4NqVMjZl/CyqAXDkxgkDuN9W645qiP6c1fa7/F3g8e2TPuvXGbq1bX2hUEFQAlo35V+qhlW+hD6f6Cu+dLm5dAdgJBx2A19tqCcArqeZ5MgICeBZgWUyZAizUflVaQZ/EtmpTIL8PcDqZ2RnMItMqLE+nQb9KnToyc0wCsPlBlYwAh5riJ8+FdIJuacKymiwybna4jTNvg26KWZxhkXGzw21cAnAjxDrOsposMqz2WXIyAvwSpMlnZxN7Qx3knZ1u2Qf8F33Az5+8NkfBslHdOhwtfaZFR64UjyLiXPMYMUgsFS2+FBGtwmpAvR2eU/dBGN5ahm8Khbf1d09+cnKkUEh0ftlMqtacatXYMhSfXhbhvKnzO1OQ1V93MQIUAAAAAElFTkSuQmCC
// @updateURL    https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Android-Helper.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Android-Helper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const androidHelper = () => {
        if (!window.ClientLib || !window.qx || !qx.core.Init.getApplication().initDone || !ClientLib.Vis.VisMain.GetInstance().get_Region().get_MinZoomFactor()) {
            return setTimeout(androidHelper, 100)
        }
        const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
        const cfg = ClientLib.Config.Main;
        cfg.GetInstance().SetConfig(cfg.CONFIG_VIS_REGION_MINZOOM, false); // Uncheck 'Allow max zoom out' in game video options
        cfg.GetInstance().SaveToDB(); //Save settings
        ClientLib.Vis.Region.Region[region.get_MinZoomFactor.toString().match(/\$I\.[A-Z]{6}\.([A-Z]{6});?}/)?.[1]] = .01; // Set the minimum zoom factor to 0.01 (0.6 is the default)... allows one to zoom out further.
        // Alternative zoom in/out for region view
        const ZoomSpinner = new qx.ui.form.Spinner().set({
            value: parseFloat(region.get_ZoomFactor().toFixed(2)),
            minimum: .01,
            maximum: 1,
            singleStep: .1,
            toolTipText: "Adjust zoom factor",
            opacity: 0.7
        });
        ZoomSpinner.addListener("changeValue", e => region.set_ZoomFactor(e.getData()));
        qx.core.Init.getApplication().getBackgroundArea().add(ZoomSpinner, {
            right: 125,
            bottom: 5
        })
        console.log(`%cCnC-TA Android helper loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
    }
    androidHelper()
})();
