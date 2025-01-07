// ==UserScript==
// @name         CnC-TA Android helper
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2025.01.05
// @description  Alternative directional controls and zoom for the region view.
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
        // Wait for game resources to load
        if (!window.ClientLib || !window.qx || !qx.core.Init.getApplication().initDone || !ClientLib.Vis.VisMain.GetInstance().get_Region()) {
            return setTimeout(androidHelper, 100);
        }

        const region = ClientLib.Vis.VisMain.GetInstance().get_Region();

        // Ensure minimum zoom settings
        const cfg = ClientLib.Config.Main.GetInstance();
        cfg.SetConfig(cfg.CONFIG_VIS_REGION_MINZOOM, false);
        cfg.SaveToDB();
        ClientLib.Vis.Region.Region[region.get_MinZoomFactor.toString().match(/\$I\.[A-Z]{6}\.([A-Z]{6});?}/)?.[1]] = 0.01;

        // Helper: Calculate center coordinates
        const getRegionCenter = () => {
            const [gridWidth, gridHeight] = [region.get_GridWidth(), region.get_GridHeight()];
            const [posX, posY] = [region.get_PosX(), region.get_PosY()];
            const [viewWidth, viewHeight] = [region.get_ViewWidth(), region.get_ViewHeight()];
            const zoom = region.get_ZoomFactor();

            return {
                x: Math.floor((posX + viewWidth / (2 * zoom)) / gridWidth - 0.5),
                y: Math.floor((posY + viewHeight / (2 * zoom)) / gridHeight - 0.5)
            };
        };

        // Helper: Move the region view
        const moveRegion = (xOffset, yOffset) => {
            const { x, y } = getRegionCenter();
            region.CenterGridPosition(x + xOffset, y + yOffset);
        };

        // Create UI elements
        const mainContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({ opacity: 0.7 });
        const buttonContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid());

        const directions = [
            { label: "🢁", xOffset: 0, yOffset: -1, row: 0, col: 1 },
            { label: "🢃", xOffset: 0, yOffset: 1, row: 2, col: 1 },
            { label: "🢀", xOffset: -1, yOffset: 0, row: 1, col: 0 },
            { label: "🢂", xOffset: 1, yOffset: 0, row: 1, col: 2 }
        ];

        directions.forEach(({ label, xOffset, yOffset, row, col }) => {
            const button = new qx.ui.form.Button(label).set({ width: 30, height: 30 });
            button.addListener("execute", () => moveRegion(xOffset, yOffset));
            buttonContainer.add(button, { row, column: col });
        });

        // Zoom Spinner
        const zoomSpinner = new qx.ui.form.Spinner().set({
            value: region.get_ZoomFactor(),
            minimum: region.get_MinZoomFactor(),
            maximum: region.get_MaxZoomFactor(),
            singleStep: 0.05,
            toolTipText: "Adjust zoom factor"
        });

        zoomSpinner.addListener("changeValue", e => region.set_ZoomFactor(e.getData()));

        // Combine UI components
        mainContainer.add(buttonContainer);
        mainContainer.add(zoomSpinner);

        // Add to the game UI
        qx.core.Init.getApplication().getBackgroundArea().add(mainContainer, { right: 125, bottom: 5 });

        console.log(`%cCnC-TA Android Helper loaded`, "background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;");
    };

    androidHelper();
})();
