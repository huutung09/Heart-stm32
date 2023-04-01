#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <SoftwareSerial.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "Friday"
#define WIFI_PASSWORD "68686868"

// Insert Firebase project API Key
#define API_KEY "AIzaSyCnQCsgOcOpTn2KspUDcC-Skej_BCcXaQM"

// Insert Authorized Email and Corresponding Password
#define USER_EMAIL "dvht09@gmail.com"
#define USER_PASSWORD "123456"

// Insert RTDB URLefine the RTDB URL
#define DATABASE_URL "https://heart-rate-c6264-default-rtdb.firebaseio.com/"

// Define Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Variable to save USER UID
String uid;

// Database main path (to be updated in setup with the user UID)
String databasePath;
// Database child nodes
String heartPath = "/heartRate";
String o2Path = "/spo2";
String tempPath = "/temperature";
String timePath = "/timestamp";

// Parent Node (to be updated in every loop)
String parentPath;
String nowPath;

FirebaseJson json;

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// Variable to save current epoch time
int timestamp;

float temperature;
float humidity;
float pressure;
// Variable to save data from STM32
String result[3];
char rxData[10];
SoftwareSerial serial_ESP(D2, D3); //D2 = RX -- D3 = TX

// Timer variables (send new readings every three minutes)
unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 20000;
unsigned long lastTime = 0;

// Initialize WiFi
void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

// Function that gets current epoch time
unsigned long getTime() {
  timeClient.update();
  unsigned long now = timeClient.getEpochTime();
  return now;
}

void setup() {

  Serial.begin(115200);

  // Open serial communications and wait for port to open:
  pinMode(D2, INPUT);
  pinMode(D3, OUTPUT);
  Serial.begin(115200);
  serial_ESP.begin(115200);

  initWiFi();
  timeClient.begin();

  // Assign the api key (required)
  config.api_key = API_KEY;

  // Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign the RTDB URL (required)
  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);

  // Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

  // Assign the maximum retry of token generation
  config.max_token_generation_retry = 5;

  // Initialize the library with the Firebase authen and config
  Firebase.begin(&config, &auth);

  // Getting the user UID might take a few seconds
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(1000);
  }
  // Print user UID
  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);

  // Update database path
  databasePath = "/UsersData/" + uid;
}

void loop()
{
  lastTime = millis();
  // Receive data
  if (Firebase.ready()  || sendDataPrevMillis == 0)
    serial_ESP.println("1");
  delay(100);
  while (!serial_ESP.available()){
    if(millis() - lastTime > 3000)
      ESP.deepSleep(0);
  }
  String data;
  while (serial_ESP.available())
  {
    char c = serial_ESP.read();
    data += c;
  }
  // Tách chuỗi
  int pos_end = 0;
  for (int i = 0; i < 3; i++) {
    // Tìm vị trí xuất hiện đầu tiên của dấu "#" trong chuỗi str
    pos_end = data.indexOf("#");
    if (pos_end == -1)
    {
      result[i] = data.substring(pos_end + 1);
    }
    else
    {
      result[i] = data.substring(0, pos_end);
      data = data.substring(pos_end + 1);
    }
  }

  Serial.print("HR:");
  Serial.println(result[0]);
  Serial.printf("spo2:");
  Serial.println(result[1]);
  Serial.printf("temp:");
  Serial.println(result[2]);

  // Send new readings to database
  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    //Get current timestamp
    timestamp = getTime();
    Serial.print ("time: ");
    Serial.println (timestamp);

    parentPath = databasePath + "/reading/" + String(timestamp);


    json.set(heartPath.c_str(), result[0]);
    json.set(o2Path.c_str(), result[1]);
    json.set(tempPath.c_str(), result[2]);
    json.set(timePath, String(timestamp));
    Serial.printf("Set json... %s\n", Firebase.RTDB.setJSON(&fbdo, parentPath.c_str(), &json) ? "ok" : fbdo.errorReason().c_str());
    delay(200);
  }

  if (Firebase.ready() && (millis() - sendDataPrevMillis > 1000 || sendDataPrevMillis == 0)) {
    timestamp = getTime();
    Serial.print ("time: ");
    Serial.println (timestamp);

    nowPath = databasePath + "/current";

    json.set(heartPath.c_str(), result[0]);
    json.set(o2Path.c_str(), result[1]);
    json.set(tempPath.c_str(), result[2]);
    json.set(timePath, String(timestamp));
    Serial.printf("Set json... %s\n", Firebase.RTDB.setJSON(&fbdo, nowPath.c_str(), &json) ? "ok" : fbdo.errorReason().c_str());
    delay(200);
  }

}
