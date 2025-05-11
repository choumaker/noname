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
                    "谷爱凌": ["female", "wei", 4, ["luoying", "qixi", "gailing_zishiying"], []],
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
                        async content(event, trigger, player){
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
                    }
                },
                translate: {
                    "gailing_zishiying": "自适应",
                    "gailing_zishiying_info": "锁定技。每轮开始后，你可选择“魏”或“蜀”一个阵营，直到该轮结束，你视为该阵营角色。",
                }

            },
            intro: "",
            author: "无名玩家",
            diskURL: "",
            forumURL: "",
            version: "1.0",
        }, files: { "character": ["谷爱凌.jpg"], "card": [], "skill": [], "audio": [] }, connect: false
    }
};