#include <XBee.h>
#include <SoftwareSerial.h>
#define LED_BLUE              6    // leader
#define LED_RED               4    // infect
#define LED_GREEN             5    // clear
#define BUTTON                9     // infection toggle
XBee xbee = XBee();
SoftwareSerial xbeeSerial(2, 3);
ZBRxResponse rxResponse = ZBRxResponse();
ZBTxRequest txRequest;
AtCommandRequest atRequest = AtCommandRequest((uint8_t*)slCommand);
AtCommandResponse atResponse;

const uint8_t ELECTIONMESSAGE = 0xB0, ACKNOWLEDGE = 0xB1, VICTORYMESSAGE = 0xB2, INFECTIONMESSAGE = 0xB3, CLEARMESSAGE = 0xB4, DISCOVERYMESSAGE = 0xB5, LEADERRESPONSE = 0xB6;
const uint8_t slCommand[] = {'S', 'L'};
const uint8_t add=0x0000FFFF,addhigh=addhigh,addlow=addlow;
uint8_t DeviceID, leaderID, newDevice; 
uint8_t listID[10];
uint8_t device = 0;
bool Infected = false;
bool Electing = false;
bool Acknowledged = false;
uint32_t electionTimeout, leaderResponseTimeout, immunityTimeout, infectionRebroadcastTimeout;
int button_state = LOW, last_button_state = HIGH;
int debounce_timestamp = 0;
int debounce_delay = 50;
int DeviceID=1;

void setup() {
  Serial.begin(9600);
  xbeeSerial.begin(9600);
  xbee.begin(xbeeSerial);
  delay(2000);
  initLedPins();
  leaderID = DeviceID;
  sendCommand(add, (uint8_t*)&DISCOVERYMESSAGE, 1);
  leaderResponseTimeout = millis() + 6000;
}

void loop() {
  int reading = digitalRead(BUTTON);
  if (reading != last_button_state) debounce_timestamp = millis();
  if (millis() - debounce_timestamp > debounce_delay) {
    if (reading != button_state) {
      button_state = reading;
      if (button_state == LOW) {
        if (leaderID == DeviceID) {
          sendCommand(add, (uint8_t*)&CLEARMESSAGE, 1);
          Infected = false;
        }
        else Infected = true;
      }
    }
  }
  last_button_state = reading;

  setLedStates();
  PacketsRead();
  
  if (Electing && millis() > electionTimeout) {
    Electing = false;
    leaderResponseTimeout = millis() + 6000;
    electionTimeout = millis() + 5000;
    if (Acknowledged) beginElection();
    else {
      sendCommand(add, (uint8_t*)&VICTORYMESSAGE, 1);
      leaderID = DeviceID;
    }
  }
  if (!Electing) {
    if (millis() > leaderResponseTimeout) {
      if (leaderID == DeviceID) {
        sendCommand(add, (uint8_t*) &LEADERRESPONSE, 1);
        leaderResponseTimeout = millis() + 6000 / 3;
      } else {
        beginElection();
      }
    }
    if (leaderID != DeviceID && Infected && millis() > infectionRebroadcastTimeout) {
      sendCommand(add, (uint8_t*) &INFECTIONMESSAGE, 1);
      infectionRebroadcastTimeout = millis() + 4000;
    }
  }
}

void initLedPins(void) {
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  digitalWrite(LED_BLUE, HIGH);
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, HIGH);
}

void setLedStates(void) {
  if (DeviceID == leaderID) {
    digitalWrite(LED_BLUE, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
  } else {
    digitalWrite(LED_BLUE, LOW);
    if (Infected) {
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_RED, HIGH);
    } else {
      digitalWrite(LED_GREEN, HIGH);
      digitalWrite(LED_RED, LOW);
    }
  }
}

void sendCommand(uint32_t destinationID, uint8_t* payload, uint8_t length) {
  if (payload[0] == DISCOVERYMESSAGE || payload[0] == VICTORYMESSAGE) {
    txRequest = ZBTxRequest(XBeeAddress(addlow, add), payload, length);
    xbee.send(txRequest);
  } else {
    if (destinationID == add) {
      for (int i = 0; i < device; i++) {
        txRequest = ZBTxRequest(XBeeAddress(addhigh, listID[i]), payload, length);
        xbee.send(txRequest);
      }
    } else {
      txRequest = ZBTxRequest(XBeeAddress(addhigh, destinationID), payload, length);
      xbee.send(txRequest);
    }
  }
}

void beginElection(void) {
  if (Electing)  return;
  if (millis() < electionTimeout) return;
  else Electing = true;
  Acknowledged = false;
  uint8_t countDevices = 0;
  for (int i = 0; i < device; i++) {
    if (listID[i] > DeviceID) {
      sendCommand(listID[i], (uint8_t*) &ELECTIONMESSAGE, 1);
      countDevices++;
    }
  }
  if (countDevices > 0) electionTimeout = millis() + 1000;
  else electionTimeout = millis();
}

void PacketsRead(void) {
  if (xbee.readPacket(1) && xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
    xbee.getResponse().getZBRxResponse(rxResponse);
    newDevice = rxResponse.getnewDevice().getLsb();
    //    if (newDevice > leaderID) beginElection();     // VERIFY WHETHER YOU ACTUALLY NEED THIS
    bool inList = false;
    for (int i = 0; i < device; i++)
      if (listID[i] == newDevice)
        inList = true;
    if (!inList) listID[device++] = newDevice;
    
    switch (rxResponse.getData(0)) {
      case DISCOVERYMESSAGE:
        if (rxResponse.getDataLength() > 1) {
          memcpy(&leaderID, rxResponse.getData() + 1, sizeof(leaderID));
          if (leaderID < DeviceID) beginElection();
        } else {
          uint8_t msgPayload[5];
          msgPayload[0] = DISCOVERYMESSAGE;
          memcpy(msgPayload + 4, &leaderID, sizeof(leaderID));
          sendCommand(newDevice, msgPayload, 5);
        }
        break;

      case ELECTIONMESSAGE:
        sendCommand(newDevice, (uint8_t*)&ACKNOWLEDGE, 1);
        beginElection();
        break;

      case ACKNOWLEDGE:
        electionTimeout = millis() + 3000 ;
        Acknowledged = true;
        break;

      case VICTORYMESSAGE:
        if (newDevice > DeviceID) {
          leaderID = newDevice;
          Electing = false;
          leaderResponseTimeout = millis() + 6000;
          electionTimeout = millis() + 5000;
        }
        else beginElection();
        break;

      case LEADERRESPONSE:
        if (DeviceID == leaderID) {
          if (newDevice > DeviceID){
            leaderID = newDevice;
            leaderResponseTimeout = millis() + 6000;
          }
        } else leaderResponseTimeout = millis() + 6000;
        break;

      case INFECTIONMESSAGE:
        if (millis() > immunityTimeout && leaderID != DeviceID)
          Infected = true;
        break;

      case CLEARMESSAGE:
        Infected = false;
        immunityTimeout = millis() + 3000;
        break;
    }
  }
}
