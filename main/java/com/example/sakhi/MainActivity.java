package com.example.sakhi;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.telephony.SmsManager;
import android.widget.Button;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;

import android.location.Location;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1;
    private MediaRecorder mediaRecorder;
    private FusedLocationProviderClient fusedLocationClient;
    private String emergencyContact = "9205401056"; // Replace with the actual emergency contact number

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize buttons
        Button btnSos = findViewById(R.id.btnSos);
        Button btnSelfDefense = findViewById(R.id.btnSelfDefense);
        Button btnLegalInfo = findViewById(R.id.btnLegalInfo);
        Button btnCrime = findViewById(R.id.btnCrime);


        // Initialize location client
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // Check and request permissions at the start
        if (!checkPermissions()) {
            requestPermissions();
        }

        // Set up click listener for the SOS button
        btnSos.setOnClickListener(v -> {
            if (checkPermissions()) {
                startSOSFeature();
            } else {
                requestPermissions();
            }
        });

        // Set up click listener for Self-Defense Videos button
        btnSelfDefense.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, SelfDefenseVideosActivity.class);
            startActivity(intent);
        });

        // Set up click listener for Legal Information button
        btnLegalInfo.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, LawsActivity.class);
            startActivity(intent);
        });
    }

    // Method to start the SOS feature
    private void startSOSFeature() {
        startAudioRecording();
        startVideoRecording();
        sendSMSWithLocation();
    }

    // Method to start audio recording
    private void startAudioRecording() {
        mediaRecorder = new MediaRecorder();
        mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
        mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
        mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
        mediaRecorder.setOutputFile(getExternalFilesDir(null) + "/sos_audio.3gp");

        try {
            mediaRecorder.prepare();
            mediaRecorder.start();
            Toast.makeText(this, "Audio recording started", Toast.LENGTH_SHORT).show();
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(this, "Audio recording failed", Toast.LENGTH_SHORT).show();
        }
    }

    // Method to start video recording
    private void startVideoRecording() {
        Intent videoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        Uri videoUri = Uri.parse(getExternalFilesDir(null) + "/sos_video.mp4");
        videoIntent.putExtra(MediaStore.EXTRA_OUTPUT, videoUri);
        startActivityForResult(videoIntent, 0);
    }

    // Method to send SMS with current location
    private void sendSMSWithLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        fusedLocationClient.getLastLocation().addOnSuccessListener(this, new OnSuccessListener<Location>() {
            @Override
            public void onSuccess(Location location) {
                if (location != null) {
                    String message = "SOS! I need help. My location is: https://maps.google.com/?q=" + location.getLatitude() + "," + location.getLongitude();
                    SmsManager smsManager = SmsManager.getDefault();
                    smsManager.sendTextMessage(emergencyContact, null, message, null, null);
                    Toast.makeText(MainActivity.this, "SMS sent with location", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(MainActivity.this, "Unable to get location", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    // Method to check if required permissions are granted
    private boolean checkPermissions() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
    }

    // Method to request permissions if not already granted
    private void requestPermissions() {
        ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.SEND_SMS,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.CAMERA,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
        }, PERMISSION_REQUEST_CODE);
    }

    // Handle the permission request result
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allPermissionsGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allPermissionsGranted = false;
                    break;
                }
            }
            if (allPermissionsGranted) {
                Toast.makeText(this, "Permissions Granted", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Permissions Denied. Some features may not work.", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
