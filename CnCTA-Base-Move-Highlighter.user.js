// ==UserScript==
// @name         CnCTA Base Move Highlighter
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2025.04.10
// @description  Highlights viable base move targets, shows CP cost label for bases (player and NPC) in attack range, shows support icon if selected city has any for player bases in support range, shows tooltip with number of NPC bases in attack range and details plus waves (waves on forgotten attacks worlds only).
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
                    _App: null,
                    _MainData: null,
                    _VisMain: null,
                    maxAttackDistance : null,
                    scanDistance : null,
                    wavyPanel: {
                        grid: null,
                        labelNb: null,
                        labelNbVal: null,
                        labelDetail: null,
                        labelDetailVal: null
                    },
                    configPanel: {
                        configTitle: null,
                        npcLevelGroup: null,
                        checkboxHideAllies: null,
                        checkboxHideNonAllies: null,
                        checkboxignoreLowLevelNpc: null,
                        ignoreLowLevelNpcSpinner: null
                    },
                    regionCityMoveInfoAddonExists: null,
                    gridWidth: null,
                    gridHeight: null,
                    baseMarkerWidth: null,
                    baseMarkerHeight: null,
                    regionZoomFactor: null,
                    baseMarkerList: null,
                    initialize() {
                        this._App = qx.core.Init.getApplication();
                        this._MainData = ClientLib.Data.MainData.GetInstance();
                        this._VisMain = ClientLib.Vis.VisMain.GetInstance();
                        const server = this._MainData?.get_Server?.();
                        this.maxAttackDistance = server.get_MaxAttackDistance();
                        this.scanDistance = Math.ceil(this.maxAttackDistance);
                        this.baseMarkerList = [];
                        const moveTool = this._VisMain.GetMouseTool(ClientLib.Vis.MouseTool.EMouseTool.MoveBase);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnCellChange", ClientLib.Vis.MouseTool.OnCellChange, this, this.baseMoveToolCellChange);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnActivate", ClientLib.Vis.MouseTool.OnActivate, this, this.baseMoveToolActivate);
                        webfrontend.phe.cnc.Util.attachNetEvent(moveTool, "OnDeactivate", ClientLib.Vis.MouseTool.OnDeactivate, this, this.baseMoveToolDeactivate);
                        this.wavyPanel.grid = new qx.ui.container.Composite(new qx.ui.layout.Grid(2, 2));
                        const createLabel = text => new qx.ui.basic.Label(text).set({font: "bold", textColor: "white", alignY: "top", alignX: "right"});
                        this.wavyPanel.labelNb = createLabel("NPC Bases : ");
                        this.wavyPanel.labelDetail = createLabel("Detail : ");
                        this.wavyPanel.labelNbVal = new qx.ui.basic.Label("").set({ textColor: "white", alignY: "top", alignX: "left" });
                        this.wavyPanel.labelDetailVal = new qx.ui.basic.Label("").set({ textColor: "white", alignY: "top", alignX: "left" });
                        this.wavyPanel.grid.add(this.wavyPanel.labelNb, { row: 0, column: 0 });
                        this.wavyPanel.grid.add(this.wavyPanel.labelNbVal, { row: 0, column: 1 });
                        this.wavyPanel.grid.add(this.wavyPanel.labelDetail, { row: 1, column: 0 });
                        this.wavyPanel.grid.add(this.wavyPanel.labelDetailVal, { row: 1, column: 1 });
                        // Create config panel container
                        this.configPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({backgroundColor: "rgba(0,0,0,0.5)", padding: 5, decorator: "main", opacity: 0.8});
                        this.configPanel.configTitle = new qx.ui.basic.Label("Base Move Highlighter Settings").set({font: "bold", textColor: "white", alignX: "center", paddingBottom: 5});
                        this.configPanel.add(this.configPanel.configTitle);
                        this.configPanel.npcLevelGroup = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                        this.configPanel.npcLevelGroup.add(this.configPanel.checkboxignoreLowLevelNpc = new qx.ui.form.CheckBox("Hide NPC bases < level:").set({value: false, textColor: "white", toolTipText: "Disables wave count!"}));
                        this.configPanel.npcLevelGroup.add(this.configPanel.ignoreLowLevelNpcSpinner = new qx.ui.form.Spinner(server.get_NpcLevelAtBorder() - 2, 20, server.get_MaxCenterLevel() + 1).set({ width: 50 }));
                        this.configPanel.checkboxHideAllies = new qx.ui.form.CheckBox("Hide alliance bases").set({ value: false, textColor: "white" });
                        this.configPanel.checkboxHideNonAllies = new qx.ui.form.CheckBox("Hide non alliance bases").set({ value: false, textColor: "white" });
                        this.configPanel.add(this.configPanel.checkboxHideAllies);
                        this.configPanel.add(this.configPanel.checkboxHideNonAllies);
                        this.configPanel.add(this.configPanel.npcLevelGroup);
                        this._App.getBackgroundArea().add(this.configPanel, { left: 128, top: 30 });
                        this.configPanel.ignoreLowLevelNpcSpinner.setVisibility("excluded");
                        this.configPanel.setVisibility("excluded");
                    },
                    baseMoveToolActivate() {
                        this.getRegionZoomFactorAndSetMarkerSize();
                        this.configPanel.setVisibility("visible");
                        webfrontend.phe.cnc.Util.attachNetEvent(this._VisMain.get_Region(), "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        webfrontend.phe.cnc.Util.attachNetEvent(this._VisMain.get_Region(), "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                    },
                    baseMoveToolDeactivate() {
                        this.configPanel.setVisibility("excluded");
                        webfrontend.phe.cnc.Util.detachNetEvent(this._VisMain.get_Region(), "PositionChange", ClientLib.Vis.PositionChange, this, this.repositionMarkers);
                        webfrontend.phe.cnc.Util.detachNetEvent(this._VisMain.get_Region(), "ZoomFactorChange", ClientLib.Vis.ZoomFactorChange, this, this.resizeMarkers);
                        this.removeMarkers();
                    },
                    baseMoveToolCellChange(startX, startY) {
                        this.regionCityMoveInfoAddonExists ? webfrontend.gui.region.RegionCityMoveInfo.getInstance()?.remove(this.wavyPanel.grid) : null;
                        this.removeMarkers();
                        this.findBases(startX, startY);
                    },
                    findBases(startX, startY) {
                        const region = this._VisMain.get_Region();
                        const selectedCity = this._VisMain.get_SelectedObject();
                        const { EObjectType } = ClientLib.Vis.VisObject;// Destructure for clarity
                        const results = { total: 0, levels: {}};
                        const supportWeapon = selectedCity.get_VisObjectType() === EObjectType.RegionGhostCity ? null : selectedCity.get_SupportWeapon();
                        const selectedCitySupportRange = supportWeapon ? supportWeapon.r : 0;
                        const icon = supportWeapon ? `webfrontend/${supportWeapon.i.orange}.png` : null;
                        const scanRadius = Math.max(this.scanDistance, selectedCitySupportRange);
                        const selectedPlayerId = selectedCity.get_PlayerId();
                        const selectedAllianceId = selectedCity.get_AllianceId();
                        const minX = startX - scanRadius, maxX = startX + scanRadius, minY = startY - scanRadius, maxY = startY + scanRadius;
                        for (let x = minX; x < maxX; x++) {
                            for (let y = minY; y < maxY; y++) {
                                const visObject = region.GetObjectFromPosition(x * this.gridWidth, y * this.gridHeight);
                                if (!visObject) continue;
                                const visObjType = visObject.get_VisObjectType();
                                const baseLevel = visObjType === EObjectType.RegionNPCBase ? Math.round(visObject.get_BaseLevel()) : null;
                                const isOwnBase = visObjType === EObjectType.RegionCityType ? visObject.IsOwnBase() : null;
                                const visPlayerId = visObjType === EObjectType.RegionCityType ? visObject.get_PlayerId() : null;
                                const visAllianceId = visObjType === EObjectType.RegionCityType ? visObject.get_AllianceId() : null;
                                const isSameAlliance = visAllianceId !== 0 && visAllianceId === selectedAllianceId;
                                this.configPanel.checkboxignoreLowLevelNpc.getValue() ? this.configPanel.ignoreLowLevelNpcSpinner.setVisibility("visible") : this.configPanel.ignoreLowLevelNpcSpinner.setVisibility("excluded");
                                if (isOwnBase || (this.configPanel.checkboxHideAllies.getValue() && isSameAlliance) || ( this.configPanel.checkboxHideNonAllies.getValue() && !isSameAlliance && visObjType === EObjectType.RegionCityType) || (visObjType === EObjectType.RegionNPCBase && this.configPanel.checkboxignoreLowLevelNpc.getValue() && baseLevel < this.configPanel.ignoreLowLevelNpcSpinner.getValue())) continue;
                                const visBaseX = visObject.get_RawX();
                                const visBaseY = visObject.get_RawY();
                                const distance = Math.hypot(startX - visBaseX, startY - visBaseY);
                                const cpCost = this._MainData.get_World().GetTerritoryTypeByCoordinates(visBaseX, visBaseY) === ClientLib.Data.ETerritoryType.Alliance || visObjType === EObjectType.RegionCityType ? Math.floor(3 + distance) : Math.floor(10 + distance * 3);
                                const color = distance <= this.maxAttackDistance ? visObjType === EObjectType.RegionNPCBase ? (results.total++, results.levels[baseLevel] = (results.levels[baseLevel] ?? 0) + 1, "yellowgreen") : visObjType === EObjectType.RegionCityType && !isOwnBase ? visPlayerId === selectedPlayerId ? "white" : isSameAlliance ? "royalblue" : "salmon" : null : visObjType === EObjectType.RegionCityType && distance < selectedCitySupportRange ? "transparent" : null;
                                const showType = visObjType === EObjectType.RegionCityType ? (distance <= selectedCitySupportRange && distance <= this.maxAttackDistance ? "both" : (distance <= selectedCitySupportRange && distance > this.maxAttackDistance ? "icon" : "label")) : (visObjType === EObjectType.RegionNPCBase || visObjType === EObjectType.RegionGhostCity ? "label" : null);
                                const textColor = visObjType === EObjectType.RegionCityType ? "white" : "black";
                                if (color) this.addMarker(visBaseX, visBaseY, color, cpCost, textColor, showType, icon);
                            }
                        }
                        const detailString = Object.entries(results.levels).sort(([lvlA], [lvlB]) => lvlB - lvlA).map(([level, count]) => `[${count} x ${level}]`).join("  ");
                        this.wavyPanel.labelDetailVal.setValue(detailString || "Nothing!");
                        const waveCount = Math.max(1, Math.min(5, Math.floor(results.total / 10)));
                        const waveStr = this._MainData.get_Server().get_ForgottenAttacksEnabled() && !this.configPanel.checkboxignoreLowLevelNpc.getValue() ? `${results.total} (${waveCount} wave${waveCount > 1 ? 's' : ''})` : `${results.total}`;
                        this.wavyPanel.labelNbVal.setValue(waveStr);
                        webfrontend.gui.region.RegionCityMoveInfo.getInstance()?.add(this.wavyPanel.grid);
                    },
                    addMarker(bx, by, color, cpCost, textColor, showType, icon) {
                        const marker = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                            decorator: new qx.ui.decoration.Decorator(1, "solid", "black").set({ backgroundColor: color }),
                            width: this.baseMarkerWidth,
                            height: this.baseMarkerHeight,
                            opacity: 0.7,
                        });
                        const atom = new qx.ui.basic.Atom(String(cpCost), icon).set({
                            textColor: textColor,
                            font: "bold",
                            iconPosition: "top",
                            width: this.baseMarkerWidth,
                            height : this.baseMarkerHeight,
                            rich: true,
                            center: true,
                            show: showType
                        });
                        marker.add(atom);
                        this._App.getDesktop().addAfter(marker, this._App.getBackgroundArea(), {
                            left: this._VisMain.ScreenPosFromWorldPosX(bx * this.gridWidth),
                            top: this._VisMain.ScreenPosFromWorldPosY(by * this.gridHeight)
                        });
                        this.baseMarkerList.push({ element: marker, x: bx, y: by });
                    },
                    removeMarkers() {
                        this.baseMarkerList.forEach(markerData => this._App.getDesktop().remove(markerData.element));
                        this.baseMarkerList = [];
                    },
                    getRegionZoomFactorAndSetMarkerSize() {
                        const region = this._VisMain.get_Region();
                        this.gridWidth = region.get_GridWidth();
                        this.gridHeight = region.get_GridHeight();
                        this.regionZoomFactor = region.get_ZoomFactor();
                        this.baseMarkerWidth = this.gridWidth * this.regionZoomFactor;
                        this.baseMarkerHeight = this.gridHeight * this.regionZoomFactor;
                    },
                    repositionMarkers() {
                        this.baseMarkerList.forEach(markerData => {
                            markerData?.element?.setDomLeft(this._VisMain?.ScreenPosFromWorldPosX(markerData.x * this.gridWidth));
                            markerData?.element?.setDomTop(this._VisMain?.ScreenPosFromWorldPosY(markerData.y * this.gridHeight));
                        });
                    },
                    resizeMarkers() {
                        this.getRegionZoomFactorAndSetMarkerSize();
                        this.baseMarkerList.forEach(markerData => {
                            markerData.element.setWidth(this.baseMarkerWidth);
                            markerData.element.setHeight(this.baseMarkerHeight);
                        });
                    }
                }
            });
            baseMoveHighlighter?.getInstance()?.initialize();
        }
        const checkForInit = () => {
            const scriptName = 'CnCTA Base Move Highlighter';
            try {
                if (typeof qx === 'undefined' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                CreateBMH();
                console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        };
        checkForInit();
    }
    CnCTA_Base_Move_Highlighter();
})();
