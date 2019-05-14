package com.weatherapp;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.ViewPager;
import android.util.Log;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class CardPagerAdapter extends FragmentStatePagerAdapter implements ViewPager.OnPageChangeListener {

    JSONArray periods;
    LinearLayout main;

    public CardPagerAdapter(FragmentManager fm, JSONArray periods, LinearLayout main){
        super(fm);
        this.periods = periods;
        this.main = main;

        onPageSelected(0);
    }

    @Override
    public Fragment getItem(int position) {

        try {
            JSONObject period = periods.getJSONObject(position);
            Bundle args = new Bundle();
            args.putString("name", period.getString("name"));
            args.putString("icon", period.getString("icon"));

            CardFragment card = new CardFragment();
            card.setArguments(args);
            return card;
        }
        catch (org.json.JSONException err){
            Log.e("Error", err.getMessage());
            Bundle args = new Bundle();
            args.putString("name", "");
            args.putString("icon", "");

            CardFragment card = new CardFragment();
            card.setArguments(args);
            return card;
        }
    }

    @Override
    public int getCount() {
        return periods.length();
    }

    @Override
    public void onPageScrolled(int i, float v, int i1) {}

    @Override
    public void onPageSelected(int position) {
        try {
            JSONObject period = periods.getJSONObject(position);
            TextView title = main.findViewById(R.id.main_title);
            title.setText(period.getString("name"));

            ImageView image = main.findViewById(R.id.main_image);
            new DownloadImageTask(image).execute(period.getString("icon"));

            TextView temp = main.findViewById(R.id.main_temp);
            temp.setText(period.getString("temperature") + " \u00B0" + period.getString("temperatureUnit"));

            TextView wind = main.findViewById(R.id.main_wind);
            wind.setText(period.getString("windSpeed") + " " + period.getString("windDirection"));

            TextView desc = main.findViewById(R.id.main_details);
            desc.setText(period.getString("detailedForecast"));
        }
        catch (JSONException e){
            Log.e("onPageSelected", e.getMessage());
        }
    }

    @Override
    public void onPageScrollStateChanged(int i) {}
}
