// ==UserScript==
// @name         CnC-TA Raid-Helper
// @namespace    https://github.com/ffi82/CnC-TA/
// @description  Removes name and level information except for interesting raid targets.
// @version      2024.12.25
// @author       Mooff
// @contributor  Topper42, alexos75, ffi82
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL    https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    function initHideCampsButton() {
        if (typeof ClientLib === 'undefined' || typeof qx === 'undefined' || !qx.core.Init.getApplication().initDone) {
            setTimeout(initHideCampsButton, 100);
            return;
        }
        console.log("CnC-TA Raid-Helper: Loaded");
        // Load stored settings or use defaults
        const worldId = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
        const storageKey = `raidhelper_settings_${worldId}`;
        const storedSettings = JSON.parse(localStorage.getItem(storageKey)) || {};
        const maxLvl = ClientLib.Data.MainData.GetInstance().get_Server().get_PlayerUpgradeCap();
        let minLvl = storedSettings.minLevel ?? Math.min(Math.round(ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().get_LvlOffense()), maxLvl);
        
        // Initialize container
        const container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        
        // Button
        const HCBtn = new qx.ui.form.Button("Hide");
        let active = false;
        HCBtn.set({
            width: 50,
            toolTipText: "Hide/Show infos for forgotten targets and player bases that are under the selected level in range of your selected base."
        });
        
        HCBtn.addListener("click", () => {
            const currCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
            if (!currCity) {
                console.error("Current city is undefined or null.");
                return;
            }
            const x = currCity.get_X();
            const y = currCity.get_Y();
            const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
            const server = ClientLib.Data.MainData.GetInstance().get_Server();
            const attackDistance = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance();
            
            active = !active;
            
            for (let i = Math.max(x - attackDistance, 0); i < Math.min(x + attackDistance, server.get_WorldWidth()); i++) {
                for (let j = Math.max(y - attackDistance, 0); j < Math.min(y + attackDistance, server.get_WorldHeight()); j++) {
                    const visObject = region.GetObjectFromPosition(i * region.get_GridWidth(), j * region.get_GridHeight());
                    if (visObject) {
                        const visType = visObject.get_VisObjectType();
                        if ((visType === ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp) || (visType === ClientLib.Vis.VisObject.EObjectType.RegionNPCBase) || (visType === ClientLib.Vis.VisObject.EObjectType.RegionCityType)) {
                            const visLvl = visObject.get_BaseLevel();
                            if (visLvl < minLvl) {
                                active ? visObject.HideInfos() : visObject.ShowInfos();
                            }
                        }
                    }
                }
            }
            
            HCBtn.set({ label: `${active ? "Show" : "Hide"}` });
        });
        
        // Level Select List
        const levelSelect = new qx.ui.form.SelectBox();
        levelSelect.set({
            width: 45,
            toolTipText: 'Select raid helper minimum visible level infos.'
        });
        for (let i = 1; i <= maxLvl; i++) {
            const item = new qx.ui.form.ListItem(i, null, i);
            levelSelect.add(item);
        }

        const selectedItem = levelSelect.getChildren().find(item => item.getModel() === minLvl);
        if (selectedItem) {
            levelSelect.setSelection([selectedItem]);
        } else {
            console.warn(`Fallback: Could not find level ${minLvl}. Selecting default level.`);
            levelSelect.setSelection([levelSelect.getChildren()[0]]);
        }

        levelSelect.addListener("changeSelection", (e) => {
            minLvl = e.getData()[0].getModel();
            localStorage.setItem(storageKey, JSON.stringify({ ...storedSettings, minLevel: minLvl }));
            HCBtn.set({ label: `${active ? "SHOW" : "HIDE"}` });
        });

        // Add button and level select to container
        container.add(HCBtn);
        container.add(levelSelect);
        
        // Add container to UI
        const app = qx.core.Init.getApplication();
        app.getBackgroundArea().add(container, {
            right: 125,
            bottom: 55
        });
    }
    
    initHideCampsButton();
})();
