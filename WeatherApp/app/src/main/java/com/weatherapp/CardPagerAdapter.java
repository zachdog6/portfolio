package com.weatherapp;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.util.Log;
import android.widget.LinearLayout;
import android.widget.SeekBar;

import org.json.JSONArray;
import org.json.JSONObject;

public class CardPagerAdapter extends FragmentStatePagerAdapter {

    JSONArray periods;
    LinearLayout main;

    public CardPagerAdapter(FragmentManager fm, JSONArray periods, LinearLayout main){
        super(fm);
        this.periods = periods;
        this.main = main;
    }

    @Override
    public Fragment getItem(int position) {

        try {
            JSONObject period = periods.getJSONObject(position);
            Bundle args = new Bundle();
            args.putString("name", period.getString("name"));
            args.putString("shortForecast", period.getString("shortForecast"));
            args.putString("windSpeed", period.getString("windSpeed"));
            args.putString("temperature", period.getInt("temperature") + " \u00b0F");
            args.putString("icon", period.getString("icon"));
            args.putInt("position", position);
            args.putInt("max", periods.length());

            CardFragment card = new CardFragment();
            card.setArguments(args);
            return card;
        }
        catch (org.json.JSONException err){
            Log.e("Error", err.getMessage());
            Bundle args = new Bundle();
            args.putString("name", "");
            args.putString("shortForecast", err.getMessage());
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
}
