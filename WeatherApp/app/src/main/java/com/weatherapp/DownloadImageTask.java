package com.weatherapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.ImageView;

import java.io.InputStream;

public class DownloadImageTask extends AsyncTask<String, Void, Bitmap> {
    ImageView cardImage;

    public DownloadImageTask(ImageView cardImage) {
        this.cardImage = cardImage;
    }

    /**
     * downloads weather image from url
     *
     * @param urls image url
     * @return downloaded image bitmap
     */
    protected Bitmap doInBackground(String... urls) {
        String url = urls[0];
        Bitmap image = null;
        try {
            InputStream in = new java.net.URL(url).openStream();
            image = BitmapFactory.decodeStream(in);
        } catch (Exception e) {
            Log.e("Error", e.getMessage());
            e.printStackTrace();
        }
        return image;
    }

    /**
     * sets image to given ImageView
     *
     * @param image downloaded image
     */
    protected void onPostExecute(Bitmap image) {
        cardImage.setImageBitmap(image);
    }
}