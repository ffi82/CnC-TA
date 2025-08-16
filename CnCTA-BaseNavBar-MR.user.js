// ==UserScript==
// @name        CnCTA BaseNavigationBar MR
// @version     2025.08.16
// @description On the Base Navigation Bar it shows the base move recovery (red) or time since the last move cooldown ended (green); right-click navbar to toggle the green values.
// @author      bloofi (https://github.com/bloofi)
// @contributor ffi82
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-BaseNavBar-MR.meta.js
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-BaseNavBar-MR.user.js
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant       none
// ==/UserScript==
/* global qx, ClientLib, webfrontend */
(() => {
    const scriptName = 'CnCTA BaseNavigationBar MR';
    let showGreen = localStorage.getItem(scriptName) !== "false", labels = {}, pop;
    const rightClickHint = (txt, steps, x, y) => {
        if (!pop) {
            pop = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({ padding: 4, backgroundColor: "rgba(0,0,0,0.5)", decorator: "wb-main", opacity: 0.8 });
            pop.add(pop.__lbl = new qx.ui.basic.Label().set({ textColor: "lime", font: "default", selectable: false }), { left: 0, top: 0 });
            qx.core.Init.getApplication().getRoot().add(pop);
        }
        pop.__lbl.setValue(txt);
        pop.placeToPoint ? pop.placeToPoint({ left: x, top: y }) : pop.moveTo(x, y);
        pop.show();
        qx.event.Timer.once(() => pop.hide(), null, steps);
    };
    const update = () => {
        const md = ClientLib.Data.MainData.GetInstance(), step = md.get_Time().GetServerStep(), cities = md.get_Cities().get_AllCities().d;
        for (const id in labels) {
            const l = labels[id]; if (!l) continue;
            const c = cities[id]; if (!c) continue;
            const end = c.get_MoveCooldownEndStep(), green = step > end, span = webfrontend.phe.cnc.Util.getTimespanString(Math.abs(step - end));
            (green ? showGreen : true) ? (l.show(), l.set({ value: span, textColor: green ? "darkgreen" : "darkred" })) : l.hide();
        }
    };
    const scan = () => {
        const app = qx.core.Init.getApplication(), nav = app.getBaseNavigationBar(), panels = nav?.getChildren()?.[0]?.getChildren()?.[0]?.getChildren() || [];
        if (!nav.__mrInit) {
            nav.addListener("contextmenu", e => {
                e.preventDefault();
                e.stopPropagation();
                showGreen = !showGreen;
                localStorage.setItem(scriptName, showGreen);
                update();
                rightClickHint(`Green ${showGreen ? "shown" : "hidden"} (time since the last move cooldown ended)`, 3000, e.getDocumentLeft(), e.getDocumentTop());
            });
            nav.__mrInit = true;
        }
        for (const p of panels) {
            const id = p.getBaseId?.(); if (!id) continue;
            if (!labels[id]) labels[id] = new qx.ui.basic.Label();
            if (!p.getChildren().includes(labels[id])) p.add(labels[id], { bottom: 2, right: 0 });
        }
        update();
        setTimeout(scan, 1000);
    };
    (function init() {try {typeof qx === 'undefined' || !qx?.core?.Init?.getApplication()?.initDone ? setTimeout(init, 1000) : (scan(), console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border: 1px solid black; border-radius: 5px;'))} catch (e) {console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px;  border: 1px solid black; border-radius: 5px;', e)}})();
})();
