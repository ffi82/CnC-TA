// ==UserScript==
// @name         CnC-TA Loader
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2025-02-23
// @description  makes all the checks needed before allowing usercript injections... a "standard" waitForGame function.
// @author       ffi82
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant        none
// ==/UserScript==
'use strict';
(() => {
    const scriptName = 'C&C:TA Loader';

    function checkForInit() {
        try {
            if (
                typeof qx === 'undefined' ||
                !qx ||
                !qx.core ||
                !qx.core.Init ||
                typeof qx.core.Init.getApplication !== 'function'
            ) {
                return setTimeout(checkForInit, 1000);
            }

            const app = qx.core.Init.getApplication();
            if (!app || !app.initDone) {
                return setTimeout(checkForInit, 1000);
            }
            if (
                typeof ClientLib === 'undefined' ||
                !ClientLib ||
                !ClientLib.Config.Main.GetInstance() ||
                !ClientLib.Data.MainData.GetInstance() ||
                !ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity() ||
                !ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter() ||
                !ClientLib.Data.MainData.GetInstance().get_Player().get_Faction() ||
                !ClientLib.Data.Missions.PATH ||
                !ClientLib.Net.CommunicationManager.GetInstance() ||
                !ClientLib.Vis.VisMain.GetInstance() ||
                !ClientLib.Vis.VisMain.GetInstance().get_Region()
            ) {
                return setTimeout(checkForInit, 1000);
            }
            //init();
            console.log(`%c${scriptName} loaded`, 'background: lime; color: black; font-weight:bold; padding: 3px; border-radius: 5px;');
        } catch (e) {
            console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
        }
    }
    checkForInit();
})();
