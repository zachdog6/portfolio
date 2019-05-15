package com.weatherapp;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.JsonRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.jjoe64.graphview.GraphView;
import com.jjoe64.graphview.helper.StaticLabelsFormatter;
import com.jjoe64.graphview.series.DataPoint;
import com.jjoe64.graphview.series.LineGraphSeries;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {

    static final int GPS_REQUEST_CODE = 1;
    static final int INTERNET_REQUEST_CODE = 2;

    /**
     * listens for update to current location, when it updates weather with new
     * longitude and latitude
     */
    private final LocationListener locationListener = new LocationListener() {
        public void onLocationChanged(Location location) {
            Double longitude = location.getLongitude();
            Double latitude = location.getLatitude();

            getWeatherData(latitude + "," + longitude);
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {}
        @Override
        public void onProviderEnabled(String provider) {}
        @Override
        public void onProviderDisabled(String provider) {}
    };
    LocationManager locationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        updateWeather();

        //TODO make widget
    }

    @Override
    protected void onDestroy(){
        locationManager.removeUpdates(locationListener);
        super.onDestroy();
    }

    /**
     * gets permissions, gets last location, and calls getWeatherData
     */
    private void updateWeather(){

        //request permissions
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    GPS_REQUEST_CODE);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.INTERNET)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.INTERNET},
                    INTERNET_REQUEST_CODE);
        }

        locationManager = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
        Location location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);

        if(location != null) {
            double longitude = location.getLongitude();
            double latitude = location.getLatitude();
            getWeatherData(latitude + "," + longitude);
        }

        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,
                3600000, 0, locationListener);
    }

    /**
     * calls weather.gov for weather info using queryString as location and uses
     * to create new CardPagerAdapter for pager. Also calls drawGraph with results.
     *
     * @param queryString location in form of "longitude,latitude"
     */
    private void getWeatherData(String queryString){
        String url = "https://api.weather.gov/points/" + queryString;

        final RequestQueue queue = Volley.newRequestQueue(this);

        JsonObjectRequest jsonObjReq = new JsonObjectRequest(Request.Method.GET,
                url, null,
                new Response.Listener<JSONObject>() {

                    @Override
                    public void onResponse(JSONObject response) {
                        try {

                            String forecastUrl = response.getJSONObject("properties").getString("forecast");

                            JSONObject location = response.getJSONObject("properties")
                                                            .getJSONObject("relativeLocation")
                                                            .getJSONObject("properties");

                            TextView locationTextBox = findViewById(R.id.location);
                            locationTextBox.setText(location.getString("city") + ", " + location.getString("state"));

                            JsonObjectRequest jsonObjReq = new JsonObjectRequest(Request.Method.GET,
                                    forecastUrl, null,
                                    new Response.Listener<JSONObject>() {
                                        @Override
                                        public void onResponse(JSONObject response) {
                                            try {
                                                JSONArray periods = response.getJSONObject("properties").getJSONArray("periods");

                                                ViewPager mPager = findViewById(R.id.pager);
                                                LinearLayout main = findViewById(R.id.main_layout);
                                                CardPagerAdapter pagerAdapter = new CardPagerAdapter(getSupportFragmentManager(), periods, main);

                                                mPager.setAdapter(pagerAdapter);
                                                mPager.addOnPageChangeListener(pagerAdapter);

                                                drawGraph(periods);
                                            }
                                            catch (org.json.JSONException err){
                                                Log.e("Error", err.getMessage());
                                            }
                                        }
                                    },
                                    new Response.ErrorListener() {
                                        @Override
                                        public void onErrorResponse(VolleyError error) {

                                            Log.e("Error", error.getMessage());
                                        }
                                    });

                            queue.add(jsonObjReq);
                        }
                        catch (org.json.JSONException err){
                            Log.e("Error", err.getMessage());
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {

                        Log.e("Error", error.getMessage());
                    }
                });

        queue.add(jsonObjReq);
    }


    /**
     * draws weekly graph of temperatures
     *
     * @param periods weather info for the week
     */
    public void drawGraph( JSONArray periods){
        try {
            DataPoint[] temps = new DataPoint[periods.length()];
            String[] names = new String[periods.length()];
            for (int i = 0; i < periods.length(); i++) {
                JSONObject period = periods.getJSONObject(i);

                temps[i] = new DataPoint(i, period.getInt("temperature"));

                if (i == 0)
                    names[i] = "";
                else if (i % 2 == 0)
                    names[i] = period.getString("name").substring(0, 3);
            }

            GraphView graph = (GraphView) findViewById(R.id.graph);
            LineGraphSeries<DataPoint> series = new LineGraphSeries<>(temps);

            StaticLabelsFormatter staticLabelsFormatter = new StaticLabelsFormatter(graph);
            staticLabelsFormatter.setHorizontalLabels(names);
            graph.getGridLabelRenderer().setLabelFormatter(staticLabelsFormatter);

            graph.addSeries(series);
        }
        catch (org.json.JSONException err){
            Log.e("Error", err.getMessage());
        }
    }
}
