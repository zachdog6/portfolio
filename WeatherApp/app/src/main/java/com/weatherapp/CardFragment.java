package com.weatherapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.Image;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.ListFragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.jjoe64.graphview.series.DataPoint;

import org.json.JSONObject;

import java.io.InputStream;

/**
 * used for pager to create list of weekly weather cards
 */
public class CardFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        ViewGroup cardLayout = (ViewGroup) inflater.inflate(
                R.layout.weather_card, container, false);

        Bundle args = getArguments();

        TextView title = cardLayout.findViewById(R.id.card_title);
        title.setText(args.getString("name"));

        ImageView icon = cardLayout.findViewById(R.id.weather_icon);
        new DownloadImageTask(icon).execute(args.getString("icon"));

        return  cardLayout;
    }
}
