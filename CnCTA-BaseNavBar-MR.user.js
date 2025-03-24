// ==UserScript==
// @name        CnCTA BaseNavigationBar MR
// @version     2025.03.24
// @description Shows base move recovery on the Base Navigation Bar.
// @author      bloofi (https://github.com/bloofi)
// @contributor ffi82
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-BaseNavBar-MR.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-BaseNavBar-MR.user.js
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant       none
// ==/UserScript==
/* global qx, ClientLib */
"use strict";
(() => {
    const BaseNavigationBarMR = () => {
        const labels = {};
        const updateMoveRecovery = () => {
            Object.values(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d).forEach(c => {
                const time = c.get_MoveCooldownEndStep() - ClientLib.Data.MainData.GetInstance().get_Time().GetServerStep();
                const s = ClientLib.Data.MainData.GetInstance().get_Time().GetTimespanString(time, 0);
                labels[`base-${c.get_Id()}`]?.setValue(time > 0 ? s : '');
            });
        };
        const initLabels = (basePanels) => {
            basePanels.forEach(p => {
                if (p.getBaseId && p.getBaseId()) {
                    const label = new qx.ui.basic.Label('').set({ textColor: '#cc0000' });
                    labels[`base-${p.getBaseId()}`] = label;
                    p.add(label, { bottom: 2, right: 0 });
                }
            });
            setInterval(updateMoveRecovery, 1000);
        };
        const checkForBases = () => {
            const basePanels = qx.core.Init.getApplication().getBaseNavigationBar().getChildren()[0].getChildren()[0].getChildren();;
            basePanels.length > 1 ? initLabels(basePanels) : setTimeout(checkForBases, 1000);
        };
        const checkForInit = () => {
            const scriptName = 'CnCTA BaseNavigationBar MR';
            try {
                if (typeof qx === 'undefined' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                checkForBases();
                console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        };
        checkForInit();
    };
    BaseNavigationBarMR();
})();
