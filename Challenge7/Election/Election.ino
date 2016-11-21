#include <XBee.h>
#include <SoftwareSerial.h>
#define PIN_BLUE_LED              6    // leader
#define PIN_RED_LED               4    // infect
#define PIN_GREEN_LED             5    // clear
#define PIN_BUTTON                9     // infection toggle

const uint8_t MSG_ELECTION = 0xB0,
              MSG_ACK = 0xB1,
              MSG_VICTORY = 0xB2,
              MSG_INFECTION = 0xB3,
              MSG_CLEAR = 0xB4,
              MSG_DISCOVERY = 0xB5,
              MSG_HEARTBEAT = 0xB6;
const uint8_t slCommand[] = {'S', 'L'};
XBee xbee = XBee();
SoftwareSerial xbeeSerial(2, 3);
ZBRxResponse rxResponse = ZBRxResponse();
ZBTxRequest txRequest;
AtCommandRequest atRequest = AtCommandRequest((uint8_t*)slCommand);
AtCommandResponse atResponse;
uint32_t DeviceID, leaderID, newDevice; 
uint32_t listID[10];
uint8_t device = 0;
bool isInfected = false;

bool isElecting = false, isAcknowledged = false;
uint32_t electionTimeout, leaderHeartbeatTimeout, betweenElectionTimeout;
uint8_t heartbeatsLost = 0;
int button_state = LOW, last_button_state = HIGH;
int debounce_timestamp = 0;
int debounce_delay = 50;
int DeviceID=1;

uint32_t immunityTimeout, infectionRebroadcastTimeout;

void setup() {
  Serial.begin(9600);
  xbeeSerial.begin(9600);
  xbee.begin(xbeeSerial);
  delay(2000);

  initLedPins();
  leaderID = DeviceID;
  sendCommand(0x0000FFFF, (uint8_t*)&MSG_DISCOVERY, 1);
  leaderHeartbeatTimeout = millis() + 6000;
}

void loop() {
  int reading = digitalRead(PIN_BUTTON);
  if (reading != last_button_state) debounce_timestamp = millis();
  if (millis() - debounce_timestamp > debounce_delay) {
    if (reading != button_state) {
      button_state = reading;
      if (button_state == LOW) {
        if (leaderID == DeviceID) {
          sendCommand(0x0000FFFF, (uint8_t*)&MSG_CLEAR, 1);
          isInfected = false;
        }
        else isInfected = true;
      }
    }
  }
  last_button_state = reading;

  setLedStates();
  readAndHandlePackets();
  if (isElecting && millis() > electionTimeout) {
    isElecting = false;
    leaderHeartbeatTimeout = millis() + 6000;
    betweenElectionTimeout = millis() + 5000;
    if (isAcknowledged) beginElection();
    else {
      sendCommand(0x0000FFFF, (uint8_t*)&MSG_VICTORY, 1);
      leaderID = DeviceID;
    }
  }
  if (!isElecting) {
    if (millis() > leaderHeartbeatTimeout) {
      if (leaderID == DeviceID) {
        sendCommand(0x0000FFFF, (uint8_t*) &MSG_HEARTBEAT, 1);
        leaderHeartbeatTimeout = millis() + 6000 / 3;
      } else {
        Serial.println("Leader dead. Relecting");
        beginElection();
      }
    }
    if (leaderID != DeviceID && isInfected && millis() > infectionRebroadcastTimeout) {
      sendCommand(0x0000FFFF, (uint8_t*) &MSG_INFECTION, 1);
      infectionRebroadcastTimeout = millis() + 4000;
    }
  }
}

void initLedPins(void) {
  pinMode(PIN_BLUE_LED, OUTPUT);
  pinMode(PIN_RED_LED, OUTPUT);
  pinMode(PIN_GREEN_LED, OUTPUT);

  digitalWrite(PIN_BLUE_LED, HIGH);
  digitalWrite(PIN_RED_LED, LOW);
  digitalWrite(PIN_GREEN_LED, HIGH);
}

void setLedStates(void) {
  if (DeviceID == leaderID) {
    digitalWrite(PIN_BLUE_LED, HIGH);
    digitalWrite(PIN_GREEN_LED, LOW);
    digitalWrite(PIN_RED_LED, LOW);
  } else {
    digitalWrite(PIN_BLUE_LED, LOW);
    if (isInfected) {
      digitalWrite(PIN_GREEN_LED, LOW);
      digitalWrite(PIN_RED_LED, HIGH);
    } else {
      digitalWrite(PIN_GREEN_LED, HIGH);
      digitalWrite(PIN_RED_LED, LOW);
    }
  }
}


void serialLog(bool in, uint32_t address64, uint8_t payload) {
  if (in)  Serial.print("MSG_IN");
  else Serial.print("                                       MSG_OUT");
  Serial.print(":");
  Serial.print(address64, HEX);
  Serial.print(":");
  switch (payload) {
    case MSG_ELECTION: Serial.println("ELECTION"); break;
    case MSG_ACK: Serial.println("ACK"); break;
    case MSG_VICTORY: Serial.println("VICTORY"); break;
    case MSG_INFECTION: Serial.println("INFECTION");  break;
    case MSG_CLEAR: Serial.println("CLEAR");  break;
    case MSG_DISCOVERY: Serial.println("DISCOVERY"); break;
    case MSG_HEARTBEAT: Serial.println("HEARTBEAT"); break;
  }
}

void sendCommand(uint32_t destinationAddress64, uint8_t* payload, uint8_t length) {
  serialLog(false, destinationAddress64, payload[0]);
  if (payload[0] == MSG_DISCOVERY || payload[0] == MSG_VICTORY) {
    txRequest = ZBTxRequest(XBeeAddress64(0x00000000, 0x0000FFFF), payload, length);
    xbee.send(txRequest);
  } else {
    if (destinationAddress64 == 0x0000FFFF) {
      for (int i = 0; i < device; i++) {
        txRequest = ZBTxRequest(XBeeAddress64(0x0013A200, listID[i]), payload, length);
        xbee.send(txRequest);
      }
    } else {
      txRequest = ZBTxRequest(XBeeAddress64(0x0013A200, destinationAddress64), payload, length);
      xbee.send(txRequest);
    }
  }
}

void beginElection(void) {
  if (isElecting)  return;
  if (millis() < betweenElectionTimeout) return;
  else isElecting = true;
  Serial.println("Began election");
  isAcknowledged = false;
  uint8_t countDevices = 0;
  Serial.println("Candidates:");
  for (int i = 0; i < device; i++) {
    Serial.println(listID[i], HEX);
    if (listID[i] > DeviceID) {
      sendCommand(listID[i], (uint8_t*) &MSG_ELECTION, 1);
      countDevices++;
    }
  }
  if (countDevices > 0) electionTimeout = millis() + 1000;
  else electionTimeout = millis();
}

void readAndHandlePackets(void) {
  if (xbee.readPacket(1) && xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
    xbee.getResponse().getZBRxResponse(rxResponse);
    newDevice = rxResponse.getnewDevice().getLsb();
    //    if (newDevice > leaderID) beginElection();     // VERIFY WHETHER YOU ACTUALLY NEED THIS
    serialLog(true, newDevice, rxResponse.getData(0));

    bool inList = false;
    for (int i = 0; i < device; i++)
      if (listID[i] == newDevice)
        inList = true;
    if (!inList) listID[device++] = newDevice;
    switch (rxResponse.getData(0)) {
      case MSG_DISCOVERY:
        if (rxResponse.getDataLength() > 1) {
          memcpy(&leaderID, rxResponse.getData() + 1, sizeof(leaderID));
          if (leaderID < DeviceID) beginElection();
        } else {
          uint8_t msgPayload[5];
          msgPayload[0] = MSG_DISCOVERY;
          memcpy(msgPayload + 4, &leaderID, sizeof(leaderID));
          sendCommand(newDevice, msgPayload, 5);
        }
        break;

      case MSG_ELECTION:
        sendCommand(newDevice, (uint8_t*)&MSG_ACK, 1);
        beginElection();
        break;

      case MSG_ACK:
        electionTimeout = millis() + 3000 ;
        isAcknowledged = true;
        break;

      case MSG_VICTORY:
        if (newDevice > DeviceID) {
          leaderID = newDevice;
          isElecting = false;
          leaderHeartbeatTimeout = millis() + 6000;
          betweenElectionTimeout = millis() + 5000;
        }
        else beginElection();
        break;

      case MSG_HEARTBEAT:
        if (DeviceID == leaderID) {
          if (newDevice > DeviceID){
            leaderID = newDevice;
            leaderHeartbeatTimeout = millis() + 6000;
          }
        } else leaderHeartbeatTimeout = millis() + 6000;
        break;

      case MSG_INFECTION:
        if (millis() > immunityTimeout && leaderID != DeviceID)
          isInfected = true;
        break;

      case MSG_CLEAR:
        isInfected = false;
        immunityTimeout = millis() + 3000;
        break;
    }
  }
}
