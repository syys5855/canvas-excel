import _ from 'lodash';
import Xlsx from 'xlsx'
import DrawUtils from './draw';

const DISTANCE_TEXT = '物理距离',
    NO = '编号',
    POSITION = '所在位置',
    CANVAS_WIDTH = 600,
    CANVAS_HEIGHT = 1700,
    LEN = 750000000,
    CALC_POS = 300000000,
    DRAW_HEIGHT = 1500,
    DRAW_ST_POS = [CANVAS_WIDTH / 2, 10],
    HORIZONTAL_DELTA = 20,
    HORZIONTAL_LINE_LEN = 100, //水平的线的长度
    HORZIONTAL_lINE_DELTA = 100, //第一条线的水平偏移
    HORZIONTAL_TEXT_DELTA = 50, //文字与左边的水平偏移
    DRAW_ED_POS = [DRAW_ST_POS[0] + HORIZONTAL_DELTA, DRAW_ST_POS[1] + DRAW_HEIGHT];

let floor = Math.floor;

window.onload = () => {
    let fileEl = document.querySelector('#file');
    // draw(testData);
    fileEl.onchange = function(e) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsBinaryString(file);

        reader.onload = (e) => {
            let result = e.target.result;
            let wb = Xlsx.read(btoa(result), { type: 'base64' });
            let data = to_json(wb);

            let datas = [];
            for (let [key, value] of Object.entries(data)) {
                let _arrs = parse_distance(value);
                datas.push(Object.defineProperty(_arrs, 'sheet', { value: key }));
            }
            // console.log(datas, data);
            draw(datas);

        }
    }

    function to_json(workbook) {
        var result = {};
        workbook.SheetNames.forEach(function(sheetName) {
            var roa = Xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            // 去除roa key中的空格
            roa = roa.map(valObj => {
                let obj = {};
                for (let key in valObj) {
                    obj[key.replace(/\s+/g, '')] = valObj[key];
                }
                return obj;
            });
            if (roa.length > 0) {
                result[sheetName] = roa;
            }
        });
        return result;
    }

    function parse_distance(arr) {
        return _.compact(arr.map(dt => {
            if (!dt[DISTANCE_TEXT] || !_.isFunction(dt[DISTANCE_TEXT].replace)) return;
            let distance = +dt[DISTANCE_TEXT].replace(/\,/g, '');
            return Object.assign({}, dt, {
                [DISTANCE_TEXT]: distance
            });
        }));
    }


    function draw(data) {
        data = data[0];
        let canEl = document.querySelector("#canvasCell");
        let ctx = canEl.getContext("2d");

        canEl.width = CANVAS_WIDTH;
        canEl.height = CANVAS_HEIGHT;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();


        //  着丝粒的位置
        let caY = Math.floor(CALC_POS / LEN * DRAW_HEIGHT),
            radius = HORIZONTAL_DELTA / 4 + 1,
            capos = [DRAW_ST_POS[0] + HORIZONTAL_DELTA / 2, caY];

        // 染色体上半部分
        let chupStpos = DRAW_ST_POS,
            chupEdpos = [capos[0] + HORIZONTAL_DELTA / 2, capos[1]];

        // 染色体下班部分
        let chbtStpos = [DRAW_ST_POS[0], capos[1]],
            chbtEdpos = DRAW_ED_POS;

        // 画出 染色体
        DrawUtils.drawRoundRect(ctx, chupStpos, chupEdpos, HORIZONTAL_DELTA / 2);
        DrawUtils.drawRoundRect(ctx, chbtStpos, chbtEdpos, HORIZONTAL_DELTA / 2);
        DrawUtils.drawCirlce(ctx, capos, radius);


        let ddatas = handleDrawData(data);
        drawByhandleData(ctx, ddatas);
        console.log(ddatas, data);


    }

    function handleDrawData(data) {
        let lastPos = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
        return data.map((dt, index) => {
            let isEven = true, //左边为true
                dx = isEven ? DRAW_ST_POS[0] : DRAW_ED_POS[0],
                dy = floor(dt[DISTANCE_TEXT] / LEN * DRAW_HEIGHT) + DRAW_ST_POS[1],
                textPos = [],
                noPos = [];

            // 计算文字的位置
            let ty = Math.max(dy, lastPos[1] + 13);
            textPos = [dx - HORZIONTAL_lINE_DELTA, ty];
            noPos = [dx + HORIZONTAL_DELTA + HORZIONTAL_lINE_DELTA, ty];
            lastPos = _.clone(textPos);

            return {
                pos: [dx, dy], //在染色体上的点
                textPos,
                noPos,
                type: dt[POSITION],
                no: dt[NO],
                isEven,
                [DISTANCE_TEXT]: dt[DISTANCE_TEXT]
            };
        });
    }

    // 根据处理完的数据画图
    function drawByhandleData(ctx, data) {
        data.forEach(dt => {
            let { pos, isEven, textPos, type, no, noPos } = dt,
            edx = pos[0] + HORZIONTAL_LINE_LEN * (isEven ? -1 : 1);
            let epos = [edx, pos[1]];
            // 左边的线条
            DrawUtils.drawLine(ctx, pos, textPos, [textPos[0] - HORZIONTAL_TEXT_DELTA, textPos[1]]);
            // 左边的文字
            DrawUtils.drawText(ctx, [textPos[0] - 2 * HORZIONTAL_TEXT_DELTA, textPos[1]], no);

            DrawUtils.drawLine(ctx, [pos[0] + HORIZONTAL_DELTA, pos[1]], noPos, [noPos[0] + 50, noPos[1]]);
            // 右边的文字
            DrawUtils.drawText(ctx, [noPos[0] + 50, noPos[1]], _fmoney(dt[DISTANCE_TEXT], 0));
        });
    }

    // 格式化金额
    function _fmoney(s, n) {
        n = n >= 0 && n <= 20 ? n : 2;
        console.log(n);
        s = n !== 0 ? (parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "") : (parseInt((s + "")) + "");
        let l = s.split(".")[0].split("").reverse(),
            r = s.split(".")[1],
            t = "";
        for (let i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        return n !== 0 ? (t.split("").reverse().join("") + "." + r) : (t.split("").reverse().join(""));
    }


}