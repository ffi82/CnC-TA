// ==UserScript==
// @name        CnC-TA Lister
// @namespace   https://github.com/ffi82/CnC-TA/
// @version     2025-03-23
// @description Under 'Scripts' menu, click to download CSV files containing Alliance Cities, Alliances, Players and Cities, Player Hall Of Fame / Challenge ranking, Alliance Roster, Alliance Cities and POIs data. How to: Click --> See progress bar above game options --> check your downloads folder for new .csv file/s. (Check your browser console [ Control+Shift+J ] in Chrome / Edge / Firefox for some logs.)
// @author      ffi82
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL   https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Lister.meta.js
// @downloadURL https://github.com/ffi82/CnC-TA/raw/refs/heads/master/CnC-TA_Lister.user.js
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAk5JREFUeF7tWctxwjAQlStIC1RAAxlmyDFpJWfOIWfOaSU5hhkqSAfpxEExGDBa7a5XljX244ok73v7tD9Vbua/aub4HQiAAmbOAK7AzAWAIDjaFdgdXt6u1bdZfb6PocZRCNgdnr+dq9a3gOv9ZvX1lJuE7AScPL8lgG5zKwEE5JYcFNAEP1wBxIAwAwiCyAKZCyKkQaTBzAygDkAdgEIIlSBKYfQCaIbQDaIbnFI3qJnwWipBzXekBa65GQoDoie8fQkIT5KdeX6QgIDQiNvzHyahDwEEePIbUu/7dSYCGDBBA7UE0OBbmCYVmAjwJvAG3ipBQwB/9j8J4xKgJUFKgAy8/TXJrICzEHmDG2MlBPBn0TFGc/9FMaCbevwmanDJG17vj2+C+1gzdAye6/t3wy4sNsu0G7gha1QBEW+R944joarcb127RchTsf8u61nw3TI7GiOSEyCLCVqhntfH7zzhsPwEDEMCH/CKIiAtCTz45nvBcds4CpBnB+46yMAXS4BNCXLwRROgJ6FJl1wK62qnyCtwbSSXIpu1Oq/fnl9gDLj3EtU92sAXfwV4JfT3PBNwh8gCqY1NcR754tSfAM/s68fjz2L5sLxPVsmMJnsLLkFePO/Bkz2EjYB499Y2N1JbB1gXa554J4naYVn0HgCb/Uh2WCIkIPqiazdzkBN47/vPigjQFzKDIFIcKgOvIuCSZyUDC4WtSZfqK0ixAgIVV1LTUxymLZ3VCkhhZGln9FJAaSAs9oAAC3tT2AsFTMGLFgxQgIW9Kez9A8eY4FA22gNKAAAAAElFTkSuQmCC
// @grant       none
// ==/UserScript==
/* global qx, ClientLib, webfrontend */
'use strict';
(() => {
    const ListerScript = () => {
        const scriptName = 'CnC-TA Lister';
        let timestamp,
            Alliances,
            AlliancesArr,
            AlliancesArr2,
            Players,
            PlayersArr,
            PlayersArr2,
            Cities,
            CitiesArr,
            CitiesCount,
            AllianceCitiesArr,
            AllianceCities = "";
        /*
         * get Alliances list
         */
        const getAlliances = () => {
            timestamp = performance.now();
            Alliances = "";
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
        const onAllianceRankingGetData = (context, data) => {
            for (const getAlliance of data.a) {
                AlliancesArr.push({
                    "Ranking": getAlliance.r,
                    "Alliance_Id": getAlliance.a,
                    "Alliance_Name": getAlliance.an,
                    "Alliance_Has_Won": getAlliance.aw,
                    "Member_Count": getAlliance.pc,
                    "Base_Count": getAlliance.bc,
                    "Top_40_scores": getAlliance.s,
                    "Average_Score": getAlliance.sa,
                    "Total_Score": getAlliance.sc,
                    "Event_Rank": getAlliance.er,
                    "Event_Score": getAlliance.es,
                    "Average_Faction": getAlliance.fac
                });
                getPublicAllianceInfoById(getAlliance.a);
            }
        }
        const getPublicAllianceInfoById = (n) => {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicAllianceInfo", {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                AlliancesArr2.push({
                    "Abbreviation": data.a,
                    "CiC_Player_Id": data.cic,
                    "Bases_Destroyed": data.bd,
                    "Bases_Destroyed_Environment": data.bde,
                    "Bases_Destroyed_Player": data.bdp,
                    "POI_Count:": data.poi,
                    "Is_Inactive": data.ii,
                    "EndGame_Won_Rank": data.egwr,
                    "EndGame_Won_Step": data.egws,
                    "Description": '"' + data.d + '"'
                });
                progressBar(AlliancesArr2.length, AlliancesArr.length, "Alliances");
                if (AlliancesArr.length === AlliancesArr2.length) {
                    for (let i = 0; i < AlliancesArr.length; i++) {
                        Alliances += String([Object.values(AlliancesArr.at(i)), Object.values(AlliancesArr2.at(i))]) + "\r\n";
                    }
                    Alliances = String([Object.keys(AlliancesArr[0]), Object.keys(AlliancesArr2[0])]) + "\r\n" + Alliances;
                    //console.log(Alliances);
                    getCSV(Alliances, "Alliances");
                    console.info(`%cAlliances (${AlliancesArr.length}) list done in ${msToTime(performance.now() - timestamp)}`, "color: white; background: radial-gradient(olive, black);");
                }
            }), null);
        }
        /*
         * get Players and Cities list
         */
        const getPlayersAndCities = () => {
            timestamp = performance.now();
            Players = "";
            Cities = "";
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
        const onPlayerRankingGetData = (context, data) => {
            for (const getPlayer of data.p) {
                PlayersArr.push(getPlayer);
                CitiesCount += getPlayer.bc;
                getPublicPlayerInfoById(getPlayer.p);
            }
        }
        const getPublicPlayerInfoById = (n) => {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicPlayerInfo', {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                const s = ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                PlayersArr2.push({
                    "Player_Ranking": data.r,
                    "Player_Id": data.i,
                    "Player_Name": data.n,
                    "Player_Faction": data.f,
                    "Player_Score": data.p,
                    "Alliance_Id": data.a,
                    "Alliance_Name": data.an,
                    "Player_Bases_Count": data.c.length,
                    "Player_versus_Bases": data.bd,
                    "Player_versus_Environment": data.bde,
                    "Player_versus_Player": data.d,
                    "Player_has_Code": data.hchc,
                    "Player_Endgame_Won_Count": data.ew.length,
                    "Player_Challange_Won_Count": data.cw.length,
                    "Player_Other_Won_Count": data.mw.length,
                    "Player_Distance_to_Center": data.dccc,
                    "Player_is_Inactive": data.ii,
                    "Player_lr": data.lr,
                    "Player_mv": data.mv,
                    "Player_np": data.np,
                    "Player_nr": data.nr,
                    "Player_sli_Count": data.sli.length,
                    "Player_is_Veteran_Points": data.vp,
                    "Endgame_Won_Server_Name": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).n : '',
                    "Endgame_Won_Rank": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).r : '',
                    "Endgame_Won_Alliance": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).an : '',
                    "Endgame_Won_Timestamp": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).ws : '',
                    "Endgame_Won_Member_Role": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).mr : '',
                    "Endgame_Won_Member_Faction": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).f : '',
                    "Endgame_Won_Member_is": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).is : '',
                    "Endgame_Won_Member_iv": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).iv : '',
                });
                progressBar(PlayersArr2.length, PlayersArr.length, "Players");
                if (PlayersArr.length === PlayersArr2.length) {
                    for (let p = 0; p < PlayersArr2.length; p++) {
                        Players += String(Object.values(PlayersArr2[p])) + "\r\n";
                    }
                    //console.table(PlayersArr2);
                    Players = Object.keys(PlayersArr2[0]) + "\r\n" + Players;
                    getCSV(Players, "Players");
                    console.info(`%cPlayers (${PlayersArr2.length}) list done in ${msToTime(performance.now() - timestamp)}`, "color: white; background: radial-gradient(olive, black);");
                    timestamp = performance.now();
                }
                //start Cities list: get city ids from players list
                for (const getCityId of data.c) {
                    getPublicCityInfoById(getCityId.i);
                }
            }), null);
        }
        const getPublicCityInfoById = (n) => {
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicCityInfoById', {
                id: n
            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                CitiesArr.push({
                    "Base_Ranking": 0,
                    "Alliance_Name": data.an,
                    "Alliance_Id": data.a,
                    "Player_Name": data.pn,
                    "Player_Id": data.p,
                    "Base_Name": data.n,
                    "Base_Id": data.i,
                    "Faction": data.f,
                    "Base_is_Ghost": data.g,
                    "Player_has_Won": data.w,
                    "Base_Score": data.po,
                    "Base_Coord_X": data.x,
                    "Base_Coord_Y": data.y,
                    "Base_Sector": getSector(data.x, data.y),
                    "Base_Distance_From_Center": getDistanceFromCenter(data.x, data.y)
                });
                progressBar(CitiesArr.length, CitiesCount, "Cities");
                if (CitiesArr.length === CitiesCount) { //when CitiesArr ready, start to build the list
                    CitiesArr.sort((a, b) => b.Base_Score - a.Base_Score); //Sort cities by score descending
                    for (let c = 0; c < CitiesArr.length; c++) {
                        CitiesArr.at(c).Base_Ranking = c + 1; //fill City Ranking by score
                        Cities += Object.values(CitiesArr.at(c)) + "\r\n"; //Add to Cities list
                    }
                    //console.table(CitiesArr);
                    Cities = Object.keys(CitiesArr[0]) + "\r\n" + Cities;
                    getCSV(Cities, "Cities");
                    console.info(`%cCities (${CitiesArr.length}) list done in ${msToTime(performance.now() - timestamp)}`, "color: white; background: radial-gradient(olive, black);");
                }
            }), null);
        }
        /*
         * get Player Hall Of Fame list
         */
        const getPlayerHallOfFame = () => {
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
                    let PlayerHallOfFame = "",
                        phofArr = [];
                    for (const getPHOF of data.phof) {
                        phofArr.push({
                            "Ranking": getPHOF.r,
                            "Player_Id": getPHOF.p,
                            "Player_Name": getPHOF.pn,
                            "Season_Won": getPHOF.sw,
                            "Total_Veteran_Points": getPHOF.tvp
                        });
                        PlayerHallOfFame += Object.values(getPHOF) + "\r\n";
                        progressBar(phofArr.length, data.phof.length, "Player Hall of Fame"); // This one's fast... progress bar can/should be disabled for this list...
                        //progressBar([...PlayerHallOfFame].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0) - 1,data.phof.length," Player Hall of Fame"); // Slow... makes phofArr redundant though
                    }
                    //console.table(phofArr); //phofArr <=> data.phof
                    PlayerHallOfFame = Object.keys(phofArr[0]) + "\r\n" + PlayerHallOfFame;
                    getCSV(PlayerHallOfFame, "PlayerHallOfFame");
                    console.info(`%cPlayer Hall Of Fame (${Object.values(data.phof).length}) list done in ${msToTime(performance.now() - timestamp)}`, "color: white; background: radial-gradient(olive, black);");
                }), null);
            }), null);
        }
        /*
         * get Alliance Roster
         */
        const getAllianceRoster = () => {
            timestamp = performance.now();
            const roster = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray();
            let AllianceRoster = "Id,Name,Role,Rank,Points,Bases,OnlineState,LastSeen,ActiveState,Level,Faction,JoinStep,HasControlHubCode,VeteranPointContribution,AvgDefenseLvl,AvgOffenseLvl,BestOffenseLvl,BestDefenseLvl,RoleName\r\n";
            for (const member of roster) {
                AllianceRoster += Object.values(member) + "\r\n";
                progressBar([...AllianceRoster].reduce((a, c) => a + (c === '\n' ? 1 : 0), 0) - 1, roster.length, "Alliance Roster");
            }
            //console.table(roster);
            getCSV(AllianceRoster, "AllianceRoster");
            console.info(`%cAlliance Roster (${roster.length}) list done in ${msToTime(performance.now() - timestamp)}`, "color: white; background: radial-gradient(olive, black);");
        }
        /*
         * get Points Of Interest list
         */
        const getPOIs = () => {
            const qxApp = qx.core.Init.getApplication();
            const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
            const mainData = ClientLib.Data.MainData.GetInstance();
            timestamp = performance.now();
            qxApp.showMainOverlay(false); // Switch to region view
            webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(Math.floor(mainData.get_Server().get_WorldWidth() / 2), Math.floor(mainData.get_Server().get_WorldHeight() / 2)); // Center map on region view
            waitForMapAreaResize(region).then(() => {
                return processPOIs(region, timestamp)
            }); // Wait for the map area resize to complete and process all RegionPointOfInterest (except tunnel exit)
        }
        // Calculate ZoomFactor for your window width and height. The bigger ZoomFactor is chosen to ensure the map fills the window and crops off whatever doesn't fit... get_VisAreaComplete() will return 'false' otherwise.
        const calculateZoomFactor = () => {
            const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
            const fullMapWidth = region.get_MaxXPosition(); // 102400
            const fullMapHeight = region.get_MaxYPosition(); // 76800
            const viewableWidth = window.innerWidth;
            const viewableHeight = window.innerHeight;
            const zoomFactorWidth = Math.ceil(viewableWidth / fullMapWidth * 1000) / 1000;
            const zoomFactorHeight = Math.ceil(viewableHeight / fullMapHeight * 1000) / 1000;
            return Math.max(zoomFactorWidth, zoomFactorHeight);
        }
        // Set the proper zoom on region view and wait for objects to be available... get_VisAreaComplete() must return "true"
        const waitForMapAreaResize = (region) => {
            const cfg = ClientLib.Config.Main;
            cfg.GetInstance().SetConfig(cfg.CONFIG_VIS_REGION_MINZOOM, false); // Uncheck 'Allow max zoom out' in game video options
            cfg.GetInstance().SaveToDB(); //Save settings
            const getMinZoomMethod = region.get_MinZoomFactor.toString().match(/\$I\.[A-Z]{6}\.([A-Z]{6});?}/)?.[1]; // Extract the `getMinZoomFactor` method dynamically.
            ClientLib.Vis.Region.Region[getMinZoomMethod] = calculateZoomFactor(); // Modify the MinZoomFactor to be able to zoom out further
            region.set_ZoomFactor(calculateZoomFactor()); // Zoom out the region view to visualize the entire world... bird's eye view
            return new Promise((resolve) => {
                const checkResizeComplete = setInterval(() => {
                    if (region.get_VisAreaComplete()) {
                        clearInterval(checkResizeComplete);
                        resolve();
                    }
                }, 100);
            });
        }
        const processPOIs = async (region, timestamp) => {
            const mainData = ClientLib.Data.MainData.GetInstance();
            const rangeX = mainData.get_Server().get_WorldWidth();
            const rangeY = mainData.get_Server().get_WorldHeight();
            const maxLevel = mainData.get_Server().get_MaxCenterLevel();
            const POIScore = Array.from({
                length: maxLevel + 1
            }, (_, i) => ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(i));
            const gridWidth = region.get_GridWidth();
            const gridHeight = region.get_GridHeight();
            let AllPOIs = [];
            let POIs = "";
            for (let x = -rangeX; x <= rangeX; x++) {
                for (let y = -rangeY; y <= rangeY; y++) {
                    const xPos = x * gridWidth;
                    const yPos = y * gridHeight;
                    const visObject = region.GetObjectFromPosition(xPos, yPos);
                    if (!visObject || visObject.get_VisObjectType() !== ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest || visObject.get_Name() === 'Tunnel exit') {
                        continue;
                    }
                    AllPOIs.push({
                        "POI_Level": visObject.get_Level(),
                        "POI_Name": visObject.get_Name().split(' ')[0],
                        "POI_Coord_X": x,
                        "POI_Coord_Y": y,
                        "POI_Owner_Alliance_Name": visObject.get_OwnerAllianceName(),
                        "POI_Score": POIScore[visObject.get_Level()],
                        "POI_Type": visObject.get_Type(),
                        "POI_Sector": getSector(x, y),
                        "POI_Distance_From_Center": getDistanceFromCenter(x, y),
                        "POI_Holders": JSON.stringify(Object.values(findPOIHolders(x, y)))
                    });
                }
            }
            region.set_ZoomFactor(1);
            AllPOIs.sort((a, b) => b.POI_Level - a.POI_Level || a.POI_Type - b.POI_Type);
            POIs += Object.keys(AllPOIs[0]) + "\r\n" + POIs;
            for (const poi of AllPOIs) POIs += Object.values(poi) + "\r\n";
            getCSV(POIs, "POIs");
            console.info(`%cPoints of Interest (${AllPOIs.length}) list done in ${Math.round(performance.now() - timestamp) / 1000} seconds`, "color: white; background: radial-gradient(olive, black);");
        }
        // Find POI holders within 2 fields of a POI
        const findPOIHolders = (poiX, poiY) => {
            const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
            const holders = [];
            const range = 2;
            const gridWidth = region.get_GridWidth();
            const gridHeight = region.get_GridHeight();
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    const xPos = (poiX + x) * gridWidth;
                    const yPos = (poiY + y) * gridHeight;
                    const visObject = region.GetObjectFromPosition(xPos, yPos);
                    if (!visObject || visObject.get_VisObjectType() !== ClientLib.Vis.VisObject.EObjectType.RegionCityType || calculateMetric(x, y, 'distance', 0, 0) >= range * Math.sqrt(2)) {
                        continue;
                    }
                    holders.push({
                        Base: visObject.get_Name(),
                        Player: visObject.get_PlayerName(),
                        Alliance: visObject.get_AllianceName(),
                        Coords: `${poiX + x}:${poiY + y}`,
                        Distance: Math.round(calculateMetric(x, y, 'distance', 0, 0))
                    });
                }
            }
            return holders;
        }
        // Returns angle, distance, clock position (the relative direction of your object coords (1st and 2nd arguments) described using the analogy of a 12-hour clock to describe angles and directions) or sector between 2 points... The 2nd point (4th and 5th arguments) is the center by default... can be replaced with any other object coords. Example usage: calculateMetric(407, 390, 'clock', 400, 400); or calculateMetric(407, 390, 'sector');
        const calculateMetric = (xB, yB, metricType, xA = ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_X() + ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_SizeX() / 2, yA = ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_Y() + ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_SizeY() / 2) => {
            const qxApp = qx.core.Init.getApplication();
            const sectorNames = ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast'];
            const clockPositions = Array(12).fill().map((_, i) => `${i || 12} o'clock`);
            const deltaX = xB - xA;
            const deltaY = yB - yA;
            const calculations = {
                angle: () => (360 + Math.atan2(deltaY, deltaX) * (180 / Math.PI)) % 360,
                distance: () => Math.hypot(deltaX, deltaY),
                sector: () => {
                    if (xA !== ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_X() + ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_SizeX() / 2 || yA !== ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_Y() + ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_SizeY() / 2) {
                        throw new Error("The 'sector' metric can only be calculated from the default center coordinates.");
                    }
                    const angle = (Math.atan2((ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_X() + ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_SizeX() / 2) - xB, yB - (ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_Y() + ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_SizeY() / 2)) * sectorNames.length) / (2 * Math.PI) + sectorNames.length + 0.5;
                    return qxApp.tr(`tnf:${sectorNames[Math.floor(angle) % sectorNames.length]} abbr`);
                },
                clock: () => {
                    const angle = Math.atan2(yA - yB, xA - xB);
                    const normalizedAngle = (angle * 180 / Math.PI + 90 + 360) % 360; // Shift by 90 degrees for clock alignment
                    const clockIndex = Math.round((normalizedAngle / 360) * 12) % 12;
                    return clockPositions[clockIndex];
                },
            };
            if (!calculations[metricType]) {
                throw new Error("Invalid metricType. Use 'angle', 'distance', 'sector', or 'clock'.");
            }
            return calculations[metricType]();
        }
        /*
         * get Alliance Cities list
         */
        const getAllianceCities = async () => {
            const memberDataAsArray = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray();
            timestamp = performance.now();
            AllianceCitiesArr = [];
            for (const member of memberDataAsArray) {
                await getPublicPlayerInfoByIdAC(member.Id); // Sequentially process each member's public info
            }
            AllianceCitiesArr.sort((a, b) => b.Base_Score - a.Base_Score);
            AllianceCitiesArr.sort((a, b) => a.Player_Id - b.Player_Id);
            //console.table(AllianceCitiesArr);
            await processCityIDs(AllianceCitiesArr.map(item => item.Base_Id)); // Process cities asynchronously (but sequentially)
        }
        const getPublicPlayerInfoByIdAC = async (playerId) => {
            try {
                const data = await new Promise((resolve, reject) => {
                    ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('GetPublicPlayerInfo', {
                        id: playerId
                    }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {
                        resolve(data);
                    }), reject);
                });
                const s = ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                for (const city of data.c) {
                    AllianceCitiesArr.push({
                        "Server_Name": s,
                        "Alliance_Name": data.an,
                        "Alliance_Id": data.a,
                        "Player_Name": data.n,
                        "Player_Id": data.i,
                        "Player_Faction": data.f,
                        "Player_Ranking": data.r,
                        "Player_Score": data.p,
                        "Player_Bases_Count": data.c.length,
                        "Player_Distance_to_Center": data.dccc,
                        "Player_has_Code": data.hchc,
                        "Player_versus_Bases": data.bd,
                        "Player_versus_Environment": data.bde,
                        "Player_versus_Player": data.d,
                        "Player_is_Inactive": data.ii,
                        "Player_Endgame_Won_Count": data.ew.length,
                        "Player_Challange_Won_Count": data.cw.length,
                        "Player_Other_Won_Count": data.mw.length,
                        "Endgame_Won_Server_Name": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).n : '',
                        "Endgame_Won_Rank": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).r : '0',
                        "Endgame_Won_Alliance": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).an : '',
                        "Endgame_Won_Timestamp": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).ws : '',
                        "Endgame_Won_Member_Role": data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).mr : '',
                        "Base_Name": city.n,
                        "Base_Id": city.i,
                        "Base_Score": city.p,
                        "Base_Coord_X": city.x,
                        "Base_Coord_Y": city.y,
                        "Base_Sector": getSector(city.x, city.y),
                        "Base_Distance_from_Center": getDistanceFromCenter(city.x, city.y),
                    });
                }
            } catch (error) {
                console.error(`Error fetching player info for ID ${playerId}:`, error);
            }
        }
        const loadCity = (id) => {
            return new Promise((resolve) => {
                ClientLib.API.Util.SetPlayAreaView(ClientLib.Data.PlayerAreaViewMode.pavmNone, id, 0, 0);
                ClientLib.Net.CommunicationManager.GetInstance().$Poll();
                const checkLoading = setInterval(() => {
                    const loadedCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                    // Check if the loaded city's ID matches the requested city ID
                    if (loadedCity && loadedCity.get_Id() === id && loadedCity.get_FoundStep()) {
                        clearInterval(checkLoading);
                        resolve(loadedCity);
                    }
                }, 10);
            });
        }
        const processCityIDs = async (remainingCityIds) => {
            let failedCities = [];
            let processedCityIds = JSON.parse(localStorage.getItem('processedCityIds')) || []; // Load already processed city IDs from localStorage (or memory)
            remainingCityIds = remainingCityIds.filter(cityId => !processedCityIds.includes(cityId)); // Filter out already processed city IDs from remainingCityIds
            while (remainingCityIds.length > 0) {
                const cityId = remainingCityIds[0]; // Take the first city ID
                try {
                    const loadedCity = await loadCity(cityId); // Wait for the city to load
                    const cityData = {
                        ...AllianceCitiesArr.find(city => city.Base_Id === cityId),
                        "Base_Found_Step": loadedCity.get_FoundStep(),
                        "Base_is_Ghost": loadedCity.get_IsGhostMode(),
                        "Base_Tiberium_per_Hour": loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true),
                        "Base_Crystal_per_Hour": loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true),
                        "Base_Power_per_Hour": loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true),
                        "Base_Credits_per_Hour": (loadedCity.get_CityCreditsProduction().Delta + loadedCity.get_CityCreditsProduction().ExtraBonusDelta) * 3600,
                        "Base_Base_Level": loadedCity.get_LvlBase(),
                        "Base_Defense_Level": loadedCity.get_LvlDefense(),
                        "Base_Offense_Level": loadedCity.get_LvlOffense(),
                        "Base_Construction_Yard_Level": loadedCity.get_ConstructionYardLevel(),
                        "Base_Command_Center_Level": loadedCity.get_CommandCenterLevel(),
                    };
                    qx.core.Init.getApplication().showMainOverlay(!1);
                    if (!loadedCity) {
                        failedCities.push(cityId);
                        continue;
                    }
                    //console.log(cityData);
                    AllianceCities += Object.values(cityData).join(",") + "\r\n";
                    remainingCityIds.shift(); // Remove the processed city ID from the list
                    processedCityIds.push(cityId); // Add the processed city ID to the list of processed cities
                    localStorage.setItem('processedCityIds', JSON.stringify(processedCityIds)); // Store the updated processed city IDs in localStorage
                    progressBar(processedCityIds.length, AllianceCitiesArr.length, "Alliance Cities");
                    if (processedCityIds.length === AllianceCitiesArr.length) {
                        AllianceCities = Object.keys(cityData).join(",") + "\r\n" + AllianceCities;
                        getCSV(AllianceCities, "AllianceCities");
                        //console.log(AllianceCities);
                        console.info(`%cAlliance Cities (${processedCityIds.length}) list done in ${msToTime(performance.now() - timestamp)}`, "color: white; background: radial-gradient(olive, black);");
                    }
                } catch (error) {
                    console.error(`Error loading City ID ${cityId}:`, error);
                    failedCities.push(cityId);
                }
            }
            if (failedCities.length > 0) {
                console.warn(`Failed to load ${failedCities.length} cities:`, failedCities);
            }
            if (remainingCityIds.length === 0) {
                localStorage.removeItem('processedCityIds'); // Clear localStorage after all cities have been processed
                AllianceCities = "";
            }
        }
        /*
         * helper functions
         */
        // List to CSV (Comma Separated Values file)
        const getCSV = (data, name) => {
            let elLink = document.createElement("a");
            let oBlob = new Blob([data], {
                type: 'text/csv;charset=utf-8;'
            });
            elLink.download = new Date().toISOString().slice(0, -14) + "_" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() + "_" + name;
            let oLastUrl = window.URL.createObjectURL(oBlob);
            elLink.href = oLastUrl;
            document.body.appendChild(elLink);
            elLink.click();
            document.body.removeChild(elLink);
            elLink = null;
        }
        // Progress bar for the lists
        const progressBar = (pbIndex, pbLength, pbName) => {
            const app = qx.core.Init.getApplication();
            const optionsBar = app.getOptionsBar().getLayoutParent().getChildren()[0].getChildren()[2];
            let pbContainer = optionsBar.getChildren().find(child => child.getUserData("pbContainer")); // Try to find an existing pbContainer in the parent
            if (!pbContainer) { // If pbContainer doesn't exist, create and add it
                pbContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                    padding: 0,
                    width: 115,
                    decorator: new qx.ui.decoration.Decorator().set({
                        width: 1,
                        style: "solid",
                        color: "black",
                        backgroundColor: "transparent",
                    }),
                });
                pbContainer.setUserData("pbContainer", true); // Mark this container with user data to identify it later
                optionsBar.addAt(pbContainer, 1); // Add pbContainer only once
            }
            let pb = pbContainer.getChildren()[0];
            if (!pb) { // If no progress bar exists inside pbContainer, create one
                pb = new qx.ui.basic.Label();
                pb.set({
                    value: pbIndex + " / " + pbLength + " " + pbName,
                    width: 0,
                    height: 11,
                    textColor: "black",
                    font: qx.bom.Font.fromString("9px tahoma"),
                    backgroundColor: "white",
                    decorator: "main",
                });
                pbContainer.add(pb);
            }
            pb.set({ // Update the progress label and width
                value: pbIndex + " / " + pbLength + " " + pbName,
                width: (pbIndex / pbLength) * 113,
            });
            if (pbIndex === pbLength) { // Remove pbContainer when progress is complete
                pbContainer.getLayoutParent().remove(pbContainer);
            }
        }
        // Convert milliseconds to time format "hh:mm:ss:mmm"
        const msToTime = (milliseconds) => {
            const hours = Math.floor(milliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
            const millisecondsLeft = Math.floor(milliseconds % 1000);
            return `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s:${millisecondsLeft.toString().padStart(3, '0')}ms`;
        }
        // Get world sector abbreviation by coords
        const getSector = (x, y) => {
            const qxApp = qx.core.Init.getApplication();
            const WorldWidth2 = Math.floor(ClientLib.Data.MainData.GetInstance().get_Server().get_WorldWidth() / 2);
            const WorldHeight2 = Math.floor(ClientLib.Data.MainData.GetInstance().get_Server().get_WorldHeight() / 2);
            const SectorCount = ClientLib.Data.MainData.GetInstance().get_Server().get_SectorCount();
            const WorldCX = (WorldWidth2 - x);
            const WorldCY = (y - WorldHeight2);
            const WorldCa = ((Math.atan2(WorldCX, WorldCY) * SectorCount) / (2 * Math.PI)) + (SectorCount + 0.5);
            const SectorNo = Math.floor(WorldCa) % SectorCount;
            return qxApp.tr(`tnf:${['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast'][SectorNo]} abbr`);
        }
        //get distance from center by coords
        const getDistanceFromCenter = (x, y) => {
            const Fortress = ClientLib.Data.MainData.GetInstance().get_EndGame().get_Hubs().d[1];
            const fx = Fortress.get_X() + Fortress.get_SizeX() / 2;
            const fy = Fortress.get_Y() + Fortress.get_SizeY() / 2;
            //return ((ClientLib.Data.MainData.GetInstance().get_Server().get_WorldWidth() / 2 - x) ** 2 + (ClientLib.Data.MainData.GetInstance().get_Server().get_WorldHeight() / 2 - y) ** 2) ** .5;
            return Math.sqrt((fx - x) ** 2 + (fy - y) ** 2); //distance formula in cartesian coordinates : d = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²] (z1=0 ,z2=0 in 2D spaces)
        }
        /*
         * initialization logic
         */
        // Add to Scripts menu
        const init = () => {
            const scriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton();
            const listerMenu = new qx.ui.menu.Menu();
            const icons = {
                Green: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG1JREFUOE9jZKAQMFKonwG/AQ0M/8EWNOBWN2oAAy0CETnkcbGR4h4RCy0M8gw1DA+h0QaJPnQAi04ktQgDQLYhxzfMdpgh6HJQPm4DIAkIe0JCsgzVAAKpDu4jrAYg20gogyB5h8aZiZBLgPIA/0oqEY62gBUAAAAASUVORK5CYII=',
                Lime: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGpJREFUOE9jZKAQMFKonwG/Af8Z/oMtYMStbtQAUPDgA2QFIrImXGwkSxEuaGGQZ6hheAiWg2lEdx0sOpHUIgwAaUKOb3RD0OWgfNwGILsEPSEhWYZqAIFUB/cRVgPw+R1XWIBTOYWAYgMAXJ0qEdD91o0AAAAASUVORK5CYII=',
                Red: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGxJREFUOE9jZKAQMFKonwGvAf8ZGP6DLGAEI+xg1AA8gQMKMrICEVkTLjZyfCBioYVBnqGG4SGyzegRB49OJLVwA0C2Icc3zHaYIehyMD5OA/CFAbJlKAYQSnUw12A1AJ/fcYYFJJlTBig2AABvnSoRu23XWQAAAABJRU5ErkJggg==',
                Blue: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAG5JREFUOE9jZKAQMFKonwGvAU6tX/6DLNhXzYNT3agBDDQIROSQx8VGjnpELLQwyDPUMDwEScI0oqcReHQiqYUbANKEHN/ohqDLwfg4DUB2CXpCQrYMxQBCqQ7mJawG4PM7zrBgIBCNxGQ0inMjAD6pUBFgbmXxAAAAAElFTkSuQmCC'
            };
            const a = new qx.ui.menu.Button("Alliances", icons.Lime);
            const b = new qx.ui.menu.Button("Players and Cities", icons.Lime);
            const c = new qx.ui.menu.Button("Player Hall of Fame", icons.Lime);
            const d = new qx.ui.menu.Button("Alliance Roster", icons.Lime);
            const e = new qx.ui.menu.Button("Alliance Cities", icons.Red);
            const f = new qx.ui.menu.Button("Points of Interest", icons.Blue);
            a.addListener("execute", getAlliances);
            b.addListener("execute", getPlayersAndCities);
            c.addListener("execute", getPlayerHallOfFame);
            d.addListener("execute", getAllianceRoster);
            e.addListener("execute", getAllianceCities);
            f.addListener("execute", getPOIs);
            listerMenu.add(a);
            listerMenu.add(b);
            listerMenu.add(c);
            listerMenu.add(d);
            listerMenu.add(e);
            listerMenu.add(f);
            const listerButton = new qx.ui.menu.Button("Lister", icons.Lime);
            listerButton.setMenu(listerMenu); // Associate the menu with the button
            scriptsButton.getMenu().add(listerButton); // Add the Lister button to the ScriptsButton's menu
        };
        // Wait for game
        const checkForInit = () => {
            try {
                if (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone) return setTimeout(checkForInit, 1000);
                init();
                console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            } catch (e) {
                console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;', e);
            }
        }
        checkForInit();
    }
    ListerScript();
})();
