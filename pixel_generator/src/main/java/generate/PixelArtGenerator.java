package generate;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.ImageObserver;
import java.awt.image.PixelGrabber;

public class PixelArtGenerator {

    private int width;
    private int height;
    private int[] pixels;
    private int pixelSize;
    private BufferedImage img;

    public PixelArtGenerator(BufferedImage img, int pixelSize){
        width = img.getWidth();
        height = img.getHeight();
        pixels = new int[width * height];
        this.pixelSize = pixelSize;
        this.img = img;
    }

    public BufferedImage getTransformedImage() throws InterruptedException {
        PixelGrabber pg = new PixelGrabber(img, 0, 0, width, height, pixels, 0, width);
        pg.grabPixels();
        if ((pg.getStatus() & ImageObserver.ABORT) != 0) {
            return img;
        }

        for (int j = 0; j < height; j+=pixelSize) {
            for (int i = 0; i < width; i+=pixelSize) {
                int pixelHeightEnd = Math.min(j + pixelSize, height);
                int pixelWidthEnd = Math.min(i + pixelSize, width);
                setPixelColorInSquare(j, i, pixelHeightEnd, pixelWidthEnd);
            }
        }

        return img;
    }

    private void setPixelColorInSquare(int heightStart, int widthStart, int pixelHeightEnd, int pixelWidthEnd) {
        Pixel avg = new Pixel(pixels[heightStart * width + widthStart]);

        for (int j = heightStart; j < pixelHeightEnd; j++) {
            for (int i = widthStart; i < pixelWidthEnd; i++) {
                Pixel currentPixel = new Pixel(pixels[j * width + i]);
                avg = avg.getAverage(currentPixel);
            }
        }

        int avgColor = new Color(avg.red, avg.green, avg.blue, avg.alpha).getRGB();

        for (int j = heightStart; j < pixelHeightEnd; j++) {
            for (int i = widthStart; i < pixelWidthEnd; i++) {
                img.setRGB(i, j, avgColor);
            }
        }
    }

    private static class Pixel {
        int alpha;
        int red;
        int green;
        int blue;

        public Pixel(int pixel) {
            alpha = (pixel >> 24) & 0xff;
            red   = (pixel >> 16) & 0xff;
            green = (pixel >>  8) & 0xff;
            blue  = pixel & 0xff;
        }

        public Pixel(int alpha, int red, int green, int blue) {
            this.alpha = alpha;
            this.red = red;
            this.green = green;
            this.blue = blue;
        }

        public Pixel getAverage(Pixel pixel) {
            int newAlpha = (alpha + pixel.alpha) / 2;
            int newRed = (red + pixel.red) / 2;
            int newGreen = (green + pixel.green) / 2;
            int newBlue = (blue + pixel.blue) / 2;

            return new Pixel(newAlpha, newRed, newGreen, newBlue);
        }
    }
}
