#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

// ================= WIFI =================
const char* ssid = "cslab";
const char* password = "aksesg31";

// ================= MQTT =================
const char* mqtt_server = "34.55.55.60";
const int mqtt_port = 1883;


const char* topic_data = "myhome/garden/data";
const char* topic_cmd  = "myhome/garden/command";

// ================= PINS =================
#define DHTPIN 16
#define DHTTYPE DHT22

#define RELAY_PIN 19
#define SOIL_PIN 32
#define RAIN_PIN 33
#define WATER_SIGNAL_PIN 34
#define WATER_POWER_PIN 15

DHT dht(DHTPIN, DHTTYPE);

// ================= THRESHOLDS =================
const int SOIL_DRY_THRESHOLD = 2000;
const int RAIN_DETECTED_THRESHOLD = 1000;
const int TANK_EMPTY_RAW = 400;
const int TANK_FULL_RAW  = 1010;

// ================= OBJECTS =================
WiFiClient espClient;
PubSubClient client(espClient);

// ================= STATE =================
bool manualOverride = false;
unsigned long lastSend = 0;
unsigned long lastReconnectAttempt = 0;

// ================= WIFI SETUP =================
void setup_wifi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// ================= MQTT CALLBACK =================
void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  if (String(topic) == topic_cmd) {
    if (msg == "ON") {
      manualOverride = true;
      digitalWrite(RELAY_PIN, HIGH);
    } 
    else if (msg == "OFF") {
      manualOverride = false;
      digitalWrite(RELAY_PIN, LOW);
    }
  }
}

// ================= MQTT RECONNECT (NON-BLOCKING) =================
bool reconnect() {
  if (client.connected()) return true;

  if (millis() - lastReconnectAttempt > 5000) {
    lastReconnectAttempt = millis();
    Serial.print("Connecting to MQTT... ");

    if (client.connect("GardenESP32")) {
      Serial.println("OK");
      client.subscribe(topic_cmd);
      return true;
    } else {
      Serial.print("FAILED, rc=");
      Serial.println(client.state());
    }
  }
  return false;
}

// ================= SENSOR + LOGIC =================
void readAndPublish() {
  // --- Read sensors safely ---
  float t = NAN, h = NAN;
  int soil = 0, rain = 0, rawWater = 0;

  // Temporarily turn off the pump for stable DHT reading
  bool pumpWasOn = digitalRead(RELAY_PIN);
  if (pumpWasOn) digitalWrite(RELAY_PIN, LOW);
  delay(50); // short delay to stabilize voltage

  // Retry mechanism for DHT
  for (int i = 0; i < 3; i++) {
    t = dht.readTemperature();
    h = dht.readHumidity();
    if (!isnan(t) && !isnan(h)) break;
    delay(100);
  }

  // Read soil and rain sensors
  soil = analogRead(SOIL_PIN);
  rain = analogRead(RAIN_PIN);

  // Read water level safely
  digitalWrite(WATER_POWER_PIN, HIGH);
  delay(20);
  rawWater = analogRead(WATER_SIGNAL_PIN);
  digitalWrite(WATER_POWER_PIN, LOW);

  // Restore pump state
  if (pumpWasOn) digitalWrite(RELAY_PIN, HIGH);

  // --- Water level ---
  int waterPct = map(rawWater, 0, TANK_FULL_RAW, 0, 100);
  waterPct = constrain(waterPct, 0, 100);

  // --- Logic ---
  bool isDry = soil > SOIL_DRY_THRESHOLD;
  bool isRaining = rain < RAIN_DETECTED_THRESHOLD;
  bool tankHasWater = rawWater > TANK_EMPTY_RAW;

  String pumpStatus = "OFF";

  if ((isDry && !isRaining && tankHasWater) || manualOverride) {
    if (tankHasWater) {
      digitalWrite(RELAY_PIN, HIGH);
      pumpStatus = "ON";
    } else {
      digitalWrite(RELAY_PIN, LOW);
      manualOverride = false;
      pumpStatus = "OFF (EMPTY)";
    }
  } else {
    digitalWrite(RELAY_PIN, LOW);
  }

  // --- Publish ---
  if (!isnan(t) && !isnan(h)) {
    String payload = "{";
    payload += "\"temp\":" + String(t) + ",";
    payload += "\"hum\":" + String(h) + ",";
    payload += "\"soil\":" + String(soil) + ",";
    payload += "\"rain\":" + String(rain) + ",";
    payload += "\"level\":" + String(waterPct) + ",";
    payload += "\"batt\":100,";
    payload += "\"pump\":\"" + pumpStatus + "\"";
    payload += "}";

    client.publish(topic_data, payload.c_str());
    Serial.println(payload);
  } else {
    Serial.println("DHT read failed after retries");
  }
}


// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(WATER_POWER_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(WATER_POWER_PIN, LOW);

  analogReadResolution(12);

  dht.begin();
  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// ================= LOOP =================
void loop() {
  reconnect();
  client.loop();

  if (millis() - lastSend >= 5000) {
    lastSend = millis();
    readAndPublish();
  }

  yield(); // watchdog safe
}