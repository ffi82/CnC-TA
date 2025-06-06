// ==UserScript==
// @name        Tiberium Alliances Formation Saver
// @namespace   https://github.com/ffi82
// @version     2025.03.02
// @description Allows you to save attack formations
// @author      Panavia, KRS_L, DebitoSphere
// @contributor NetquiK (https://github.com/netquik), ffi82
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/Formation_Saver.meta.js
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/Formation_Saver.user.js
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant       none
// ==/UserScript==

(() => {
    var tafs_main = function () {
        const scriptName = 'Tiberium Alliances Formation Saver';
        var windowSaver;

        function initialize() {
            qx.Class.define("webfrontend.gui.PlayArea.FormationSaver", {
                extend: qx.ui.container.Composite,

                construct: function () {
                    qx.ui.container.Composite.call(this);
                    this.setLayout(new qx.ui.layout.Canvas());
                    this.add(this.init());
                },

                statics: {
                    SaverCollapsedHeight: 32,
                    SaverExpandedHeight: 245,
                },

                properties: {
                    expanded: {
                        init: true,
                        apply: "expand"
                    },
                },

                members: {
                    buttonResize: null,
                    containerContence: null,
                    containerSaves: null,
                    containerMain: null,
                    buttonSave: null,

                    init: function () {
                        var Y = 6;
                        this.buttonResize = new webfrontend.ui.SoundButton(null, "FactionUI/icons/icon_tracker_minimise.png").set({
                            width: 20,
                            height: 20,
                            appearance: "button-notif-cat",
                            center: true,
                            allowGrowX: false
                        });
                        this.buttonResize.addListener("click", function (e) {
                            this.setExpanded(!this.getExpanded());
                        }, this);
                        var ba = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
                            alignY: "middle"
                        })).set({
                            margin: Y,
                            marginRight: Y + 3
                        });
                        ba.add(this.buttonResize);
                        var labelTitle = new qx.ui.basic.Label("<b>Saver</b>");
                        labelTitle.set({
                            marginLeft: 4,
                            rich: true
                        });
                        labelTitle.setTextColor("#FFFFFF");
                        ba.add(labelTitle);
                        this.containerContence = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
                            alignX: "center"
                        })).set({
                            allowGrowX: true,
                            marginTop: 0,
                            marginBottom: 5
                        });

                        containerSaves = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 2)).set({
                            allowGrowX: true,
                            marginLeft: 0,
                            marginBottom: 5
                        });
                        this.containerContence.add(containerSaves);

                        buttonSave = new qx.ui.form.Button("Save");
                        buttonSave.set({
                            width: 50,
                            appearance: "button-text-small",
                            toolTipText: "Save attack formation",
                            allowGrowX: false
                        });
                        buttonSave.addListener("click", this.save, this);
                        this.containerContence.add(buttonSave);

                        this.containerMain = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
                            alignX: "right"
                        })).set({
                            maxHeight: webfrontend.gui.PlayArea.FormationSaver.SaverExpandedHeight,
                            width: 75,
                            minHeight: 32,
                            allowShrinkY: true
                        });
                        this.containerMain.add(ba);
                        this.containerMain.add(this.containerContence, {
                            flex: 1
                        });

                        return this.containerMain;
                    },

                    expand: function (bs) {
                        if (!bs) {
                            this.buttonResize.setIcon("FactionUI/icons/icon_tracker_maximise.png");
                            this.containerMain.setMaxHeight(webfrontend.gui.PlayArea.FormationSaver.SaverCollapsedHeight);
                        } else {
                            this.buttonResize.setIcon("FactionUI/icons/icon_tracker_minimise.png");
                            this.containerMain.setMaxHeight(webfrontend.gui.PlayArea.FormationSaver.SaverExpandedHeight);
                        }
                    },

                    update: function () {
                        containerSaves.removeAll();

                        var playerCities = ClientLib.Data.MainData.GetInstance().get_Cities();
                        var currentOwnCity = playerCities.get_CurrentOwnCity();
                        var cityID = playerCities.get_CurrentCity().get_Id();
                        var ownCityID = currentOwnCity.get_Id();

                        var formations = this.loadFormations();
                        if (!formations) {
                            return;
                        }
                        if (!formations[cityID]) {
                            return;
                        }
                        if (!formations[cityID][ownCityID]) {
                            return;
                        }

                        var i = 0;
                        for (var id in formations[cityID][ownCityID]) {
                            if (id != 0) {
                                i++;
                                var formation = formations[cityID][ownCityID][id];
                                var date = new Date(Number(formation.t));
                                var toolTipText = "<div><span style='float: left'><b>" + formation.n + "</b></span><span style='float: right'>&nbsp;&nbsp;&nbsp;&nbsp;" + date.getHours() + ":" + (date.getMinutes() <= 9 ? "0" : "") + date.getMinutes() + " " + date.getDate() + "/" + (date.getMonth() + 1) + "</span></div><div style='clear: both;'></div>";
                                if (formation.cy != null) {
                                    toolTipText += formation.cy + "% Construction Yard</br>" + formation.df + "% Defense Facility</br>" + formation.ts + "% Troop Strength</br>" + this.formatSecondsAsTime(formation.r) + " Repair Time";
                                }

                                var labelLoad = new qx.ui.basic.Label(formation.n);
                                labelLoad.set({
                                    width: 40,
                                    allowGrowX: false,
                                    toolTipText: toolTipText
                                });
                                labelLoad.setTextColor("#FFFFFF");
                                labelLoad.addListener("click", this.clickLoad(formation), this);
                                labelLoad.addListener("mouseover", this.mouseover(labelLoad, "#BBBBBB"), this);
                                labelLoad.addListener("mouseout", this.mouseout(labelLoad, "#FFFFFF"), this);
                                containerSaves.add(labelLoad, {
                                    row: i,
                                    column: 1
                                });

                                var labelDelete = new qx.ui.basic.Label("<b>X</b>");
                                labelDelete.set({
                                    width: 10,
                                    allowGrowX: false,
                                    rich: true,
                                    toolTipText: "Delete " + formation.n
                                });
                                labelDelete.setTextColor("#881717");
                                labelDelete.addListener("click", this.clickDeleteF(cityID, ownCityID, id), this);
                                labelDelete.addListener("mouseover", this.mouseover(labelDelete, "#550909"), this);
                                labelDelete.addListener("mouseout", this.mouseover(labelDelete, "#881717"), this);
                                containerSaves.add(labelDelete, {
                                    row: i,
                                    column: 2
                                });
                            }
                        }
                    },

                    mouseover: function (label, color) {
                        return function () {
                            label.setTextColor(color);
                        }
                    },

                    mouseout: function (label, color) {
                        return function () {
                            label.setTextColor(color);
                        }
                    },

                    save: function () {
                        try {
                            var playerCities = ClientLib.Data.MainData.GetInstance().get_Cities();
                            var currentOwnCity = playerCities.get_CurrentOwnCity();
                            var cityID = playerCities.get_CurrentCity().get_Id();
                            var ownCityID = currentOwnCity.get_Id();

                            var newFormation = new Object();
                            newFormation.t = new Date().getTime().toString();
                            newFormation.n = "";
                            newFormation.l = new Array();

                            var formation = currentOwnCity.get_CityArmyFormationsManager().GetFormationByTargetBaseId(cityID);
                            var armyUnits = formation.get_ArmyUnits();
                            if (armyUnits == null) {
                                console.log("tafs Error: You must move a unit befor saving!");
                                return;
                            }
                            armyUnits = armyUnits.l;
                            for (var i in armyUnits) {
                                var unit = armyUnits[i];
                                newFormation.l[i] = new Object();
                                newFormation.l[i].x = unit.get_CoordX();
                                newFormation.l[i].y = unit.get_CoordY();
                                newFormation.l[i].e = unit.get_Enabled();
                            }

                            var formations = this.loadFormations();
                            if (!formations) {
                                formations = new Object();
                            }
                            if (!formations[cityID]) {
                                formations[cityID] = new Object();
                            }
                            if (!formations[cityID][ownCityID]) {
                                formations[cityID][ownCityID] = new Array();
                                formations[cityID][ownCityID][0] = 0;
                            }
                            formations[cityID][ownCityID][0]++;
                            newFormation.n = "Save " + formations[cityID][ownCityID][0];

                            formations[cityID][ownCityID].push(newFormation);
                            this.saveFormations(formations);

                            windowSaver.update();
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    clickLoad: function (newFormation) {
                        return function () {
                            this.load(newFormation);
                        }
                    },

                    load: function (newFormation) {
                        try {
                            var playerCities = ClientLib.Data.MainData.GetInstance().get_Cities();
                            var currentOwnCity = playerCities.get_CurrentOwnCity();
                            var cityID = playerCities.get_CurrentCity().get_Id();

                            var formation = currentOwnCity.get_CityArmyFormationsManager().GetFormationByTargetBaseId(cityID);
                            var armyUnits = formation.get_ArmyUnits();
                            if (armyUnits == null) {
                                console.log("tafs Error: You must move a unit befor loading!");
                                return;
                            }
                            armyUnits = armyUnits.l;

                            for (var i in newFormation.l) {
                                var unitData = newFormation.l[i];
                                armyUnits[i].MoveBattleUnit(unitData.x, unitData.y);
                                if (unitData.e != null) {
                                    if (armyUnits[i].set_Enabled_Original) {
                                        armyUnits[i].set_Enabled_Original(unitData.e);
                                    } else {
                                        armyUnits[i].set_Enabled(unitData.e);
                                    }
                                }
                            }

                            //formation.set_CurrentTargetBaseId(cityID);
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    clickDeleteF: function (cityID, ownCityID, id) {
                        return function () {
                            this.deleteF(cityID, ownCityID, id);
                        }
                    },

                    deleteF: function (cityID, ownCityID, id) {
                        var formations = this.loadFormations();
                        if (!formations || !formations[cityID] || !formations[cityID][ownCityID])
                            return;

                        formations[cityID][ownCityID].splice(id, 1);
                        if (formations[cityID][ownCityID].length <= 1) {
                            delete formations[cityID][ownCityID];
                        }
                        var i
                        for (i in formations[cityID]) {
                            if (formations[cityID].hasOwnProperty(i)) {
                                break;
                            }
                        }
                        if (!i)
                            delete formations[cityID];

                        this.saveFormations(formations);

                        windowSaver.update();
                    },

                    saveFormations: function (formations) {
                        var data = JSON.stringify(formations);
                        localStorage.formations = data;
                    },

                    loadFormations: function () {
                        var formations = localStorage.formations;
                        return formations && JSON.parse(formations);
                    },

                    formatSecondsAsTime: function (secs, format) {
                        var hr = Math.floor(secs / 3600);
                        var min = Math.floor((secs - (hr * 3600)) / 60);
                        var sec = Math.floor(secs - (hr * 3600) - (min * 60));

                        if (hr < 10) {
                            hr = "0" + hr;
                        }
                        if (min < 10) {
                            min = "0" + min;
                        }
                        if (sec < 10) {
                            sec = "0" + sec;
                        }

                        return hr + ':' + min + ':' + sec;
                    },
                }
            })

            windowSaver = new webfrontend.gui.PlayArea.FormationSaver();
            windowSaver.hide();
            let top_pos;
            //MOD Fix for 21.4 topPOIInfoLayout
            //if (parseFloat(GameVersion) >= 21.4) { // 21.4 Check
            top_pos = 125;
            //} else top_pos = 55;
            qx.core.Init.getApplication().getPlayArea().add(windowSaver, {
                top: top_pos,
                right: -2
            });

            if (!ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentOwnCityId) {
                ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentOwnCityId = ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentOwnCityId;
            }
            ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentOwnCityId = function (a) {
                this.__tafs__set_CurrentOwnCityId(a);
                updateView();
            }

            if (!ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentCityId) {
                ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId;
            }
            ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId = function (a) {
                this.__tafs__set_CurrentCityId(a);
                updateView();
            }

            function updateView() {
                if (PerforceChangelist >= 376877) {
                    switch (qx.core.Init.getApplication().getPlayArea().getViewMode()) {
                    case ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense:
                    case ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupBase:
                        windowSaver.update();
                        windowSaver.show();
                        break;
                    default:
                        windowSaver.hide();
                    }
                } else {
                    switch (qx.core.Init.getApplication().getPlayArea().getViewMode()) {
                    case webfrontend.gui.PlayArea.PlayArea.modes.EMode_CombatSetupDefense:
                    case webfrontend.gui.PlayArea.PlayArea.modes.EMode_CombatSetupBase:
                        windowSaver.update();
                        windowSaver.show();
                        break;
                    default:
                        windowSaver.hide();
                    }
                }
            }
        }

        function checkForInit() {
            try {
                if (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone || !ClientLib?.Data?.MainData?.GetInstance()) return setTimeout(checkForInit, 1000);
                initialize();
                console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error:`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        }
        checkForInit();
    }
    try {
        const script = document.createElement("script");
        script.textContent = `(${tafs_main})();`;
        script.type = "text/javascript";
        document.head.appendChild(script);
    } catch (e) {
        console.error(`%cTiberium Alliances Formation Saver init error:`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
    }
})();
