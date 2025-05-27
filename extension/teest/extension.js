import { lib, game, ui, get, ai, _status } from "../../noname.js";
export const type = "extension";
export default function () {
    return {
        name: "teest", arenaReady: function () {

        }, content: function (config, pack) {

        }, prepare: function () {

        }, precontent: function () {

        }, config: {}, help: {}, package: {
            character: {
                character: {
                    "谷爱凌": ["female", "wei", 4, ["luoying", "qixi", "gailing_zishiying", "gailing_aiguo"], []],
                },
                translate: {
                    "谷爱凌": "谷爱凌",
                },
            },
            card: {
                card: {
                },
                translate: {
                },
                list: [],
            },
            skill: {
                skill: {
                    "gailing_zishiying": {
                        audio: 2,
                        trigger: {
                            global: "roundStart", // 确保界面已初始化
                        },
                        forced: true,
                        locked: true,
                        async content(event, trigger, player) {
                            var list = ["wei", "shu"];
                            const result = await player.chooseControl(list)
                                .set("prompt", "自适应：请选择你本轮的阵营").forResult();
                            if (result.control) {
                                const group = result.control;
                                player.popup(group + "2");
                                game.log(player, "选择了", "#y" + get.translation(group + "2"));
                                if (player.group != group) await player.changeGroup(group);
                            }
                        },
                    },
                    "gailing_aiguo": {
                        audio: 2,
                        enable: "phaseUse",
                        usable: 1,
                        filter: function (event, player) {
                            return player.group == "wei" || player.group == "shu";
                        },
                        filterTarget: function (card, player, target) {
                            if (player.group == "shu") {
                                return target != player && player.countCards("h") > 0 && target.countCards("h") > 0;
                            } else if (player.group == "wei") {
                                return player.canUse({ name: "sha" }, target, false);
                            }
                            return false;
                        },
                        content: async function () {
                            var player = _status.event.player;
                            var target = _status.event.target;

                            player.logSkill("gailing_aiguo", target);

                            if (player.group == "shu") {
                                if (player.countCards("h") == 0 || target.countCards("h") == 0) return;

                                // 拼点过程（结构参考 tianyi）
                                const result = await player.chooseToCompare(target).forResultBool();

                                if (result) {
                                    player.draw(3);  // 拼点胜利
                                } else {
                                    player.draw();   // 拼点失败或平局
                                }
                            } else if (player.group == "wei") {
                                // 魏国效果：视为使用一张杀（不计入次数限制）
                                player.useCard({ name: "sha" }, target, null, false);
                            }
                        },
                        ai: {
                            order: 8,
                            result: {
                                target: function (player, target) {
                                    return -1;
                                }
                            }
                        }
                    },

                },
                translate: {
                    "gailing_zishiying": "自适应",
                    "gailing_zishiying_info": "锁定技。每轮开始后，你可选择“魏”或“蜀”一个阵营，直到该轮结束，你视为该阵营角色。",
                    "gailing_aiguo": "爱国",
                    "gailing_aiguo_info": "出牌阶段限一次：若你当前属于\"蜀\"阵营，你可选择一名其他角色与其拼点，若你赢，摸两张牌；若你输，摸一张牌（若任意一方无手牌则无法拼点）。若你当前属于\"魏\"阵营，你可选择攻击范围内的一名角色，视为对其使用一张【杀】（不计入使用次数限制）。"
                },
                intro: "",
                author: "无名玩家",
                diskURL: "",
                forumURL: "",
                version: "1.0",
            },
            files: { "character": ["谷爱凌.jpg"], "card": [], "skill": [], "audio": [] }, connect: false
        }
    }
}