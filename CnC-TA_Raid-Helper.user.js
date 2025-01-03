// ==UserScript==
// @name         CnC-TA Raid-Helper
// @namespace    https://github.com/ffi82/CnC-TA/
// @description  Removes name and level information except for interesting raid targets.
// @version      2025.01.03
// @author       Mooff
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL    https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.user.js
// ==/UserScript==
'use strict';

(function () {
    const initHideCampsButton = () => {
        if (typeof ClientLib === 'undefined' || typeof qx === 'undefined' || !qx.core.Init.getApplication().initDone || !ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity()) {
            return setTimeout(initHideCampsButton, 100);
        }

        const app = qx.core.Init.getApplication();
        const mainData = ClientLib.Data.MainData.GetInstance();
        const server = mainData.get_Server();
        const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
        const maxLvl = server.get_PlayerUpgradeCap();
        const storageKey = `${server.get_WorldId()}_raidHelperOffset`;
        let active = false, minLvlOffset = +localStorage.getItem(storageKey) || 0;

        const calculateMinLvl = (ownOL, offset, max) => Math.min(Math.max(Math.round(ownOL) + offset, 1), max);
        let minLvl = calculateMinLvl(mainData.get_Cities().get_CurrentOwnCity().get_LvlOffense(), minLvlOffset, maxLvl);

        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const HCBtn = new qx.ui.form.Button(`Hide (< ${minLvl})`);
        const createSpinner = (value, min, max, tooltip) => new qx.ui.form.Spinner().set({ value, minimum: min, maximum: max, toolTip: new qx.ui.tooltip.ToolTip().set({ label: tooltip, rich: true }) });

        const offsetSpinner = createSpinner(minLvlOffset, -10, 10, '<b>Adjust dynamic level offset</b><br>From -10 to +10.<br>Saved per world.');
        const lvlSelect = createSpinner(minLvl, 1, maxLvl, '<b>Adjust static level</b><br>Temporary override.<br>Resets on city change.');

        const updateMinLvl = () => {
            minLvl = calculateMinLvl(mainData.get_Cities().get_CurrentOwnCity().get_LvlOffense(), minLvlOffset, maxLvl);
            lvlSelect.setValue(minLvl);
            HCBtn.setLabel(`${active ? "Show" : `Hide (< ${minLvl})`}`);
        };

        offsetSpinner.addListener("changeValue", e => {
            minLvlOffset = e.getData();
            localStorage.setItem(storageKey, minLvlOffset);
            updateMinLvl();
        });

        lvlSelect.addListener("changeValue", e => {
            minLvl = e.getData();
            HCBtn.setLabel(`${active ? "Show" : `Hide (< ${minLvl})`}`);
        });

        HCBtn.set({
            width: 100,
            opacity: 0.7,
            toolTip: new qx.ui.tooltip.ToolTip().set({ label: "<b>Toggle visibility</b><br>Right-click to adjust levels.", rich: true })
        });

        HCBtn.addListener("contextmenu", () => container.add(offsetSpinner) || container.add(lvlSelect));
        HCBtn.addListener("click", () => {
            active = !active;
            const currCity = mainData.get_Cities().get_CurrentOwnCity();
            const [x, y] = [currCity.get_X(), currCity.get_Y()];
            const attackDistance = server.get_MaxAttackDistance();
            const objType = ClientLib.Vis.VisObject.EObjectType;

            for (let i = Math.max(x - attackDistance, 0); i <= Math.min(x + attackDistance, server.get_WorldWidth()); i++) {
                for (let j = Math.max(y - attackDistance, 0); j <= Math.min(y + attackDistance, server.get_WorldHeight()); j++) {
                    const visObject = region.GetObjectFromPosition(i * region.get_GridWidth(), j * region.get_GridHeight());
                    if (visObject && [objType.RegionNPCCamp, objType.RegionNPCBase, objType.RegionCityType].includes(visObject.get_VisObjectType()) && visObject.get_BaseLevel() < minLvl) {
                        active ? visObject.HideInfos() : visObject.ShowInfos();
                    }
                }
            }
            HCBtn.setLabel(`${active ? "Show" : `Hide (< ${minLvl})`}`);
            [offsetSpinner, lvlSelect].forEach(spinner => container.indexOf(spinner) !== -1 && container.remove(spinner));
        });

        container.add(HCBtn);
        app.getBackgroundArea().add(container, { right: 125, bottom: 55 });
        webfrontend.phe.cnc.Util.attachNetEvent(mainData.get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, null, updateMinLvl);
        console.log(`%cCnC-TA Raid-Helper loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
    };

    initHideCampsButton();
})();
