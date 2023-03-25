// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    var bkAlpha, fgAlpha, alpha;

    for (var y = 0; y < fgImg.height; y++) {
        for (var x = 0; x < fgImg.width; x++) {
            var bkCords = ((fgImg.width * (fgPos.y + y)) + (fgPos.x + x)) * 4;
            var fgCords = ((fgImg.width * y) + x) * 4

            if (bkCords >= 0 && (fgPos.y + y) < fgImg.height && (fgPos.x + x) < fgImg.width && fgPos.y + y >= 0 && fgPos.x + x >= 0) {
                bkAlpha = bgImg.data[bkCords + 3];
                fgAlpha = fgImg.data[fgCords + 3] * fgOpac;
                alpha = fgAlpha + ((255 - fgAlpha)/255 * bkAlpha);

                bgImg.data[bkCords + 0] = ((fgAlpha * fgImg.data[fgCords + 0]) + ((255 - fgAlpha) / 255 * bkAlpha * bgImg.data[bkCords + 0])) / alpha;
                bgImg.data[bkCords + 1] = ((fgAlpha * fgImg.data[fgCords + 1]) + ((255 - fgAlpha) / 255 * bkAlpha * bgImg.data[bkCords + 1])) / alpha;
                bgImg.data[bkCords + 2] = ((fgAlpha * fgImg.data[fgCords + 2]) + ((255 - fgAlpha) / 255 * bkAlpha * bgImg.data[bkCords + 2])) / alpha;
                bgImg.data[bkCords + 3] = alpha;
            }
        }
    }

}
