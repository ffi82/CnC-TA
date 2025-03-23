// ==UserScript==
// @name         CnC-TA Raid-Helper
// @namespace    https://github.com/ffi82/CnC-TA/
// @description  Removes name and level information except for interesting raid targets. Shows floating point base numbers for tool tips on region view NPC targets.
// @version      2025.03.09
// @author       Mooff
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL    https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Raid-Helper.user.js
// ==/UserScript==
/* global qx, ClientLib, webfrontend */
'use strict';
(function () {
    const scriptName = 'C&C:TA Raid-Helper';
    const initHideCampsButton = () => {
        const app = qx.core.Init.getApplication();
        const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
        const mainData = ClientLib.Data.MainData.GetInstance();
        const server = mainData.get_Server();
        const maxLvl = server.get_PlayerUpgradeCap();
        const storageKey = `${server.get_WorldId()}_raidHelperOffset`;
        const calculateMinLvl = (ownOL, offset, max) => Math.min(Math.max(Math.round(ownOL) + offset, 1), max);
        let minLvlOffset = +localStorage.getItem(storageKey) || 0;
        let minLvl = calculateMinLvl(mainData.get_Cities().get_CurrentOwnCity().get_LvlOffense(), minLvlOffset, maxLvl);
        let active = false;
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const HCBtn = new qx.ui.form.Button(`Hide (< ${minLvl})`);
        const createSpinner = (value, min, max, tooltip) => new qx.ui.form.Spinner().set({
            value,
            minimum: min,
            maximum: max,
            toolTip: new qx.ui.tooltip.ToolTip().set({
                label: tooltip,
                rich: true
            })
        });
        const offsetSpinner = createSpinner(minLvlOffset, -10, 10, '<b>Adjust dynamic level offset</b><br>From -10 to +10.<br>Saved per world.');
        const lvlSelect = createSpinner(minLvl, 1, maxLvl, '<b>Adjust static level</b><br>Temporary override.<br>Resets on city change.');
        const updateMinLvl = () => {
            minLvl = calculateMinLvl(mainData.get_Cities().get_CurrentOwnCity().get_LvlOffense(), minLvlOffset, maxLvl);
            lvlSelect.setValue(minLvl);
            HCBtn.setLabel(`${active ? "Show" : `Hide (< ${minLvl})`}`)
        };
        offsetSpinner.addListener("changeValue", e => {
            minLvlOffset = e.getData();
            localStorage.setItem(storageKey, minLvlOffset);
            updateMinLvl()
        });
        lvlSelect.addListener("changeValue", e => {
            minLvl = e.getData();
            HCBtn.setLabel(`${active ? "Show" : `Hide (< ${minLvl})`}`)
        });
        HCBtn.set({
            width: 80,
            opacity: 0.7,
            toolTip: new qx.ui.tooltip.ToolTip().set({
                label: "<b>Toggle visibility</b><br>Right-click to adjust levels.",
                rich: true
            })
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
        app.getBackgroundArea().add(container, {
            right: 125,
            bottom: 55
        });
        webfrontend.phe.cnc.Util.attachNetEvent(mainData.get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, null, updateMinLvl);
        console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
        ClientLib.Vis.Region.RegionNPCBase.prototype.get_BaseLevel = ClientLib.Vis.Region.RegionNPCBase.prototype.get_BaseLevelFloat;
        ClientLib.Vis.Region.RegionNPCCamp.prototype.get_BaseLevel = ClientLib.Vis.Region.RegionNPCCamp.prototype.get_BaseLevelFloat;
        console.info(`%c${scriptName} extra option enabled: Use more precise NPC levels in region view tool tips (2 decimals places instead of rounded numbers... imported from Shockr Tools)`, "overflow: hidden; color: #fff; background-color: #000; background-image: linear-gradient(black, grey);");
    };
    const waitForGame = () => {
        try {
            (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone || typeof ClientLib === 'undefined' || !ClientLib?.Data?.MainData?.GetInstance()?.get_Cities()?.get_CurrentOwnCity()) ? setTimeout(waitForGame, 1000): initHideCampsButton()
        } catch (e) {
            console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e)
        }
    }
    waitForGame();
})();
