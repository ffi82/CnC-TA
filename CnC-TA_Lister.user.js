// ==UserScript==
// @name        CnC-TA Lister
// @namespace   https://github.com/ffi82/CnC-TA/
// @version     2024-10-02
// @description Under 'Scripts' menu, click to download CSV files containing Alliances, Players and Cities, Player Hall Of Fame / Challenge ranking, Alliance Roster or POIs data. How to: Click --> See progress bar above game options --> check your downloads folder for new .csv file/s. (Check your browser console [ Control+Shift+J ] in Chrome / Edge / Firefox for some logs.)
// @author      ffi82
// @contributor leo7044, bloofi, c4l10s <== i took and adjusted pieces of code... indirect contribution (what license :P)
// @downloadURL https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister.user.js
// @updateURL   https://github.com/ffi82/CnC-TA/raw/master/CnC-TA_Lister.user.js
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAk5JREFUeF7tWctxwjAQlStIC1RAAxlmyDFpJWfOIWfOaSU5hhkqSAfpxEExGDBa7a5XljX244ok73v7tD9Vbua/aub4HQiAAmbOAK7AzAWAIDjaFdgdXt6u1bdZfb6PocZRCNgdnr+dq9a3gOv9ZvX1lJuE7AScPL8lgG5zKwEE5JYcFNAEP1wBxIAwAwiCyAKZCyKkQaTBzAygDkAdgEIIlSBKYfQCaIbQDaIbnFI3qJnwWipBzXekBa65GQoDoie8fQkIT5KdeX6QgIDQiNvzHyahDwEEePIbUu/7dSYCGDBBA7UE0OBbmCYVmAjwJvAG3ipBQwB/9j8J4xKgJUFKgAy8/TXJrICzEHmDG2MlBPBn0TFGc/9FMaCbevwmanDJG17vj2+C+1gzdAye6/t3wy4sNsu0G7gha1QBEW+R944joarcb127RchTsf8u61nw3TI7GiOSEyCLCVqhntfH7zzhsPwEDEMCH/CKIiAtCTz45nvBcds4CpBnB+46yMAXS4BNCXLwRROgJ6FJl1wK62qnyCtwbSSXIpu1Oq/fnl9gDLj3EtU92sAXfwV4JfT3PBNwh8gCqY1NcR754tSfAM/s68fjz2L5sLxPVsmMJnsLLkFePO/Bkz2EjYB499Y2N1JbB1gXa554J4naYVn0HgCb/Uh2WCIkIPqiazdzkBN47/vPigjQFzKDIFIcKgOvIuCSZyUDC4WtSZfqK0ixAgIVV1LTUxymLZ3VCkhhZGln9FJAaSAs9oAAC3tT2AsFTMGLFgxQgIW9Kez9A8eY4FA22gNKAAAAAElFTkSuQmCC
// @require     https://github.com/ffi82/CnC-TA/raw/master/Tiberium_Alliances_Zoom.user.js
// @grant       none
// ==/UserScript==
(function() {
    'use strict';
    const script = () => {
        const scriptName = 'CnC-TA Lister';
        var timestamp,
            Alliances,
            AlliancesArr,
            AlliancesArr2,
            Players,
            PlayersArr,
            PlayersArr2,
            CitiesArr,
            CitiesCount,
            pbContainer;

        function init() {
            console.log(`${scriptName} loaded`);
            const ScriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton(),
                children = ScriptsButton.getMenu().getChildren(),
                icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG1JREFUOE9jZKAQMFKonwG/AQ0M/8EWNOBWN2oAAy0CETnkcbGR4h4RCy0M8gw1DA+h0QaJPnQAi04ktQgDQLYhxzfMdpgh6HJQPm4DIAkIe0JCsgzVAAKpDu4jrAYg20gogyB5h8aZiZBLgPIA/0oqEY62gBUAAAAASUVORK5CYII=';
            pbContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                padding: 0,
                width: 115,
                decorator: new qx.ui.decoration.Decorator().set({
                    width: 1,
                    style: "solid",
                    color: "black",
                    backgroundColor: "transparrent",
                }),
            });
            qx.core.Init.getApplication().getOptionsBar().getLayoutParent().getChildren()[0].getChildren()[2].addAt(pbContainer, 1);
            ScriptsButton.Add('Alliances', icon);
            ScriptsButton.Add('Players and Cities', icon);
            ScriptsButton.Add('Player Hall of Fame', icon);
            ScriptsButton.Add('Alliance Roster', icon);
            ScriptsButton.Add('Points of Interest', icon);
            children[children.length - 5].addListener('execute', getAlliances, this);
            children[children.length - 4].addListener('execute', getPlayersAndCities, this);
            children[children.length - 3].addListener('execute', getPlayerHallOfFame, this);
            children[children.length - 2].addListener('execute', getAllianceRoster, this);
            children[children.length - 1].addListener('execute', getPOIs, this);
        }
        //list to .csv
        function getCSV(data, name) {
            var elLink = document.createElement("a"),
                oBlob = new Blob([data], {
                    type: 'text/csv;charset=utf-8;'
                });
            elLink.download = new Date().toISOString().slice(0, -14) + "_" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() + "_" + name;
            var oLastUrl = window.URL.createObjectURL(oBlob);
            elLink.href = oLastUrl;
            document.body.appendChild(elLink);
            elLink.click();
            document.body.removeChild(elLink);
            elLink = null;
        }
        //progress bar for the lists
        function progressBar(pbIndex, pbLength, pbName) {
            const pb = new qx.ui.basic.Label();
            pb.set({
                value: pbIndex + " / " + pbLength + " " + pbName,
                width: 0,
                height: 11,
                textColor: "black",
                font: qx.bom.Font.fromString("9px tahoma"),
                backgroundColor: "white",
                decorator: "main",
            });
            pbContainer.removeAll();
            pbContainer.add(pb);
            pb.setWidth(pbIndex / pbLength * 113);
            if (pbIndex === pbLength) pbContainer.removeAll();
        }
        //get Alliances list
        function getAlliances() {
            timestamp = performance.now();
            Alliances = "Ranking,Alliance Id,Alliance Name,Alliance Has Won,Member Count,Base Count,Top 40 scores,Average Score,Total Score,Event Rank,Event Score,Average Faction,Abbreviation,CiC Player Id,Bases destroyed,PvE,PvP,POI Count,Is Inactive,EndGame Won Rank,EndGame Won Step,Description\r\n";
            AlliancesArr = [];
            AlliancesArr2 = [];
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetCount", {
                view: 1
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, countof) => {
                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
                    ascending: true,
                    firstIndex: 0,
                    lastIndex: countof,
                    rankingType: 0,
                    sortColumn: 2,
                    view: 1,
                }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, onAllianceRankingGetData), null);
            }), null);
        }

        function onAllianceRankingGetData(context, data) {
            for (const getAlliance of data.a) {
                AlliancesArr.push({
                    "Ranking": getAlliance.r,
                    "Alliance Id": getAlliance.a,
                    "Alliance Name": getAlliance.an,
                    "Alliance Has Won": getAlliance.aw,
                    "Member Count": getAlliance.pc,
                    "Base Count": getAlliance.bc,
                    "Top 40 scores": getAlliance.s,
                    "Average Score": getAlliance.sa,
                    "Total Score": getAlliance.sc,
                    "Event Rank": getAlliance.er,
                    "Event Score": getAlliance.es,
                    "Average Faction": getAlliance.fac
                });
                getPublicAllianceInfoById(getAlliance.a);
            }
        }

        function getPublicAllianceInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicAllianceInfo", {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                AlliancesArr2.push({
                    "Abbreviation": data.a,
                    "CiC Player Id": data.cic,
                    "Bases destroyed": data.bd,
                    "PvE": data.bde,
                    "PvP": data.bdp,
                    "POI Count:": data.poi,
                    "Is Inactive": data.ii,
                    "EndGame Won Rank": data.egwr,
                    "EndGame Won Step": data.egws,
                    "Description": '"' + data.d + '"'
                });
                progressBar(AlliancesArr2.length, AlliancesArr.length, "Alliances");
                if (AlliancesArr.length === AlliancesArr2.length) {
                    for (let i = 0; i < AlliancesArr.length; i++) {
                        Alliances += String([Object.values(AlliancesArr.at(i)), Object.values(AlliancesArr2.at(i))]) + "\r\n";
                    }
                    console.log(Alliances);
                    getCSV(Alliances, "Alliances");
                    console.log(`%cAlliances (${AlliancesArr.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }
            }), null)
        }
        //get Players and Cities lists
        function getPlayersAndCities() {
            timestamp = performance.now();
            Players = "Ranking,Player Id,Player Name,Faction,Score,Alliance Id,Alliance Name,Bases,Bases destroyed,PvE,PvP,Has Code,Fortresses annihilated,Challange achievements,Other achievements,Distance to Center,Is Inactive,lr,mv,np,nr,sli.length,Veteran Points,BWorld,BRank,BAlliance,BTimestamp,BMember Role,BFaction,Bis,Biv\r\n";
            Cities = "Ranking,Alliance Name,Alliance Id,Player Name,Player Id,Base Name,Base Id,Player Faction,Base is Ghost,Player has Won,Base Score,Coord X,Coord Y\r\n";
            PlayersArr = [];
            PlayersArr2 = [];
            CitiesArr = [];
            CitiesCount = 0;
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetCount", {
                view: 0 // console.log(Object.entries(ClientLib.Data.Ranking.EViewType).sort(values));
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, countof) => {
                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
                    ascending: 1, // console.log(Object.entries(ClientLib.Data.Ranking.ESortDirection).sort(values));
                    firstIndex: 0,
                    lastIndex: countof, // from "RankingGetCount"... one can also limit it: 10, 100, 25000 etc...
                    rankingType: 0, // console.log(Object.entries(ClientLib.Data.Ranking.ERankingType).sort(values));
                    sortColumn: 2, // console.log(Object.entries(ClientLib.Data.Ranking.ESortColumn).sort(values));
                    view: 0 // console.log(Object.entries(ClientLib.Data.Ranking.EViewType).sort(values));
                }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, onPlayerRankingGetData), null);
            }), null);
        }

        function onPlayerRankingGetData(context, data) {
            for (const getPlayer of data.p) {
                PlayersArr.push(getPlayer);
                CitiesCount += getPlayer.bc;
                getPublicPlayerInfoById(getPlayer.p);
            }
        }

        function getPublicPlayerInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicPlayerInfo', {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                var hasBadge = ""; // player endgame data for current world
                for (const badge of data.ew) {
                    if (badge.n === ClientLib.Data.MainData.GetInstance().get_Server().get_Name()) {
                        hasBadge = String([badge.n, badge.r, badge.an, badge.ws, badge.mr, badge.f, badge.is, badge.iv]);
                        break;
                    }
                }
                PlayersArr2.push(String([data.r, data.i, data.n, data.f, data.p, data.a, data.an, data.c.length, data.bd, data.bde, data.d, data.hchc, data.ew.length, data.cw.length, data.mw.length, data.dccc, data.ii, data.lr, data.mv, data.np, data.nr, data.sli.length, data.vp, hasBadge]));
                progressBar(PlayersArr2.length, PlayersArr.length, "Players");
                if (PlayersArr.length === PlayersArr2.length) {
                    for (let p = 0; p < PlayersArr2.length; p++) {
                        Players += String(PlayersArr2.at(p)) + "\r\n";
                    }
                    console.log(JSON.stringify(PlayersArr2, undefined, 4));
                    getCSV(Players, "Players");
                    console.log(`%cPlayers (${PlayersArr2.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                    timestamp = performance.now();
                }
                //cities <- get city ids from players list
                for (const getCityId of data.c) {
                    getPublicCityInfoById(getCityId.i);
                }
            }), null);
        }

        function getPublicCityInfoById(n) {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicCityInfoById', {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                CitiesArr.push({
                    "Ranking": 0,
                    "Alliance_Name": data.an,
                    "Alliance_Id": data.a,
                    "Player_Name": data.pn,
                    "Player_Id": data.p,
                    "Base_Name": data.n,
                    "Base_Id": data.i,
                    "Player_Faction": data.f,
                    "Base_is_Ghost": data.g,
                    "Player_has_Won": data.w,
                    "Base_Score": data.po,
                    "Coord_X": data.x,
                    "Coord_Y": data.y
                });
                progressBar(CitiesArr.length, CitiesCount, "Cities");
                if (CitiesArr.length === CitiesCount) { //when CitiesArr ready, start to build the list
                    CitiesArr.sort((a, b) => Number(b.Base_Score) - Number(a.Base_Score)); //Sort cities by score
                    for (let c = 0; c < CitiesArr.length; c++) {
                        CitiesArr.at(c).Ranking = c + 1; //fill City Ranking by score
                        Cities += Object.values(CitiesArr.at(c)) + "\r\n"; //Add to Cities list
                    }
                    console.table(CitiesArr);
                    getCSV(Cities, "Cities");
                    console.log(`%cCities (${CitiesArr.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }
            }), null)
        }
        //get Player Hall Of Fame list
        function getPlayerHallOfFame() {
            timestamp = performance.now();
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("RankingGetCount", {
                view: 2
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, countof) => {
                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
                    ascending: true,
                    firstIndex: 0,
                    lastIndex: countof,
                    rankingType: 0,
                    sortColumn: 0,
                    view: 2
                }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                    let PlayerHallOfFame = "Ranking,Player Id,Player Name,Season Won,Total Veteran Points\r\n",
                        phofArr = [];
                    for (const getPHOF of data.phof) {
                        phofArr.push({
                            "Ranking": getPHOF.r,
                            "Player Id": getPHOF.p,
                            "Player Name": getPHOF.pn,
                            "Season Won": getPHOF.sw,
                            "Total Veteran Points": getPHOF.tvp
                        });
                        progressBar(phofArr.length, data.phof.length, "Player Hall of Fame");
                        PlayerHallOfFame += Object.values(getPHOF) + "\r\n";
                        //progressBar([...PlayerHallOfFame].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0) - 1,data.phof.length," Player Hall of Fame"); //slow... makes phofArr redundant though
                    }
                    console.table(phofArr); //phofArr <=> data.phof
                    getCSV(PlayerHallOfFame, "PlayerHallOfFame");
                    console.log(`%cPlayer Hall Of Fame (${Object.values(data.phof).length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                }), null);
            }), null);
        }
        //get Alliance Roster
        function getAllianceRoster() {
            timestamp = performance.now();
            const roster = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray();
            var AllianceRoster = "Id,Name,Role,Rank,Points,Bases,OnlineState,LastSeen,ActiveState,Level,Faction,JoinStep,HasControlHubCode,VeteranPointContribution,AvgDefenseLvl,AvgOffenseLvl,BestOffenseLvl,BestDefenseLvl,RoleName\r\n";
            for (const member of roster) {
                AllianceRoster += Object.values(member) + "\r\n";
                progressBar([...AllianceRoster].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0) - 1, roster.length, "Alliance Roster");
            }
            console.table(roster);
            getCSV(AllianceRoster, "AllianceRoster");
            console.log(`%cAlliance Roster (${roster.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
        }
        //get Points Of Interest List
        function getPOIs() {
            timestamp = performance.now();
            if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_MinZoomFactor() != 0.01) {
                if (confirm("Get 'Tiberium Alliances Zoom' userscript to enable true max zoom out in Region View. May reduce performance.\r\nAlso make sure the 'Allow max zoom out' in game Options -> Audio/Video tab is unchecked.")) {
                    open("https://github.com/ffi82/CnC-TA/raw/master/Tiberium%20Alliances%20Zoom.user.js")
                }
            } else {
                if (ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor() != 0.01) {
                    if (confirm("Set zoom factor @ 0.01 to be able to see the entire world... zoom out max.\r\nYour current zoom factor: " + ClientLib.Vis.VisMain.GetInstance().get_Region().get_ZoomFactor())) {
                        ClientLib.Vis.VisMain.GetInstance().get_Region().set_ZoomFactor(0.01)
                    };
                } else {
                    if (qx.core.Init.getApplication().getPlayArea().getViewMode() != 0) {
                        if (confirm("Switch to Region View.")) {
                            qx.core.Init.getApplication().showMainOverlay(!1)
                        }
                    } else {
                        var range = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth(),
                            x = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentWidth(),
                            y = ClientLib.Data.MainData.GetInstance().get_Server().get_ContinentHeight(),
                            region = ClientLib.Vis.VisMain.GetInstance().get_Region(),
                            POIScore = [],
                            AllPOIs = [],
                            POIs = "Level,Name,coord_x,coord_y,Alliance,Score,Type\r\n";
                        for (var a = 0; a <= ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel(); a++) POIScore[a] = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(a);
                        for (var i = x - (range); i < (x + range); i++) {
                            for (var j = y - range; j < (y + range); j++) {
                                var visObject = region.GetObjectFromPosition(i * region.get_GridWidth(), j * region.get_GridHeight());
                                if (visObject != null) {
                                    if (visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest) {
                                        var visObjectName = visObject.get_Name();
                                        if (visObjectName == 'Tunnel exit') {} else {
                                            AllPOIs.push({
                                                "Level": visObject.get_Level(),
                                                "Name": visObjectName.split(' ')[0],
                                                "coord_x": i,
                                                "coord_y": j,
                                                "Alliance": visObject.get_OwnerAllianceName(),
                                                "Score": POIScore[visObject.get_Level()],
                                                "Type": visObject.get_Type()
                                            });
                                            progressBar(AllPOIs.length, AllPOIs.length, "Points of Interest");
                                        }
                                    }
                                }
                            }
                        }
                        AllPOIs.sort((a, b) => b.Level - a.Level);
                        AllPOIs.sort((a, b) => a.Type - b.Type);
                        for (const poi of AllPOIs) POIs += Object.values(poi) + "\r\n";
                        console.table(AllPOIs);
                        getCSV(POIs, "POIs");
                        console.log(`%cPoints of Interest (${AllPOIs.length}) list done in ${((performance.now() - timestamp) / 1000).toFixed(2)} seconds.`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
                        if (confirm("Done. World POI list was downloaded.\r\nReset zoom factor?")) {
                            ClientLib.Vis.VisMain.GetInstance().get_Region().set_ZoomFactor(1)
                        }
                    }
                }
            }
        }
        //wait for game
        function checkForInit() {
            try {
                if (typeof qx !== 'undefined' && qx && qx.core && qx.core.Init && qx.core.Init.getApplication && qx.core.Init.getApplication() && qx.core.Init.getApplication().initDone) {
                    init();
                } else {
                    window.setTimeout(checkForInit, 1000);
                }
            } catch (e) {
                console.log(scriptName, e);
            }
        }
        checkForInit();
    }
    //inject userscript
    if (/commandandconquer\.com/i.test(document.domain)) {
        try {
            const script_block = document.createElement('script');
            script_block.innerHTML = `(${script.toString()})();`;
            script_block.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(script_block);
        } catch (e) {
            console.log('Failed to inject script', e);
        }
    }
})();
