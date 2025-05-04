// ==UserScript==
// @name         CnCTA Base Move Highlighter
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2025.05.05
// @description  Highlights viable targets in the visible area on base move: shows CP cost label for bases (player and NPC) in attack range, shows support icon if selected city has any for player bases in support range, shows tooltip with number of NPC bases in attack range and details plus waves (waves on forgotten attacks worlds only).
// @author       Bloofi
// @contributor  petui, NetquiK, ffi82
// @updateURL    https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-Base-Move-Highlighter.meta.js
// @downloadURL  https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnCTA-Base-Move-Highlighter.user.js
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant        none
// ==/UserScript==
/* global qx, ClientLib, webfrontend, baseMoveHighlighter */
"use strict";
(() => {
    const CnCTA_Base_Move_Highlighter = () => {
        const CreateBMH = () => {
            qx.Class.define("baseMoveHighlighter", {
                type: "singleton",
                extend: qx.core.Object,
                construct: () => {},
                members: {
                    _App: qx.core.Init.getApplication(),
                    _MainData: ClientLib.Data.MainData.GetInstance(),
                    _VisMain: ClientLib.Vis.VisMain.GetInstance(),
                    _ConfigMain: ClientLib.Config.Main.GetInstance(),
                    server: ClientLib.Data.MainData.GetInstance().get_Server(),
                    region: ClientLib.Vis.VisMain.GetInstance().get_Region(),
                    zoomFactor: null,
                    gridWidth: null,
                    gridHeight: null,
                    baseMarkerWidth: null,
                    baseMarkerHeight: null,
                    baseMarkerList: [],
                    wavyPanel: {
                        container: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({ font: "bold", textColor: "white", decorator: "pane-frame-clear" }),
                        labelNbVal: new qx.ui.basic.Label(),
                        labelDetailVal: new qx.ui.basic.Label()
                    },
                    configPanel: {
                        container: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({ backgroundColor: "rgba(0,0,0,0.5)", padding: 5, decorator: "main", opacity: 0.8, zIndex: qx.core.Init.getApplication().getBackgroundArea().getZIndex() + 1, visibility: "excluded" }),
                        configTitle: new qx.ui.basic.Label("Base Move Highlighter Settings").set({ font: "bold", textColor: "white", alignX: "center", paddingBottom: 5, toolTipText: "Highlights viable base move targets in the <b>visible area</b>.<hr>Zoom out to load/view all targets for <i>proper count of bases in attack range</i> from the base move point .<br>Drag/drop the base move point to the center of the screen also helps.<br>Bigger screen size or browser zoom are other options if the previous <i>tricks</i> are still not enough..." }),
                        npcLevelGroup: new qx.ui.container.Composite(new qx.ui.layout.HBox()),
                        checkboxHideAllies: new qx.ui.form.CheckBox("Hide alliance bases").set({ value: false, textColor: "white" }),
                        checkboxHideNonAllies: new qx.ui.form.CheckBox("Hide non alliance bases").set({ value: false, textColor: "white" }),
                        checkboxHideSupportIcon: new qx.ui.form.CheckBox("Hide support icon").set({ value: false, textColor: "white" }),
                        checkboxignoreLowLevelNpc: new qx.ui.form.CheckBox("Hide NPC bases < level:").set({ value: false, textColor: "white", toolTipText: "Disables wave count!" }),
                        ignoreLowLevelNpcSpinner: new qx.ui.form.Spinner(ClientLib.Data.MainData.GetInstance().get_Server().get_NpcLevelAtBorder() - 2, 20, ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel() + 1).set({ width: 50, visibility: "excluded" }),
                        checkboxAutoZoom: new qx.ui.form.CheckBox("Auto Zoom").set({ value: true, textColor: "white", toolTipText: "Adjusts the zoom factor to show all targets in move (20.5) + attack (10.5) range.<br>(shows at least 62 fields width or height)" }),
                    },
                    initialize() {
                        const moveTool = this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.MoveBase);
                        const { OnCellChange, OnActivate, OnDeactivate } = ClientLib.Vis.MouseTool;
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnCellChange", OnCellChange, this, this.baseMoveToolCellChange);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnActivate", OnActivate, this, this.baseMoveToolActivate);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnDeactivate", OnDeactivate, this, this.baseMoveToolDeactivate);
                        this.wavyPanel.container.add(this.wavyPanel.labelNbVal);
                        this.wavyPanel.container.add(this.wavyPanel.labelDetailVal);
                        this.configPanel.npcLevelGroup.add(this.configPanel.checkboxignoreLowLevelNpc);
                        this.configPanel.npcLevelGroup.add(this.configPanel.ignoreLowLevelNpcSpinner);
                        this.configPanel.container.add(this.configPanel.configTitle);
                        this.configPanel.container.add(this.configPanel.checkboxHideAllies);
                        this.configPanel.container.add(this.configPanel.checkboxHideNonAllies);
                        this.configPanel.container.add(this.configPanel.checkboxHideSupportIcon);
                        this.configPanel.container.add(this.configPanel.npcLevelGroup);
                        this.configPanel.container.add(this.configPanel.checkboxAutoZoom);
                        this._App.getBackgroundArea().add(this.configPanel.container, { left: 128, top: 30 })
                    },
                    baseMoveToolActivate() {
                        if (this.configPanel.checkboxAutoZoom.getValue()) {
                            this._ConfigMain.SetConfig(ClientLib.Config.Main.CONFIG_VIS_REGION_MINZOOM, false);
                            this._ConfigMain.SaveToDB();
                            const newMinZoomFactor = Math.max(window.innerWidth / this.region.get_MaxXPosition(), window.innerHeight / this.region.get_MaxYPosition());
                            const neededZoomFactor = Math.min( window.innerWidth / this.region.get_MaxXPosition() * this.server.get_WorldWidth() / (this.server.get_MaxBaseMoveDistance() + this.server.get_MaxAttackDistance()) / 2, window.innerHeight / this.region.get_MaxYPosition() * this.server.get_WorldHeight() / (this.server.get_MaxBaseMoveDistance() + this.server.get_MaxAttackDistance()) / 2); // Auto zoom (enough to view move+attack range fields in any direction) to the minimum safe factor in order to show all targets... might acceleerate one's cooler :P)
                            const getMinZoomMethod = this.region.get_MinZoomFactor.toString().match(/\$I\.[A-Z]{6}\.([A-Z]{6});?}/)?.[1];
                            ClientLib.Vis.Region.Region[getMinZoomMethod] = newMinZoomFactor;
                            this.zoomFactor = this.region.get_ZoomFactor();
                            this.region.set_ZoomFactor(neededZoomFactor);
                        }
                        this.getRegionZoomFactorAndSetMarkerSize();
                        this.configPanel.container.setVisibility("visible");
                        webfrontend.phe.cnc.Util.attachNetEvent(this.region, "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        webfrontend.phe.cnc.Util.attachNetEvent(this.region, "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers)
                    },
                    baseMoveToolDeactivate() {
                        if (this.configPanel.checkboxAutoZoom.getValue()) {
                            this.region.set_ZoomFactor(this.zoomFactor);
                            const currentOwnCity = this._MainData.get_Cities().get_CurrentOwnCity();
                            this._VisMain.CenterGridPosition(currentOwnCity.get_X(), currentOwnCity.get_Y());
                            this._VisMain.Update();
                            this._VisMain.ViewUpdate();
                        }
                        this.configPanel.container.setVisibility("excluded");
                        webfrontend.phe.cnc.Util.detachNetEvent(this.region, "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        webfrontend.phe.cnc.Util.detachNetEvent(this.region, "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                        this.removeMarkers()
                    },
                    baseMoveToolCellChange(startX, startY) {
                        this.slideFadeScaleOutAndRemove(this.wavyPanel.container);
                        this.removeMarkers();
                        this.findBases(startX, startY)
                    },
                    findBases(startX, startY) {
                        const selectedCity = this._VisMain.get_SelectedObject();
                        const { EObjectType } = ClientLib.Vis.VisObject;
                        const results = { total: 0, levels: {} };
                        const supportWeapon = selectedCity.get_VisObjectType() === EObjectType.RegionGhostCity ? null : selectedCity.get_SupportWeapon();
                        const selectedCitySupportRange = supportWeapon ? supportWeapon.r : 0;
                        const icon = supportWeapon && !this.configPanel.checkboxHideSupportIcon.getValue() ? `webfrontend/${supportWeapon.i.orange}.png` : null;
                        const scanRadius = Math.max(Math.ceil(this.server.get_MaxAttackDistance()), selectedCitySupportRange);
                        const selectedPlayerId = selectedCity.get_PlayerId();
                        const selectedAllianceId = selectedCity.get_AllianceId();
                        const minX = startX - scanRadius, maxX = startX + scanRadius, minY = startY - scanRadius, maxY = startY + scanRadius;
                        for (let x = minX; x < maxX; x++) {
                            for (let y = minY; y < maxY; y++) {
                                const visObject = this.region.GetObjectFromPosition(x * this.gridWidth, y * this.gridHeight);
                                if (!visObject) continue;
                                const visObjType = visObject.get_VisObjectType();
                                const baseLevel = visObjType === EObjectType.RegionNPCBase ? Math.round(visObject.get_BaseLevel()) : null;
                                const isOwnBase = visObjType === EObjectType.RegionCityType ? visObject.IsOwnBase() : null;
                                const visPlayerId = visObjType === EObjectType.RegionCityType ? visObject.get_PlayerId() : null;
                                const visAllianceId = visObjType === EObjectType.RegionCityType ? visObject.get_AllianceId() : null;
                                const isSameAlliance = visAllianceId !== 0 && visAllianceId === selectedAllianceId;
                                this.configPanel.checkboxignoreLowLevelNpc.getValue() ? this.configPanel.ignoreLowLevelNpcSpinner.setVisibility("visible") : this.configPanel.ignoreLowLevelNpcSpinner.setVisibility("excluded");
                                if (isOwnBase || (this.configPanel.checkboxHideAllies.getValue() && isSameAlliance) || (this.configPanel.checkboxHideNonAllies.getValue() && !isSameAlliance && visObjType === EObjectType.RegionCityType) || (visObjType === EObjectType.RegionNPCBase && this.configPanel.checkboxignoreLowLevelNpc.getValue() && baseLevel < this.configPanel.ignoreLowLevelNpcSpinner.getValue())) continue;
                                const visBaseX = visObject.get_RawX();
                                const visBaseY = visObject.get_RawY();
                                const distance = Math.hypot(startX - visBaseX, startY - visBaseY);
                                const cpCost = this._MainData.get_World().GetTerritoryTypeByCoordinates(visBaseX, visBaseY) === ClientLib.Data.ETerritoryType.Alliance || visObjType === EObjectType.RegionCityType ? Math.floor(3 + distance) : Math.floor(10 + distance * 3);
                                const color = distance <= this.server.get_MaxAttackDistance() ? visObjType === EObjectType.RegionNPCBase ? (results.total++, results.levels[baseLevel] = (results.levels[baseLevel] ?? 0) + 1, "yellowgreen") : visObjType === EObjectType.RegionCityType && !isOwnBase ? visPlayerId === selectedPlayerId ? "white" : isSameAlliance ? "royalblue" : "salmon" : null : visObjType === EObjectType.RegionCityType && distance < selectedCitySupportRange ? "transparent" : null;
                                const showType = visObjType === EObjectType.RegionCityType ? (distance <= selectedCitySupportRange && distance <= this.server.get_MaxAttackDistance() ? "both" : (distance <= selectedCitySupportRange && distance > this.server.get_MaxAttackDistance() ? "icon" : "label")) : (visObjType === EObjectType.RegionNPCBase || visObjType === EObjectType.RegionGhostCity ? "label" : null);
                                const textColor = visObjType === EObjectType.RegionCityType ? "white" : "black";
                                if (color) this.addMarker(visBaseX, visBaseY, color, cpCost, textColor, showType, icon)
                            }
                        }
                        const detailString = Object.entries(results.levels).sort(([lvlA], [lvlB]) => lvlB - lvlA).map(([level, count]) => `[${count} x ${level}]`).join("  ");
                        this.wavyPanel.labelDetailVal.setValue(detailString);
                        const waveCount = Math.max(1, Math.min(5, Math.floor(results.total / 10)));
                        const waveStr = this.server.get_ForgottenAttacksEnabled() && !this.configPanel.checkboxignoreLowLevelNpc.getValue() ? `${results.total} (${waveCount} wave${waveCount != 1 ? 's' : ''})` : `${results.total}`;
                        this.wavyPanel.labelNbVal.setValue(`NPC Bases : ${waveStr}`);
                        const regionCityMoveInfo = webfrontend.gui.region.RegionCityMoveInfo.getInstance();
                        regionCityMoveInfo.setZIndex(this._App.getBackgroundArea().getZIndex() + 1);
                        regionCityMoveInfo.add(this.wavyPanel.container)
                    },
                    addMarker(bx, by, color, cpCost, textColor, showType, icon) {
                        const marker = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({ decorator: new qx.ui.decoration.Decorator().set({ width: 1, style: "solid", color: "black", backgroundColor: color, shadowColor: color, radius: 6, shadowLength: 4, shadowBlurRadius: 2 }), width: this.baseMarkerWidth, height: this.baseMarkerHeight, opacity: 0.7 });
                        const atom = new qx.ui.basic.Atom(String(cpCost), icon).set({ textColor: textColor, font: "bold", iconPosition: "top", width: this.baseMarkerWidth, height: this.baseMarkerHeight, rich: true, center: true, show: showType });
                        marker.add(atom);
                        this._App.getBackgroundArea().addAfter(marker, this._App.getBackgroundArea(), { left: this._VisMain.ScreenPosFromWorldPosX(bx * this.gridWidth), top: this._VisMain.ScreenPosFromWorldPosY(by * this.gridHeight) });
                        this.baseMarkerList.push({ element: marker, x: bx, y: by })
                    },
                    removeMarkers() {
                        this.baseMarkerList.forEach(markerData => this._App.getBackgroundArea().remove(markerData.element));
                        this.baseMarkerList = []
                    },
                    getRegionZoomFactorAndSetMarkerSize() {
                        this.gridWidth = this.region.get_GridWidth();
                        this.gridHeight = this.region.get_GridHeight();
                        this.baseMarkerWidth = this.gridWidth * this.region.get_ZoomFactor();
                        this.baseMarkerHeight = this.gridHeight * this.region.get_ZoomFactor()
                    },
                    repositionMarkers() {
                        this.baseMarkerList.forEach(markerData => { markerData.element.setDomLeft(this._VisMain.ScreenPosFromWorldPosX(markerData.x * this.gridWidth)); markerData.element.setDomTop(this._VisMain.ScreenPosFromWorldPosY(markerData.y * this.gridHeight)) })
                    },
                    resizeMarkers() {
                        this.getRegionZoomFactorAndSetMarkerSize();
                        this.baseMarkerList.forEach(markerData => { markerData.element.setWidth(this.baseMarkerWidth); markerData.element.setHeight(this.baseMarkerHeight) })
                    },
                    slideFadeScaleOutAndRemove(widget) {
                        const el = widget.getContentElement().getDomElement();
                        if (!el) return;
                        qx.bom.element.Animation.animate(el, { duration: 400, timing: "ease-out", keyFrames: { 0: { opacity: 1, transform: "translateY(0px) scale(1)" }, 100: { opacity: 0, transform: "translateY(20px) scale(0.1)" }}, onEnd: widget.getLayoutParent()?.remove(widget) })
                    }
                }
            });
            baseMoveHighlighter.getInstance().initialize();
        }
        const checkForInit = () => {
            const scriptName = 'CnCTA Base Move Highlighter';
            try {
                if (typeof qx === 'undefined' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                CreateBMH();
                console.info(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border: 1px solid black; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px;  border: 1px solid black; border-radius: 5px;', e);
            }
        };
        checkForInit();
    }
    CnCTA_Base_Move_Highlighter();
})();
