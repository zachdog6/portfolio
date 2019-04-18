package com.weatherapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.jjoe64.graphview.series.DataPoint;

import org.json.JSONObject;

import java.io.InputStream;

public class CardFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        ViewGroup cardLayout = (ViewGroup) inflater.inflate(
                R.layout.weather_card, container, false);

        Bundle args = getArguments();

        TextView title = cardLayout.findViewById(R.id.card_title);
        title.setText(args.getString("name"));

        TextView desc = cardLayout.findViewById(R.id.weather_desc);
        desc.setText(args.getString("shortForecast"));

        TextView temp = cardLayout.findViewById(R.id.temp);
        temp.setText(args.getString("temperature"));

        TextView wind = cardLayout.findViewById(R.id.wind_speed);
        wind.setText("Wind Speed: " + args.getString("windSpeed"));

        ImageView icon = cardLayout.findViewById(R.id.weather_icon);
        new DownloadImageTask(icon).execute(args.getString("icon"));

        return  cardLayout;
    }

    private class DownloadImageTask extends AsyncTask<String, Void, Bitmap> {
        ImageView cardImage;

        public DownloadImageTask(ImageView cardImage) {
            this.cardImage = cardImage;
        }

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

        protected void onPostExecute(Bitmap image) {
            cardImage.setImageBitmap(image);
        }
    }
}
