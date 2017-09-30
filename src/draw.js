export default {
    // pos:[x,y]
    drawRoundRect(ctx, ltpos, rbpos, radius) {
        let [stx, sty] = ltpos, [edx, edy] = rbpos;

        let width = Math.abs(edx - stx),
            height = Math.abs(edy - sty);

        ctx.beginPath();
        ctx.moveTo(stx, sty);
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(stx + radius, sty + radius, radius, -Math.PI, -Math.PI / 2, );
        ctx.lineTo(edx - radius, sty);
        ctx.arc(edx - radius, sty + radius, radius, -Math.PI / 2, 0);
        ctx.lineTo(edx, edy - radius);
        ctx.arc(edx - radius, edy - radius, radius, 0, Math.PI / 2);
        ctx.lineTo(stx + radius, edy);
        ctx.arc(stx + radius, edy - radius, radius, Math.PI / 2, Math.PI);
        ctx.closePath();
        ctx.stroke();
    },
    drawCirlce(ctx, pos, radius) {
        let [x, y] = pos;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    },
    drawLine(ctx, ...pointers) {
        let [stx, sty] = pointers[0];
        ctx.beginPath();
        ctx.moveTo(stx, sty);
        pointers.slice(1).forEach(([x, y]) => {
            ctx.lineTo(x, y);
        })
        ctx.stroke();
        ctx.closePath();
    },
    drawText(ctx, [x, y], text) {
        ctx.fillText(text, x, y);
    }
}