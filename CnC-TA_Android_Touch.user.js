// ==UserScript==
// @name         CnC-TA touch input for Android
// @namespace    https://github.com/ffi82/CnC-TA/
// @version      2025.01.08
// @description  CnC-TA BackgroundArea for Android
// @author       ffi82
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA8VJREFUeF7tmztvE0EQgGfsQHg1IBoCiIKChoaKhuTsRMZniEAg+RwHEZGAKBAFFNASWiigoUCIIIjAj4gCRJxzQhLb5AfQIFHQIBS6CAoiGRLfkjMcMmbv4b1dc4i9MrszN/PtzOzs5ozA+cnr8W2wEZc0RUeeqvNllfDWadrH1UjLYdNYWO3YpfW9WOQBIV9WzwPA3X8GQK4cv4WAl3gZXAdaI/1ab3GSB9BGHUIiwHyBaTQBcjulFC/7MTpfUeeBQIQXzGZbhAHILMS6wrXwomX400p8R43gR08wjNoBLTrz2gLZsWFl+8mDs0ueZFucJAyAZXyL9lCni1p9YUXQVDxRiZ8jBO/xALBaI/sHe4tveOhqSwrUi5aAR0QkcE8BUc5bPHlD4ApAtPMiIHADQHM+hGDuhSMEQGPJCGIYJwBDMUS40CzPKxK4ALD26t+MJDCuRfQh1t1gzbDRpKJfrxfUsnptraiMNuonAEdTil5gAcu9EaKtPgI8TCr6GVYAgFDSevSokzyPKPAdAe3Ke7uV9gtBAvCTQ9Tc96OQQRYB7iQV/SKDaF3EVwT87fDnsS1KAKyhw1zd/bzQRtZPIfQVAQJ8abtKCcAJea4UH0PE4focAje1iH61cX5Qi2C+pN4AhCt1swl5kIoUR+z8tI0AO+esfMuV1CeIkG57zFJeSAhkUhF9kKVrpALIV9RHQOA0zTnDgPRAVM9OVBIZQshAEAAgYjbZM5XOzqsDoRBkqDYhjGs9P84mjQ8dgMuFhhkFQQTglpK03UICoIWLF5IyAgJYA7wsnKwBsgjKXUBug7IPaCAg+wDZB1AIeNlPZSMkG6HgnQa9RK7sBGUnKDtB2Qm6doKZ6VhXuDNM/cjRulUJ4jbodCdY+1rbmT4888dXak6XoscA4FkjLQJ4NqVMjZl/CyqAXDkxgkDuN9W645qiP6c1fa7/F3g8e2TPuvXGbq1bX2hUEFQAlo35V+qhlW+hD6f6Cu+dLm5dAdgJBx2A19tqCcArqeZ5MgICeBZgWUyZAizUflVaQZ/EtmpTIL8PcDqZ2RnMItMqLE+nQb9KnToyc0wCsPlBlYwAh5riJ8+FdIJuacKymiwybna4jTNvg26KWZxhkXGzw21cAnAjxDrOsposMqz2WXIyAvwSpMlnZxN7Qx3knZ1u2Qf8F33Az5+8NkfBslHdOhwtfaZFR64UjyLiXPMYMUgsFS2+FBGtwmpAvR2eU/dBGN5ahm8Khbf1d09+cnKkUEh0ftlMqtacatXYMhSfXhbhvKnzO1OQ1V93MQIUAAAAAElFTkSuQmCC
// @grant        none
// ==/UserScript==

(() => {
    const AndroidTouch = () => {
        var n = "mousedown",
            l = "CurrentChange",
            a = "MouseToolChange",
            t = "Left",
            v = "excluded",
            y = "tick",
            p = "black",
            i = "Down",
            r = "Up",
            u = "cursor",
            f = "mousewheel",
            w = "SelectionChange",
            e = "audio/ui/OpenWindow",
            b = "visible",
            o = "mousemove",
            k = "move",
            d = "resize",
            g = " ",
            s = "mouseup",
            nt = "uiTick",
            h = "left",
            c = "Right";
        qx.Class.define("webfrontend.gui.BackgroundArea", {
            extend: qx.ui.container.Composite,
            construct: function () {
                var i, t;
                this.mouseDown = !1;
                this.worldMouseMove = !1;
                this.worldMoved = !1;
                this.mouseStartX = 0;
                this.mouseStartY = 0;
                this.mode = g;
                this.touchStartX = null;
                this.touchStartY = null;
                this.touchIdentifier = null;
                qx.ui.container.Composite.call(this);
                i = new qx.ui.layout.Canvas;
                this._setLayout(i);
                this.setToolTip(new webfrontend.gui.WorldToolTip);
                this.mapContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas);
                this.mapContainer.addListener(d, this._onMapAreaResize, this);
                this._add(this.mapContainer, {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                });
                this.__bfB = (new qx.ui.container.Composite).set({
                    layout: new qx.ui.layout.Canvas,
                    anonymous: !0
                });
                this.mapContainer.add(this.__bfB, {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                });
                this.mapBlocker = new qx.ui.container.Composite;
                this.mapBlocker.setBackgroundColor(p);
                this.mapBlocker.setOpacity(.7);
                this._add(this.mapBlocker, {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                });
                qx.bom.Element.addListener(this.mapContainer, n, this._onMouseDown, this);
                qx.bom.Element.addListener(this.mapContainer, s, this._onMouseUp, this);
                qx.bom.Element.addListener(this.mapContainer, o, this._onMouseMove, this);
                qx.bom.Element.addListener(this.mapContainer, f, this._onMouseWheel, this);

                qx.bom.Element.addListener(this.mapContainer, "touchstart", this._onTouchStart, this);
                qx.bom.Element.addListener(this.mapContainer, "touchmove", this._onTouchMove, this);
                qx.bom.Element.addListener(this.mapContainer, "touchend", this._onTouchEnd, this);
                qx.bom.Element.addListener(this.mapContainer, "touchcancel", this._onTouchCancel, this);

                qx.bom.Element.addListener(this.mapBlocker, n, this._onMouseDown, this);
                qx.bom.Element.addListener(this.mapBlocker, s, this._onMouseUp, this);
                qx.bom.Element.addListener(this.mapBlocker, o, this._onMouseMove, this);
                qx.bom.Element.addListener(this.mapBlocker, f, this._onMouseWheel, this);

                qx.bom.Element.addListener(this.mapBlocker, "touchstart", this._onTouchStart, this);
                qx.bom.Element.addListener(this.mapBlocker, "touchmove", this._onTouchMove, this);
                qx.bom.Element.addListener(this.mapBlocker, "touchend", this._onTouchEnd, this);
                qx.bom.Element.addListener(this.mapBlocker, "touchcancel", this._onTouchCancel, this);

                webfrontend.gui.region.RegionCityFoundInfo.getInstance();
                webfrontend.gui.region.RegionCitySupportInfo.getInstance();
                this.__bfC = webfrontend.gui.region.RegionCityInfo.getInstance();
                this.__bfC.exclude();
                this.add(this.__bfC);
                this.__bfD = webfrontend.gui.region.RegionCityList.getInstance();
                this.__bfD.exclude();
                this.add(this.__bfD);
                t = webfrontend.phe.cnc.base.Timer.getInstance();
                t.addListener(y, this._onTick, this);
                t.addListener(nt, this._onUiTick, this);
                webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), l, ClientLib.Data.CurrentCityChange, this, this._onCurrentCityChange);
                webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), w, ClientLib.Vis.SelectionChange, this, this._onSelectionChange);
                webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), a, ClientLib.Vis.MouseToolChange, this, this._onMouseToolChange);
                this.active = !1;
            },
            members: {
                mapContainer: null,
                mapBlocker: null,
                mouseDown: null,
                worldMouseMove: null,
                worldMoved: null,
                mouseStartX: null,
                mouseStartY: null,
                mousePosX: null,
                mousePosY: null,
                activeSceneView: null,
                mode: null,
                active: null,
                __bfD: null,
                __bfC: null,
                __bfE: null,
                __bfF: null,
                __RG: null,
                __ud: null,
                __bfG: null,
                __bfH: null,
                __bfB: null,
                touchStartX: null,
                touchStartY: null,
                touchIdentifier: null,
                setActive: function (n) {
                    this.active = n;
                    this.mapBlocker.setVisibility(this.active ? v : b);
                    var t = ClientLib.Vis.VisMain.GetInstance();
                    this.active && this.mode == ClientLib.Vis.Mode.Region ? t.set_Mode(this.mode) : (this.closeCityInfo(), this.closeCityList())
                },
                setView: function (n, t, i, r) {
                    var h = ClientLib.Vis.VisMain.GetInstance(),
                        c = ClientLib.Data.MainData.GetInstance(),
                        f = null,
                        e;
                    if (n == ClientLib.Vis.Mode.Region) {
                        f = ClientLib.Vis.VisMain.GetInstance().get_Region();
                        var s = c.get_Cities().GetCity(t),
                            u = ClientLib.Vis.VisMain.GetInstance().get_Region(),
                            o = u.get_ZoomFactor();
                        s != null ? (i = (s.get_PosX() + .5) * u.get_GridWidth() - Math.floor(u.get_ViewWidth() / o / 2), r = (s.get_PosY() + .5) * u.get_GridHeight() - Math.floor(u.get_ViewHeight() / o / 2)) : (i = (i + .5) * u.get_GridWidth() - Math.floor(u.get_ViewWidth() / o / 2), r = (r + .5) * u.get_GridHeight() - Math.floor(u.get_ViewHeight() / o / 2));
                        this.active && h.set_Mode(n)
                    }
                    this.mode = n;
                    i = Math.round(i);
                    r = Math.round(r);
                    f && (f.SetPosition(i, r), this.__bfC != null && this.__bfC.updatePosition());
                    this.activeSceneView != f && (e = this.mapContainer.getContentElement().getDomElement(), this.activeSceneView && e && (this.activeSceneView.SetActive(!1), e.removeChild(this.activeSceneView.GetHtmlNode())), this.activeSceneView = f, this.activeSceneView && e && (e.appendChild(this.activeSceneView.GetHtmlNode()), this.activeSceneView.SetActive(!0)))
                },
                _onMapAreaResize: function (n) {
                    var t = n.getData().width,
                        i = n.getData().height,
                        r = ClientLib.Vis.VisMain.GetInstance();
                    r.get_Region().SetViewSize(t, i)
                },
                onHotKeyDown: function (n) {
                    var e = ClientLib.Vis.VisMain.GetInstance(),
                        f, u;
                    if (!e.get_LockMove() && this.active) {
                        f = n.getKeyIdentifier();
                        u = !1;
                        switch (f) {
                        case r:
                            this.__bfG = 1;
                            u = !0;
                            break;
                        case i:
                            this.__bfG = -1;
                            u = !0;
                            break;
                        case t:
                            this.__bfH = 1;
                            u = !0;
                            break;
                        case c:
                            this.__bfH = -1;
                            u = !0
                        }
                        u && (this.closeCityInfo(), this.closeCityList())
                    }
                },
                onHotKeyUp: function (n) {
                    var f = ClientLib.Vis.VisMain.GetInstance(),
                        u;
                    if (!f.get_LockMove() && this.active) {
                        u = n.getKeyIdentifier();
                        switch (u) {
                        case r:
                            this.__bfG == 1 && (this.__bfG = 0);
                            break;
                        case i:
                            this.__bfG == -1 && (this.__bfG = 0);
                            break;
                        case t:
                            this.__bfH == 1 && (this.__bfH = 0);
                            break;
                        case c:
                            this.__bfH == -1 && (this.__bfH = 0)
                        }
                    }
                },
                onHotKeyPress: function (n) {
                    var t = ClientLib.Vis.VisMain.GetInstance(),
                        u, i, r;
                    if (!t.get_LockMove() && this.active) {
                        u = n.getKeyIdentifier();
                        i = !1;
                        switch (u) {
                        case webfrontend.gui.ShortkeyMapper.keys.zoomIn:
                            r = t.get_Region().get_ZoomFactor() + .1;
                            t.get_Region().set_ZoomFactor(Math.min(1, Math.max(.6, r)));
                            i = !0;
                            break;
                        case webfrontend.gui.ShortkeyMapper.keys.zoomOut:
                            r = t.get_Region().get_ZoomFactor() - .1;
                            t.get_Region().set_ZoomFactor(Math.min(1, Math.max(.6, r)));
                            i = !0
                        }
                        i && (this.closeCityInfo(), this.closeCityList())
                    }
                },
                _onMouseDown: function (n) {
                    var t, i;
                    n.getButton() == h && (this.mouseDown = !0, this.worldMoved = !1, this.worldMouseMove == !1 && (this.worldMouseMove = !0, this.mapContainer.capture()), this.mouseStartX = n.getScreenLeft(), this.mouseStartY = n.getScreenTop(), t = this.getContentLocation(), this.active && (i = ClientLib.Vis.VisMain.GetInstance(), i.MouseDown(n.getDocumentLeft() - t.left, n.getDocumentTop() - t.top)), this.closeCityInfo(), this.closeCityList())
                },
                _onMouseUp: function (n) {
                    var i = n.getButton(),
                        t, r;
                    i == h && (this.worldMouseMove == !0 && (this.worldMouseMove = !1, this.mapContainer.releaseCapture(), this.getContentElement().removeStyle(u)), this.mouseDown == !0 && this.worldMoved == !1 && (t = this.getContentLocation(), this.active && (r = ClientLib.Vis.VisMain.GetInstance(), r.MouseUp(n.getDocumentLeft() - t.left, n.getDocumentTop() - t.top, i))), this.mouseDown = !1)
                },
                _onMouseMove: function (n) {
                    var h = ClientLib.Vis.VisMain.GetInstance(),
                        t, e, o, s;
                    if (!h.get_LockMove()) {
                        if (t = this.getContentLocation(), this.mousePosX = n.getDocumentLeft() - t.left, this.mousePosY = n.getDocumentTop() - t.top, this.__bfE != null) {
                            var c = qx.core.Init.getApplication(),
                                l = c.getMessagingTicker().getBounds().top,
                                a = c.getBaseNavigationBar().getBounds().left,
                                i = this.__bfE.getBounds(),
                                r = this.mousePosX + 20,
                                f = this.mousePosY + 20;
                            r + i.width > a && (r = this.mousePosX - 20 - i.width);
                            f + i.height > l && (f = this.mousePosY - 20 - i.height);
                            this.__bfE.setDomLeft(r);
                            this.__bfE.setDomTop(f)
                        }
                        this.worldMouseMove == !0 ? (e = n.getScreenLeft() - this.mouseStartX, o = n.getScreenTop() - this.mouseStartY, (this.worldMoved || Math.abs(e) >= 5 || Math.abs(o) >= 5) && (this.mouseStartX = n.getScreenLeft(), this.mouseStartY = n.getScreenTop(), this.activeSceneView != null && (s = this.activeSceneView.get_ZoomFactor(), this.activeSceneView.MovePosition(-(e / s), -(o / s)) && (this.getContentElement().setStyle(u, k), this.worldMoved = !0)))) : this.active && h.MouseMove(n.getDocumentLeft() - t.left, n.getDocumentTop() - t.top)
                    }
                },
                _onTouchStart: function (e) {
                    e.preventDefault();
                    if (e.touches.length === 1) {
                        const touch = e.touches[0];
                        this.touchIdentifier = touch.identifier;
                        this.touchStartX = touch.screenX;
                        this.touchStartY = touch.screenY;
                        this.mouseDown = true;
                        this.worldMoved = false;

                        let t = this.getContentLocation();
                        this.active && ClientLib.Vis.VisMain.GetInstance().MouseDown(touch.pageX - t.left, touch.pageY - t.top);
                        this.closeCityInfo();
                        this.closeCityList();
                    }
                },
                _onTouchMove: function (e) {
                    e.preventDefault();
                    if (this.mouseDown && this.touchIdentifier != null) {
                        const touch = Array.from(e.touches).find(t => t.identifier === this.touchIdentifier);
                        if (touch) {
                            let moveX = touch.screenX - this.touchStartX;
                            let moveY = touch.screenY - this.touchStartY;

                            if (this.worldMoved || Math.abs(moveX) >= 5 || Math.abs(moveY) >= 5) {
                                this.touchStartX = touch.screenX;
                                this.touchStartY = touch.screenY;
                                if (this.activeSceneView) {
                                    let zoom = this.activeSceneView.get_ZoomFactor();
                                    this.activeSceneView.MovePosition(-(moveX / zoom), -(moveY / zoom));
                                    this.worldMoved = true;
                                }
                            }
                        }
                    }
                },

                _onTouchEnd: function (e) {
                    e.preventDefault();
                    if (this.mouseDown && this.touchIdentifier != null) {
                        const touch = Array.from(e.changedTouches).find(t => t.identifier === this.touchIdentifier);
                        if (touch) {
                            let t = this.getContentLocation();
                            this.active && ClientLib.Vis.VisMain.GetInstance().MouseUp(touch.pageX - t.left, touch.pageY - t.top, "left");
                            this.mouseDown = false;
                            this.touchIdentifier = null;
                            if (!this.worldMoved) { //click event
                                this._onSelectionChange();
                            }
                        }
                    }
                },

                _onTouchCancel: function (e) {
                    e.preventDefault();
                    this.mouseDown = false;
                    this.touchIdentifier = null;
                },

                onMouseWheel: function (n) {
                    this._onMouseWheel(n)
                },
                _onMouseWheel: function (n) {
                    var r = ClientLib.Vis.VisMain.GetInstance(),
                        i, t;
                    r.get_LockMove() || this.activeSceneView != null && (i = n.getWheelDelta(), t = this.activeSceneView.get_ZoomFactor(), t += -i * (t < .5 ? .025 : .1), t = Math.min(this.activeSceneView.get_MaxZoomFactor(), Math.max(this.activeSceneView.get_MinZoomFactor(), t)), this.activeSceneView.set_ZoomFactor(t), n.stop())
                },
                _onTick: function () {
                    var t, i, r, n;
                    this.activeSceneView && (t = ClientLib.Vis.VisMain.GetInstance(), t.UpdateMouseTool(), this.active && (this.activeSceneView.VisUpdate(ClientLib.Data.MainData.GetInstance().get_Time().GetServerStep()), (this.worldMoved || Math.abs(this.__bfG) != 0 || Math.abs(this.__bfH) != 0) && (i = this.__bfH * 15, r = this.__bfG * 15, this.activeSceneView != null && (n = this.activeSceneView.get_ZoomFactor(), this.activeSceneView.MovePosition(-(i / n), -(r / n)) && (this.worldMoved = !0)))), this.activeSceneView.ViewUpdate())
                },
                _onUiTick: function () {
                    this.active && this.activeSceneView && this.activeSceneView.UiUpdate(ClientLib.Data.MainData.GetInstance().get_Time().GetServerStep())
                },
                _onCurrentCityChange: function () {},
                _onSelectionChange: function (n, t) {
                    var u;
                    if (this.active && (this.__RG = t, this.closeCityInfo(), this.closeCityList(), this.__RG != null)) {
                        var f = ClientLib.Vis.VisMain.GetInstance().WorldPosFromScreenPosX(this.mousePosX),
                            e = ClientLib.Vis.VisMain.GetInstance().WorldPosFromScreenPosY(this.mousePosY),
                            i = ClientLib.Vis.VisMain.GetInstance().GetAllSelectableObjectsFromPosition(f, e),
                            r = !1;
                        if (this.__RG.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionHubControl && (u = ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter(), u.get_State() == ClientLib.Data.EndGame.EHubState.Ruin && (r = !0)), i.l.length != 1 || r)(i.l.length > 1 || r) && this.openCityList(i);
                        else switch (this.__RG.get_VisObjectType()) {
                        case ClientLib.Vis.VisObject.EObjectType.RegionGhostCity:
                        case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                        case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                        case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                        case ClientLib.Vis.VisObject.EObjectType.RegionRuin:
                        case ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest:
                        case ClientLib.Vis.VisObject.EObjectType.RegionNewPlayerSpot:
                        case ClientLib.Vis.VisObject.EObjectType.RegionHubServer:
                        case ClientLib.Vis.VisObject.EObjectType.RegionHubControl:
                        case ClientLib.Vis.VisObject.EObjectType.RegionHubCenter:
                        case ClientLib.Vis.VisObject.EObjectType.RegionAllianceMarker:
                            this.openCityInfo(this.__RG);
                            this.__RG.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionHubCenter && webfrontend.data.InfoTracker.getInstance().checkTrigger_WorldWin()
                        }
                    }
                },
                openCityInfo: function (n, t) {
                    if (t = t || 0, this.closeCityInfo(), this.__bfC != null) {
                        switch (n.get_VisObjectType()) {
                        case ClientLib.Vis.VisObject.EObjectType.RegionGhostCity:
                        case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                        case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                        case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                        case ClientLib.Vis.VisObject.EObjectType.RegionHubCenter:
                            ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(n.get_Id())
                        }
                        qx.core.Init.getApplication().getAllianceMarkerNavs().setDistanceToHome(n.get_RawX(), n.get_RawY());
                        this.__bfC.setObject(n, t);
                        this.__bfC.show();
                        ClientLib.Vis.VisMain.GetInstance().PlayUISound(e)
                    }
                },
                closeCityInfo: function () {
                    if (this.__bfC.isVisible()) {
                        this.__bfC.Dispose();
                        this.__bfC.exclude();
                        qx.core.Init.getApplication().getAllianceMarkerNavs().resetDistanceToHome();
                        var n = ClientLib.Data.MainData.GetInstance().get_Cities();
                        n.set_CurrentCityId(0)
                    }
                },
                openCityList: function (n) {
                    this.closeCityList();
                    this.__bfD != null && this.__bfD.setObjects(n) && (this.__bfD.show(), ClientLib.Vis.VisMain.GetInstance().PlayUISound(e))
                },
                closeCityList: function () {
                    this.__bfD.isVisible() && (this.__bfD.Dispose(), this.__bfD.exclude())
                },
                _onMouseToolChange: function () {
                    var n = ClientLib.Vis.VisMain.GetInstance().get_ActiveMouseTool().GetMouseToolType();
                    switch (n) {
                    case ClientLib.Vis.MouseTool.EMouseTool.FoundBase:
                        this.switchMouseToolTip(webfrontend.gui.region.RegionCityFoundInfo.getInstance());
                        break;
                    case ClientLib.Vis.MouseTool.EMouseTool.MoveBase:
                        this.switchMouseToolTip(webfrontend.gui.region.RegionCityMoveInfo.getInstance());
                        break;
                    case ClientLib.Vis.MouseTool.EMouseTool.SelectSupport:
                        this.switchMouseToolTip(webfrontend.gui.region.RegionCitySupportInfo.getInstance());
                        break;
                    case ClientLib.Vis.MouseTool.EMouseTool.MoveMarker:
                        this.switchMouseToolTip(webfrontend.gui.region.RegionInfoAllianceMarkerTooltip.getInstance());
                        break;
                    default:
                        this.switchMouseToolTip(null)
                    }
                },
                switchMouseToolTip: function (n) {
                    this.__bfE && this.remove(this.__bfE);
                    this.__bfE = n;
                    this.__bfE && this.add(this.__bfE, {
                        top: this.mousePosY,
                        left: this.mousePosX
                    })
                },
                getAnonymousOverlayContainer: function () {
                    return this.__bfB
                }
            }
        });
    }
    AndroidTouch();
})();
