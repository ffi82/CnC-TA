// ==UserScript==
// @name         CnC-TA Raid-Helper
// @namespace    https://github.com/ffi82/CnC-TA/
// @description  Removes name and level information except for interesting raid targets.
// @version      2024.12.26
// @author       Mooff
// @contributor  Topper42, alexos75, ffi82
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL    https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.user.js
// ==/UserScript==
'use strict';
(function() {
    function initHideCampsButton() {
        if (typeof ClientLib === 'undefined' || typeof qx === 'undefined' || !qx.core.Init.getApplication().initDone ) {
            setTimeout(initHideCampsButton, 100);
            return;
        }
        const scriptName = "CnC-TA Raid-Helper";
        const app = qx.core.Init.getApplication();
        const mainData = ClientLib.Data.MainData.GetInstance();
        const server = mainData.get_Server();
        const worldId = server.get_WorldId();
        const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
        const objType = ClientLib.Vis.VisObject.EObjectType;
        const storageKey = `raidhelper_settings_${worldId}`;
        const storedSettings = JSON.parse(localStorage.getItem(storageKey)) || {};
        const maxLvl = server.get_PlayerUpgradeCap();
        let minLvl = storedSettings.minLevel ?? Math.min(mainData.get_Cities().get_CurrentOwnCity().get_LvlOffense(), maxLvl);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const HCBtn = new qx.ui.form.Button("Hide (< " + minLvl + ")");
        const levelSelect = new qx.ui.form.SelectBox();
        let active = false;
        HCBtn.set({
            width: 80,
            opacity: .7,
            toolTip: (new qx.ui.tooltip.ToolTip).set({
                label: "<b>Hide/Show Infos</b><br>For forgotten targets and player bases<br>that are <i>under</i> the selected level<br>in range of your selected base.<br><br>Right click for custom level select.",
                rich: true
            })
        });
        HCBtn.addListener("click", () => {
            const currCity = mainData.get_Cities().get_CurrentOwnCity();
            const x = currCity.get_X();
            const y = currCity.get_Y();
            const attackDistance = server.get_MaxAttackDistance();
            active = !active;
            for (let i = Math.max(x - attackDistance, 0); i < Math.min(x + attackDistance, server.get_WorldWidth()); i++) {
                for (let j = Math.max(y - attackDistance, 0); j < Math.min(y + attackDistance, server.get_WorldHeight()); j++) {
                    const visObject = region.GetObjectFromPosition(i * region.get_GridWidth(), j * region.get_GridHeight());
                    if (visObject) {
                        const visType = visObject.get_VisObjectType();
                        if ((visType === objType.RegionNPCCamp) || (visType === objType.RegionNPCBase) || (visType === objType.RegionCityType)) {
                            const visLvl = visObject.get_BaseLevel();
                            if (visLvl < minLvl) {
                                active ? visObject.HideInfos() : visObject.ShowInfos();
                            }
                        }
                    }
                }
            }
            HCBtn.setLabel(`${active ? "Show" : "Hide (< " + minLvl + ")"}`);
        });
        HCBtn.addListener("contextmenu", () => {container.add(levelSelect)});
        for (let i = 1; i <= maxLvl; i++) levelSelect.add(new qx.ui.form.ListItem(i, null, i));
        const selectedItem = levelSelect.getChildren().find(item => item.getModel() === minLvl);
        levelSelect.set({
            width: 80,
            toolTipText: 'Select raid helper minimum visible level infos.',
            opacity: .7,
            selection: [selectedItem]
        });
        levelSelect.addListener("changeSelection", (e) => {
            minLvl = e.getData()[0].getModel();
            localStorage.setItem(storageKey, JSON.stringify({ ...storedSettings, minLevel: minLvl }));
            HCBtn.setLabel(`${active ? "Show" : "Hide (< " + minLvl + ")"}`);
            container.remove(levelSelect);
        });
        container.add(HCBtn);
        app.getBackgroundArea().add(container, {
            right: 125,
            bottom: 55
        });
        console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
    }
    initHideCampsButton();
})();
