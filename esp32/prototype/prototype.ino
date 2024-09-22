#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
#include <fpm.h>
#include <Keypad.h>

// Wi-Fi Credentials
const char* ssid = "WIFI_IOT";
const char* password = "ac7ce9ss2@iot";

// API Endpoints
const char* serverUrl = "http://192.168.1.10/api";
const char* loginEndpoint = "/auth/login";
const char* accessAttemptEndpoint = "/AccessAttempt/attempt";

// Fingerprint Sensor Pins (HardwareSerial)
#define FINGERPRINT_RX_PIN 25
#define FINGERPRINT_TX_PIN 32

SoftwareSerial fserial(2, 3);
FPM finger(&fserial);
FPMSystemParams params;

// Keypad Configuration
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
    {'1', '2', '3', 'A'},
    {'4', '5', '6', 'B'},
    {'7', '8', '9', 'C'},
    {'*', '0', '#', 'D'}
};
byte rowPins[ROWS] = {18, 19, 21, 22};
byte colPins[COLS] = {5, 17, 16, 4};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Relay Configuration
const int RELAY_PIN = 13;
const unsigned long RELAY_ACTIVATION_TIME = 2000; // 2 seconds

// Buffer for Serial Messages
char printfBuf[100];

// Global variables
String enteredPinCode = "";
int currentEmployeeId = -1;
String authToken = "";
uint32_t fingerprintPassword = 0;          // Default password
uint32_t fingerprintAddress = 0xFFFFFFFF;  // Default address
uint8_t fingerprintPacketLen = 2;          // Default packet length

void setup() {
    Serial.begin(115200);
    fserial.begin(57600, SERIAL_8N1, FINGERPRINT_RX_PIN, FINGERPRINT_TX_PIN);

    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);

    Serial.println("Smart Lock System Initializing...");

    connectToWiFi();
    initializeFingerprint();

    Serial.println("System ready. Enter pin code or place finger on sensor.");
}

void loop() {
    char key = keypad.getKey();
    
    if (key) {
        handleKeypadInput(key);
    }
    
    uint8_t imgStatus = finger.getImage();
    if (imgStatus == FINGERPRINT_OK) {
        handleFingerprintInput();
    } else if (imgStatus == FINGERPRINT_NOFINGER) {
        // No finger detected, do nothing
    } else {
        Serial.printf("Error getting image: %d\n", imgStatus);
    }
    
    delay(50);
}

void connectToWiFi() {
    Serial.printf("Connecting to Wi-Fi SSID: %s\n", ssid);
    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWi-Fi connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nFailed to connect to Wi-Fi.");
    }
}

void initializeFingerprint() {
    if (finger.begin(&fserial, fingerprintPassword, fingerprintAddress, fingerprintPacketLen)) {
        if (finger.readParams(&params) == FINGERPRINT_OK) {
            Serial.println("Fingerprint sensor initialized!");
            Serial.printf("Capacity: %d\n", params.capacity);
        } else {
            Serial.println("Failed to read fingerprint parameters!");
        }
    } else {
        Serial.println("Failed to initialize fingerprint sensor!");
    }
}

void handleKeypadInput(char key) {
    if (key >= '0' && key <= '9') {
        enteredPinCode += key;
        Serial.print("*");
    } else if (key == '#') {
        Serial.println();
        verifyPinCode();
    } else if (key == '*') {
        enteredPinCode = "";
        Serial.println("\nPIN cleared. Enter new PIN:");
    } else if (key == 'A') {
        enrollNewFingerprint();
    }
}

void verifyPinCode() {
    if (enteredPinCode.length() == 0) {
        Serial.println("No PIN entered.");
        return;
    }

    DynamicJsonDocument doc(1024);
    doc["Username"] = "DefaultUser";  // You might want to change this
    doc["Password"] = enteredPinCode;

    String jsonString;
    serializeJson(doc, jsonString);

    HTTPClient http;
    http.begin(String(serverUrl) + loginEndpoint);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
        String response = http.getString();
        DynamicJsonDocument responseDoc(1024);
        deserializeJson(responseDoc, response);

        if (responseDoc.containsKey("Token")) {
            authToken = responseDoc["Token"].as<String>();
            Serial.println("Login successful!");
            activateRelay();
        } else {
            Serial.println("Invalid PIN code.");
        }
    } else {
        Serial.printf("Error on login request: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
    enteredPinCode = "";
}

void handleFingerprintInput() {
    if (scanAndMatchFinger()) {
        Serial.println("Fingerprint matched!");
        activateRelay();
    } else {
        Serial.println("Fingerprint not recognized.");
    }
}

bool scanAndMatchFinger() {
    uint8_t status = finger.image2Tz(1);
    if (status != FINGERPRINT_OK) {
        Serial.printf("Image to template failed with status: %d\n", status);
        return false;
    }

    status = finger.match_pair();
    if (status == FINGERPRINT_OK) {
        currentEmployeeId = finger.fingerID;
        return true;
    } else {
        Serial.printf("Match pair failed with status: %d\n", status);
        return false;
    }
}

void enrollNewFingerprint() {
    Serial.println("Enrolling new fingerprint...");
    int id = getFreeID();
    if (id == -1) {
        Serial.println("No free slot for new fingerprint.");
        return;
    }

    Serial.println("Place your finger on the sensor.");
    if (enrollFingerprint(id)) {
        Serial.printf("Fingerprint enrolled successfully with ID %d\n", id);
    } else {
        Serial.println("Failed to enroll fingerprint.");
    }
}

int getFreeID() {
    for (int id = 1; id <= params.capacity; id++) {
        if (finger.loadModel(id) == FINGERPRINT_DBREADFAIL) {
            return id;
        }
    }
    return -1;
}

bool enrollFingerprint(int id) {
    for (uint8_t i = 0; i < 2; i++) {
        Serial.println("Waiting for finger...");
        while (finger.getImage() != FINGERPRINT_OK) {
            delay(100);
        }

        if (finger.image2Tz(i + 1) != FINGERPRINT_OK) {
            Serial.println("Failed to convert image to template.");
            return false;
        }

        Serial.println("Remove finger");
        delay(1000);
        while (finger.getImage() != FINGERPRINT_NOFINGER) {
            delay(100);
        }
    }

    if (finger.createModel() != FINGERPRINT_OK) {
        Serial.println("Failed to create fingerprint model.");
        return false;
    }

    if (finger.storeModel(id) != FINGERPRINT_OK) {
        Serial.println("Failed to store fingerprint model.");
        return false;
    }

    return true;
}

void activateRelay() {
    digitalWrite(RELAY_PIN, HIGH);
    delay(RELAY_ACTIVATION_TIME);
    digitalWrite(RELAY_PIN, LOW);

    // Log access attempt
    logAccessAttempt(true);
}

void logAccessAttempt(bool accessGranted) {
    if (authToken.length() == 0 && currentEmployeeId == -1) {
        Serial.println("No employee identified for logging.");
        return;
    }

    DynamicJsonDocument doc(1024);
    doc["EmployeeId"] = currentEmployeeId != -1 ? currentEmployeeId : 1;  // Assuming 1 is a valid employee ID
    doc["RoomId"] = 1;  // Assuming 1 is a valid room ID
    doc["AttemptType"] = currentEmployeeId != -1 ? "Fingerprint" : "PinCode";
    doc["AccessGranted"] = accessGranted;

    String jsonString;
    serializeJson(doc, jsonString);

    HTTPClient http;
    http.begin(String(serverUrl) + accessAttemptEndpoint);
    http.addHeader("Content-Type", "application/json");
    if (authToken.length() > 0) {
        http.addHeader("Authorization", "Bearer " + authToken);
    }

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
        Serial.println("Access attempt logged successfully.");
    } else {
        Serial.printf("Error logging access attempt: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
    currentEmployeeId = -1;
    authToken = "";
}